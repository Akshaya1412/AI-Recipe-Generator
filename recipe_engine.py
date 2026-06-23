"""Local recipe generation engine — no external API required."""

import random
import re

# Pre-built recipe templates matched against user ingredients
RECIPE_TEMPLATES = [
    {
        "name": "Tomato Egg Fried Rice",
        "description": "A quick and flavorful Asian-inspired fried rice using pantry staples.",
        "required": {"rice", "tomato", "onion", "eggs"},
        "optional": {"soy sauce", "garlic", "oil", "salt", "pepper"},
        "steps": [
            "Cook rice and let it cool completely (day-old rice works best).",
            "Heat oil in a wok. Sauté diced onion until translucent.",
            "Add chopped tomato and cook until softened, about 3 minutes.",
            "Push vegetables aside, add beaten eggs and scramble until set.",
            "Add cooled rice, soy sauce, salt and pepper. Stir-fry on high heat.",
            "Toss everything together for 3–4 minutes until well combined. Serve hot."
        ],
        "time": "20 mins",
        "calories": 350,
        "servings": 2,
        "difficulty": "Easy",
        "diet_type": "non-vegetarian",
        "image": "https://images.unsplash.com/photo-1603133872878-684f208fb589?auto=format&fit=crop&q=80&w=800",
        "category": "Asian"
    },
    {
        "name": "Classic Tomato Onion Omelette",
        "description": "A fluffy omelette packed with fresh tomatoes and caramelized onions.",
        "required": {"eggs", "tomato", "onion"},
        "optional": {"milk", "butter", "cheese", "salt", "pepper", "oil"},
        "steps": [
            "Whisk eggs with a splash of milk, salt, and pepper until frothy.",
            "Sauté thinly sliced onion in butter until golden brown.",
            "Add diced tomato and cook for 2 minutes until juices release.",
            "Pour egg mixture over vegetables and cook on medium-low heat.",
            "Fold omelette in half when edges set. Cook 1 more minute and serve."
        ],
        "time": "15 mins",
        "calories": 280,
        "servings": 1,
        "difficulty": "Easy",
        "diet_type": "vegetarian",
        "image": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800",
        "category": "Breakfast"
    },
    {
        "name": "Creamy Tomato Rice Bowl",
        "description": "Comforting one-pot rice with a creamy tomato base.",
        "required": {"rice", "tomato", "milk", "onion"},
        "optional": {"garlic", "butter", "cheese", "basil", "salt"},
        "steps": [
            "Sauté chopped onion and garlic in butter until soft.",
            "Add diced tomatoes and cook until they break down into a sauce.",
            "Stir in uncooked rice and toast for 1 minute.",
            "Add milk and water (2:1 ratio), bring to simmer, cover and cook 18 minutes.",
            "Season with salt, top with cheese and fresh basil. Rest 5 minutes before serving."
        ],
        "time": "30 mins",
        "calories": 420,
        "servings": 3,
        "difficulty": "Medium",
        "diet_type": "vegetarian",
        "image": "https://images.unsplash.com/photo-1516684669130-aa9c4d4d0e0b?auto=format&fit=crop&q=80&w=800",
        "category": "Comfort"
    },
    {
        "name": "Spinach & Egg Scramble",
        "description": "A protein-rich, vibrant breakfast scramble ready in minutes.",
        "required": {"eggs", "spinach"},
        "optional": {"milk", "onion", "garlic", "cheese", "butter", "salt"},
        "steps": [
            "Heat butter in a non-stick pan over medium heat.",
            "Sauté minced garlic and onion if using, for 1 minute.",
            "Add washed spinach and wilt for 2 minutes.",
            "Pour in beaten eggs with milk, gently scramble until just set.",
            "Season with salt, top with cheese, and serve immediately."
        ],
        "time": "10 mins",
        "calories": 220,
        "servings": 1,
        "difficulty": "Easy",
        "diet_type": "vegetarian",
        "image": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800",
        "category": "Breakfast"
    },
    {
        "name": "Garlic Butter Potato Mash",
        "description": "Silky smooth mashed potatoes with roasted garlic and butter.",
        "required": {"potato", "garlic", "milk"},
        "optional": {"butter", "salt", "pepper", "cheese"},
        "steps": [
            "Peel and cube potatoes. Boil in salted water until fork-tender, about 15 minutes.",
            "Meanwhile, roast or sauté minced garlic in butter until golden.",
            "Drain potatoes and mash with warm milk and garlic butter.",
            "Season generously with salt and pepper. Serve with a pat of butter on top."
        ],
        "time": "25 mins",
        "calories": 310,
        "servings": 4,
        "difficulty": "Easy",
        "diet_type": "vegetarian",
        "image": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=800",
        "category": "Side Dish"
    },
    {
        "name": "Chicken Tomato Curry",
        "description": "A hearty one-pan curry with tender chicken in a rich tomato sauce.",
        "required": {"chicken", "tomato", "onion"},
        "optional": {"garlic", "garam masala", "oil", "rice", "salt", "ginger"},
        "steps": [
            "Marinate chicken pieces with salt and garam masala for 15 minutes.",
            "Heat oil and sauté onions until deep golden brown.",
            "Add garlic, ginger, and diced tomatoes. Cook until oil separates.",
            "Add chicken, cover and simmer 20 minutes until cooked through.",
            "Adjust seasoning and serve with steamed rice."
        ],
        "time": "45 mins",
        "calories": 480,
        "servings": 4,
        "difficulty": "Medium",
        "diet_type": "non-vegetarian",
        "image": "https://images.unsplash.com/photo-1585937421612-70a008296fbe?auto=format&fit=crop&q=80&w=800",
        "category": "Indian"
    },
    {
        "name": "Vegan Tomato Lentil Soup",
        "description": "A nourishing, protein-packed soup that's completely plant-based.",
        "required": {"tomato", "onion", "spinach"},
        "optional": {"garlic", "oil", "salt", "pepper", "cumin", "lentils"},
        "steps": [
            "Sauté diced onion and garlic in oil until fragrant.",
            "Add chopped tomatoes and cook until they collapse, about 8 minutes.",
            "Add lentils (if using) and 3 cups water. Simmer 25 minutes.",
            "Stir in spinach until wilted. Season with cumin, salt, and pepper.",
            "Blend partially for a creamy texture. Serve with crusty bread."
        ],
        "time": "35 mins",
        "calories": 190,
        "servings": 4,
        "difficulty": "Easy",
        "diet_type": "vegan",
        "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800",
        "category": "Soup"
    },
    {
        "name": "High-Protein Egg Rice Bowl",
        "description": "A balanced meal bowl perfect for post-workout recovery.",
        "required": {"eggs", "rice", "spinach"},
        "optional": {"soy sauce", "garlic", "oil", "sesame seeds"},
        "steps": [
            "Cook rice according to package directions and keep warm.",
            "Pan-fry eggs sunny-side up or over-easy in a little oil.",
            "Quickly sauté spinach with garlic until just wilted.",
            "Assemble bowl: rice base, spinach, topped with eggs.",
            "Drizzle with soy sauce and sprinkle sesame seeds. Serve immediately."
        ],
        "time": "20 mins",
        "calories": 390,
        "servings": 2,
        "difficulty": "Easy",
        "diet_type": "vegetarian",
        "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
        "category": "Healthy"
    },
]

