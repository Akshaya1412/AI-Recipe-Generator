import os
import json
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required,
    get_jwt_identity, verify_jwt_in_request
)
from flask_jwt_extended.exceptions import NoAuthorizationError
from config import Config
from models import (
    db, User, Ingredient, FavoriteRecipe, ShoppingList,
    GeneratedRecipeHistory
)
from recipe_engine import generate_recipes, get_all_suggestion_ingredients
from chatbot_engine import get_chatbot_response
from seed_data import seed_database

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
db.init_app(app)
jwt = JWTManager(app)


def optional_jwt(f):
    """Allow route to work with or without JWT."""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request(optional=True)
        except NoAuthorizationError:
            pass
        return f(*args, **kwargs)
    return decorated


def get_user_id():
    try:
        identity = get_jwt_identity()
        return int(identity) if identity else None
    except Exception:
        return None


# --- Auth Routes ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not name or not email or not password:
        return jsonify({"msg": "Name, email, and password are required"}), 400
    if len(password) < 6:
        return jsonify({"msg": "Password must be at least 6 characters"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "User already exists"}), 400

    user = User(name=name, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({"msg": "User created successfully"}), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify(
            access_token=access_token,
            user={"id": user.id, "name": user.name, "role": user.role}
        ), 200
    return jsonify({"msg": "Bad email or password"}), 401


@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json or {}
    email = data.get('email', '').strip().lower()
    user = User.query.filter_by(email=email).first()
    if user:
        return jsonify({
            "msg": "If an account exists, password reset instructions would be sent to your email.",
            "demo_note": "Demo mode: contact admin or use demo@chefai.com / demo123"
        }), 200
    return jsonify({"msg": "If an account exists, password reset instructions would be sent."}), 200


# --- Ingredients ---

@app.route('/api/ingredients', methods=['GET'])
def get_ingredients():
    search = request.args.get('search', '').strip().lower()
    ingredients = Ingredient.query.order_by(Ingredient.name).all()
    if search:
        ingredients = [i for i in ingredients if search in i.name.lower()]
    suggestions = get_all_suggestion_ingredients()
    return jsonify({
        "ingredients": [{"id": i.id, "name": i.name, "category": i.category} for i in ingredients],
        "suggestions": suggestions
    })


# --- Recipe Generation ---

@app.route('/api/recipes/generate', methods=['POST'])
@optional_jwt
def generate_recipe():
    data = request.json or {}
    ingredients = data.get('ingredients', [])
    prefs = data.get('preferences', {})
    count = min(data.get('count', 3), 5)

    if not ingredients:
        return jsonify({"msg": "Please add at least one ingredient"}), 400

    recipes = generate_recipes(ingredients, prefs, count=count)
    if not recipes:
        return jsonify({"msg": "Could not generate recipes"}), 500

    user_id = get_user_id()
    if user_id:
        for recipe in recipes:
            history = GeneratedRecipeHistory(
                user_id=user_id,
                input_ingredients=", ".join(ingredients),
                recipe_name=recipe['name'],
                recipe_json=recipe
            )
            db.session.add(history)
        db.session.commit()

    return jsonify({"recipes": recipes})


# --- Favorites ---

@app.route('/api/favorites', methods=['GET'])
@jwt_required()
def get_favorites():
    user_id = get_user_id()
    favorites = FavoriteRecipe.query.filter_by(user_id=user_id).all()
    result = []
    for fav in favorites:
        if fav.recipe_data:
            result.append(json.loads(fav.recipe_data) if isinstance(fav.recipe_data, str) else fav.recipe_data)
    return jsonify(result)


@app.route('/api/favorites', methods=['POST'])
@jwt_required()
def add_favorite():
    user_id = get_user_id()
    data = request.json or {}
    recipe = data.get('recipe')
    if not recipe or not recipe.get('name'):
        return jsonify({"msg": "Recipe data required"}), 400

    existing = FavoriteRecipe.query.filter_by(
        user_id=user_id, recipe_name=recipe['name']
    ).first()
    if existing:
        return jsonify({"msg": "Already in favorites"}), 400

    fav = FavoriteRecipe(
        user_id=user_id,
        recipe_name=recipe['name'],
        recipe_data=recipe
    )
    db.session.add(fav)
    db.session.commit()
    return jsonify({"msg": "Added to favorites"}), 201


@app.route('/api/favorites/<recipe_name>', methods=['DELETE'])
@jwt_required()
def remove_favorite(recipe_name):
    user_id = get_user_id()
    fav = FavoriteRecipe.query.filter_by(
        user_id=user_id, recipe_name=recipe_name
    ).first()
    if not fav:
        return jsonify({"msg": "Not found"}), 404
    db.session.delete(fav)
    db.session.commit()
    return jsonify({"msg": "Removed from favorites"})


# --- Shopping List ---

@app.route('/api/shopping-list', methods=['GET'])
@jwt_required()
def get_shopping_list():
    user_id = get_user_id()
    items = ShoppingList.query.filter_by(user_id=user_id).order_by(ShoppingList.created_at.desc()).all()
    return jsonify([{
        "id": i.id,
        "name": i.ingredient_name,
        "quantity": i.quantity or "",
        "checked": i.is_purchased
    } for i in items])


@app.route('/api/shopping-list', methods=['POST'])
@jwt_required()
def add_shopping_items():
    user_id = get_user_id()
    data = request.json or {}
    items = data.get('items', [])
    for item in items:
        name = item.get('name', '').strip()
        if not name:
            continue
        existing = ShoppingList.query.filter_by(
            user_id=user_id, ingredient_name=name, is_purchased=False
        ).first()
        if not existing:
            db.session.add(ShoppingList(
                user_id=user_id,
                ingredient_name=name,
                quantity=item.get('quantity', '')
            ))
    db.session.commit()
    return jsonify({"msg": "Items added"}), 201


@app.route('/api/shopping-list/<int:item_id>', methods=['PATCH'])
@jwt_required()
def toggle_shopping_item(item_id):
    user_id = get_user_id()
    item = ShoppingList.query.filter_by(id=item_id, user_id=user_id).first()
    if not item:
        return jsonify({"msg": "Not found"}), 404
    data = request.json or {}
    if 'checked' in data:
        item.is_purchased = data['checked']
    db.session.commit()
    return jsonify({"msg": "Updated"})


@app.route('/api/shopping-list/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_shopping_item(item_id):
    user_id = get_user_id()
    item = ShoppingList.query.filter_by(id=item_id, user_id=user_id).first()
    if not item:
        return jsonify({"msg": "Not found"}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({"msg": "Deleted"})


# --- Dashboard ---

@app.route('/api/dashboard/stats', methods=['GET'])
@jwt_required()
def get_stats():
    user_id = get_user_id()
    history = GeneratedRecipeHistory.query.filter_by(user_id=user_id).all()
    total_generated = len(history)
    favorites_count = FavoriteRecipe.query.filter_by(user_id=user_id).count()

    ingredient_counts = {}
    difficulty_counts = {"Easy": 0, "Medium": 0, "Hard": 0}
    total_time = 0
    diet_counts = {"vegetarian": 0, "non-vegetarian": 0, "vegan": 0}

    for h in history:
        recipe = h.recipe_json if isinstance(h.recipe_json, dict) else {}
        for ing in h.input_ingredients.split(','):
            ing = ing.strip().title()
            if ing:
                ingredient_counts[ing] = ingredient_counts.get(ing, 0) + 1
        diff = recipe.get('difficulty', 'Easy')
        if diff in difficulty_counts:
            difficulty_counts[diff] += 1
        diet = recipe.get('diet_type', 'vegetarian')
        if diet in diet_counts:
            diet_counts[diet] += 1
        time_str = recipe.get('time', '25 mins')
        import re
        m = re.search(r'(\d+)', str(time_str))
        if m:
            total_time += int(m.group(1))

    most_used = sorted(ingredient_counts.items(), key=lambda x: x[1], reverse=True)[:6]
    avg_time = round(total_time / total_generated) if total_generated else 25

    return jsonify({
        "total_generated": total_generated,
        "favorites_count": favorites_count,
        "most_used_ingredients": [i[0] for i in most_used] or ["Tomato", "Onion", "Eggs"],
        "ingredient_usage": {i[0]: i[1] for i in most_used},
        "difficulty_split": difficulty_counts,
        "diet_split": diet_counts,
        "avg_cooking_time": avg_time
    })


# --- Chatbot ---

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    data = request.json or {}
    query = data.get('query', '').strip()
    if not query:
        return jsonify({"msg": "Query required"}), 400
    response = get_chatbot_response(query)
    return jsonify({"response": response})


# --- Admin ---

@app.route('/api/admin/ingredients', methods=['GET'])
@jwt_required()
def admin_get_ingredients():
    user_id = get_user_id()
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return jsonify({"msg": "Admin access required"}), 403
    ingredients = Ingredient.query.order_by(Ingredient.name).all()
    return jsonify([{"id": i.id, "name": i.name, "category": i.category} for i in ingredients])


@app.route('/api/admin/ingredients', methods=['POST'])
@jwt_required()
def admin_add_ingredient():
    user_id = get_user_id()
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return jsonify({"msg": "Admin access required"}), 403
    data = request.json or {}
    name = data.get('name', '').strip()
    category = data.get('category', 'General').strip()
    if not name:
        return jsonify({"msg": "Name required"}), 400
    if Ingredient.query.filter_by(name=name).first():
        return jsonify({"msg": "Ingredient already exists"}), 400
    ing = Ingredient(name=name, category=category)
    db.session.add(ing)
    db.session.commit()
    return jsonify({"id": ing.id, "name": ing.name, "category": ing.category}), 201


@app.route('/api/admin/ingredients/<int:ing_id>', methods=['DELETE'])
@jwt_required()
def admin_delete_ingredient(ing_id):
    user_id = get_user_id()
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return jsonify({"msg": "Admin access required"}), 403
    ing = Ingredient.query.get(ing_id)
    if not ing:
        return jsonify({"msg": "Not found"}), 404
    db.session.delete(ing)
    db.session.commit()
    return jsonify({"msg": "Deleted"})


@app.route('/api/admin/stats', methods=['GET'])
@jwt_required()
def admin_stats():
    user_id = get_user_id()
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return jsonify({"msg": "Admin access required"}), 403
    return jsonify({
        "total_users": User.query.count(),
        "total_ingredients": Ingredient.query.count(),
        "total_generated": GeneratedRecipeHistory.query.count(),
        "recent_activity": [
            {
                "user": h.user.name if h.user else "Unknown",
                "action": f"Generated {h.recipe_name}",
                "time": h.created_at.strftime("%Y-%m-%d %H:%M") if h.created_at else ""
            }
            for h in GeneratedRecipeHistory.query.order_by(
                GeneratedRecipeHistory.created_at.desc()
            ).limit(10).all()
        ]
    })


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        seed_database()
    app.run(debug=True, port=5000)
