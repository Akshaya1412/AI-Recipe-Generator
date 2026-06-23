"""Rule-based cooking assistant — no external API required."""

SUBSTITUTIONS = {
    "milk": "You can substitute milk with yogurt (curd), coconut milk, oat milk, or almond milk. For baking, mix 1 cup water + 1 tbsp vinegar as a buttermilk substitute.",
    "curd": "Curd (yogurt) works great as a milk substitute in curries and marinades. Use equal amounts. For baking, thin it with a little water.",
    "yogurt": "Yogurt can replace sour cream, mayonnaise, or milk in many recipes. Use plain yogurt for savory dishes.",
    "butter": "Replace butter with olive oil (3/4 the amount), coconut oil, or mashed avocado in baking.",
    "egg": "For binding: mix 1 tbsp flaxseed + 3 tbsp water per egg. For baking: 1/4 cup applesauce or mashed banana per egg.",
    "eggs": "For binding: mix 1 tbsp flaxseed + 3 tbsp water per egg. For baking: 1/4 cup applesauce or mashed banana per egg.",
    "rice": "Substitute rice with quinoa, cauliflower rice, or couscous for a lighter meal.",
    "onion": "Use shallots, leeks, or onion powder (1 tsp = 1 medium onion) as substitutes.",
    "tomato": "Canned tomatoes, tomato paste (1 tbsp + water), or red bell pepper puree work well.",
    "garlic": "Garlic powder (1/8 tsp = 1 clove) or minced ginger adds similar aromatic depth.",
    "chicken": "Replace with tofu, paneer, chickpeas, or mushrooms for a vegetarian version.",
    "oil": "Use butter, ghee, coconut oil, or broth for sautéing depending on the dish.",
}

SPICE_TIPS = [
    "Add a pinch of cayenne or red chili flakes for heat.",
    "Fresh ginger and garlic boost warmth and depth.",
    "A splash of hot sauce or sriracha at the end adds a kick.",
    "Toast whole spices in oil before adding other ingredients.",
    "Add green chilies slit lengthwise for controlled spice.",
    "Mix in garam masala or paprika for smoky warmth.",
]

QUICK_RECIPES = [
    "Tomato & Egg Scramble — 10 mins, uses eggs + tomato + onion.",
    "Garlic Butter Toast — 5 mins, uses bread + garlic + butter.",
    "Quick Fried Rice — 15 mins, uses rice + eggs + any vegetables.",
    "Spinach Omelette — 10 mins, uses eggs + spinach + onion.",
    "Tomato Soup — 15 mins, uses tomato + onion + garlic + milk.",
]


def get_chatbot_response(query):
    """Generate a helpful cooking response from user query."""
    q = query.lower().strip()

    if not q:
        return "Ask me about substitutions, spice tips, quick recipes, or cooking techniques!"

    # Substitutions
    if "substitut" in q or "replace" in q or "instead of" in q or "swap" in q:
        for ingredient, answer in SUBSTITUTIONS.items():
            if ingredient in q:
                return answer
        return "Common swaps: milk ↔ curd/yogurt, butter ↔ oil, eggs ↔ flax egg (1 tbsp flax + 3 tbsp water). Tell me which ingredient you'd like to replace!"

    # Spicier
    if "spicy" in q or "spice" in q or "hot" in q or "heat" in q:
        import random
        tip = random.choice(SPICE_TIPS)
        return f"To make your dish spicier: {tip} Start small — you can always add more!"

    # Quick / 15 min
    if "15 min" in q or "quick" in q or "fast" in q or "short" in q:
        recipes = "\n".join(f"• {r}" for r in QUICK_RECIPES)
        return f"Here are some quick ideas:\n{recipes}\n\nEnter those ingredients on the home page to get full step-by-step recipes!"

    # Healthy breakfast
    if "breakfast" in q and ("healthy" in q or "egg" in q or "milk" in q):
        return (
            "Healthy breakfast ideas with eggs & milk:\n"
            "• Protein Omelette — whisk eggs with milk, add spinach and tomato.\n"
            "• Overnight Oats — mix oats, milk, honey; top with fruits next morning.\n"
            "• Egg White Scramble — use 2 egg whites + 1 whole egg with vegetables.\n"
            "• Smoothie Bowl — blend milk, banana, and a spoon of oats.\n\n"
            "Add eggs, milk, and spinach on the home page for personalized recipes!"
        )

    # Vegan
    if "vegan" in q:
        return "For vegan cooking: swap eggs with tofu scramble, use plant milk, replace butter with coconut oil, and try nutritional yeast for cheesy flavor. Select 'Vegan' filter when generating recipes!"

    # Vegetarian
    if "vegetarian" in q:
        return "Great vegetarian options: Tomato Rice Bowl, Spinach Egg Scramble, Garlic Potato Mash, and Creamy Tomato Soup. Use the Vegetarian filter on the home page for best matches!"

    # Calories / healthy
    if "calorie" in q or "healthy" in q or "low fat" in q:
        return "For lower calories: use steaming or grilling instead of frying, swap cream with yogurt, load up on vegetables, and try the 'Low Calorie' filter. Spinach & Egg Scramble (220 kcal) is a great choice!"

    # Protein
    if "protein" in q:
        return "High-protein picks: eggs, chicken, and legumes. Try the High-Protein filter! The High-Protein Egg Rice Bowl packs ~390 kcal with excellent protein content."

    # General cooking tips
    if "how to" in q or "how do" in q:
        if "cook rice" in q:
            return "Perfect rice: rinse until water runs clear, use 1:2 rice-to-water ratio, bring to boil, cover and simmer 18 min on low, rest 5 min before fluffing."
        if "chop" in q or "cut" in q:
            return "Use a sharp knife, curl fingers under (claw grip), and cut on a stable board. Dice = small cubes, mince = very fine, julienne = thin strips."
        return "I can help with substitutions, spice levels, quick meals, and dietary preferences. Could you be more specific about what you'd like to cook?"

    # Greetings
    if any(w in q for w in ["hi", "hello", "hey", "help"]):
        return "Hello, chef! I can help with:\n• Ingredient substitutions\n• Making dishes spicier\n• Quick 15-minute meals\n• Healthy breakfast ideas\n• Vegan & vegetarian tips\n\nWhat would you like to know?"

    return (
        "I'm your local cooking assistant! Try asking:\n"
        '• "Can I substitute milk with curd?"\n'
        '• "How do I make this recipe spicier?"\n'
        '• "What can I cook in 15 minutes?"\n'
        '• "Suggest a healthy breakfast using eggs and milk."'
    )