DIET_FILTERS = {"vegetarian", "non-vegetarian", "vegan"}
TIME_FILTERS = {"15": 15, "30": 30, "60": 60}


def normalize_ingredient(name):
    """Normalize ingredient name for matching."""
    name = name.strip().lower()
    name = re.sub(r"\s+", " ", name)
    # Handle plurals
    if name.endswith("ies"):
        name = name[:-3] + "y"
    elif name.endswith("es") and len(name) > 3:
        name = name[:-2]
    elif name.endswith("s") and not name.endswith("ss"):
        name = name[:-1]
    return name


def parse_time_minutes(time_str):
    """Extract minutes from time string like '20 mins'."""
    match = re.search(r"(\d+)", str(time_str))
    return int(match.group(1)) if match else 30


def score_recipe(template, user_ingredients, preferences):
    """Score recipe by ingredient match and preference fit."""
    required = template["required"]
    optional = template.get("optional", set())

    matched_required = required & user_ingredients
    matched_optional = optional & user_ingredients
    match_ratio = len(matched_required) / max(len(required), 1)

    if match_ratio < 0.5:
        return -1

    score = match_ratio * 100 + len(matched_optional) * 5

    diet = preferences.get("diet_type", "").lower()
    if diet and template["diet_type"] != diet:
        if diet == "vegetarian" and template["diet_type"] == "non-vegetarian":
            return -1
        if diet == "vegan" and template["diet_type"] != "vegan":
            return -1

    max_time = preferences.get("max_time")
    if max_time:
        recipe_mins = parse_time_minutes(template["time"])
        if recipe_mins > int(max_time):
            score -= 30

    difficulty = preferences.get("difficulty")
    if difficulty and template["difficulty"] != difficulty:
        score -= 10

    if preferences.get("low_calorie") and template["calories"] > 300:
        score -= 20
    if preferences.get("high_protein") and template["calories"] < 350:
        score -= 15

    return score


