"""Seed database with sample ingredients and admin user."""

from models import db, User, Ingredient


SAMPLE_INGREDIENTS = [
    ("Tomato", "Vegetables"),
    ("Onion", "Vegetables"),
    ("Eggs", "Protein"),
    ("Rice", "Grains"),
    ("Milk", "Dairy"),
    ("Chicken", "Protein"),
    ("Garlic", "Vegetables"),
    ("Potato", "Vegetables"),
    ("Spinach", "Vegetables"),
    ("Butter", "Dairy"),
    ("Cheese", "Dairy"),
    ("Oil", "Pantry"),
    ("Soy Sauce", "Pantry"),
    ("Garam Masala", "Spices"),
    ("Salt", "Pantry"),
    ("Pepper", "Spices"),
    ("Ginger", "Vegetables"),
    ("Bread", "Grains"),
    ("Lentils", "Legumes"),
    ("Basil", "Herbs"),
]


def seed_database():
    """Populate database with initial data if empty."""
    if Ingredient.query.count() == 0:
        for name, category in SAMPLE_INGREDIENTS:
            db.session.add(Ingredient(name=name, category=category))
        db.session.commit()

    if not User.query.filter_by(email="admin@chefai.com").first():
        admin = User(name="Admin", email="admin@chefai.com", role="admin")
        admin.set_password("admin123")
        db.session.add(admin)
        db.session.commit()

    if not User.query.filter_by(email="demo@chefai.com").first():
        demo = User(name="Demo Chef", email="demo@chefai.com", role="user")
        demo.set_password("demo123")
        db.session.add(demo)
        db.session.commit()