def build_recipe_output(template, user_ingredients):
    """Build recipe JSON from template and user ingredients."""
    required = template["required"]
    optional = template.get("optional", set())
    all_needed = required | optional

    used = []
    for ing in sorted(required | optional):
        if ing in user_ingredients:
            used.append(ing.title())

    missing = []
    for ing in sorted(all_needed - user_ingredients):
        label = ing.title()
        if ing in optional:
            label += " (optional)"
        missing.append(label)

    return {
        "name": template["name"],
        "description": template["description"],
        "steps": template["steps"],
        "time": template["time"],
        "calories": template["calories"],
        "servings": template["servings"],
        "difficulty": template["difficulty"],
        "diet_type": template["diet_type"],
        "used_ingredients": used if used else [i.title() for i in sorted(required & user_ingredients)],
        "missing_ingredients": missing,
        "image": template.get("image"),
        "category": template.get("category", "General"),
    }


def generate_recipes(ingredients, preferences=None, count=3):
    """Generate recipe suggestions from available ingredients."""
    preferences = preferences or {}
    user_ingredients = {normalize_ingredient(i) for i in ingredients if i.strip()}

    if not user_ingredients:
        return []

    scored = []
    for template in RECIPE_TEMPLATES:
        score = score_recipe(template, user_ingredients, preferences)
        if score >= 0:
            scored.append((score, template))

    scored.sort(key=lambda x: x[0], reverse=True)

    if not scored:
        # Fallback: create a custom stir-fry from whatever they have
        custom = _generate_custom_recipe(list(user_ingredients), preferences)
        return [custom]

    results = []
    seen_names = set()
    for _, template in scored[:count]:
        if template["name"] not in seen_names:
            seen_names.add(template["name"])
            results.append(build_recipe_output(template, user_ingredients))

    return results


def _generate_custom_recipe(ingredients, preferences):
    """Generate a custom recipe when no template matches well."""
    names = [i.title() for i in ingredients[:5]]
    diet = preferences.get("diet_type", "non-vegetarian")

    steps = [
        f"Prepare all ingredients: {', '.join(names)}. Wash, peel, and chop as needed.",
        "Heat 2 tablespoons of oil in a large pan over medium-high heat.",
        f"Add harder ingredients first, then softer ones. Sauté for 5–7 minutes.",
        "Season with salt, pepper, and your favorite spices to taste.",
        "Cook until everything is tender and flavors meld together, about 10 minutes.",
        "Taste and adjust seasoning. Serve hot and enjoy your custom creation!"
    ]

    return {
        "name": f"Custom {' & '.join(names[:2])} Stir-Fry",
        "description": f"A creative dish made from your available ingredients: {', '.join(names)}.",
        "steps": steps,
        "time": "25 mins",
        "calories": 320,
        "servings": 2,
        "difficulty": "Easy",
        "diet_type": diet if diet in DIET_FILTERS else "vegetarian",
        "used_ingredients": names,
        "missing_ingredients": ["Oil", "Salt", "Pepper (optional)"],
        "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
        "category": "Custom",
    }


def get_all_suggestion_ingredients():
    """Return all ingredients used across templates for autocomplete."""
    all_ings = set()
    for t in RECIPE_TEMPLATES:
        all_ings |= t["required"]
        all_ings |= t.get("optional", set())
    return sorted(i.title() for i in all_ings)
