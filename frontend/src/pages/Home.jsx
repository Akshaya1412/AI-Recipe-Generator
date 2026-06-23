import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, X, Sparkles, Clock, Leaf, ChefHat,
  Utensils, Flame, Filter, ChevronDown
} from 'lucide-react';
import RecipeCard from '../components/RecipeCard';
import RecipeModal from '../components/RecipeModal';
import { useAuth } from '../context/AuthContext';

const DIET_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian', icon: Leaf },
  { value: 'non-vegetarian', label: 'Non-Veg', icon: Utensils },
  { value: 'vegan', label: 'Vegan', icon: Leaf },
];

const TIME_OPTIONS = [
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '60', label: '1 hour' },
];

const Home = () => {
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState([]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [preferences, setPreferences] = useState({
    diet_type: 'vegetarian',
    max_time: '',
    difficulty: '',
    low_calorie: false,
    high_protein: false,
  });
  const inputRef = useRef(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/ingredients')
      .then(res => setSuggestions(res.data.suggestions || []))
      .catch(() => setSuggestions(['Tomato', 'Onion', 'Eggs', 'Rice', 'Milk', 'Chicken', 'Garlic', 'Potato', 'Spinach']));
  }, []);

  const filteredSuggestions = suggestions.filter(
    s => s.toLowerCase().includes(input.toLowerCase()) && !ingredients.includes(s)
  ).slice(0, 8);

  const addIngredient = (ing) => {
    const trimmed = (ing || input).trim();
    if (trimmed && !ingredients.some(i => i.toLowerCase() === trimmed.toLowerCase())) {
      setIngredients([...ingredients, trimmed.charAt(0).toUpperCase() + trimmed.slice(1)]);
      setInput('');
    }
  };

  const removeIngredient = (ing) => {
    setIngredients(ingredients.filter(i => i !== ing));
  };

  const generateRecipe = async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/recipes/generate', {
        ingredients,
        preferences,
        count: 3,
      });
      setRecipes(res.data.recipes || []);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to generate recipes. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const quickAdd = (items) => {
    const newItems = items.filter(i => !ingredients.some(existing => existing.toLowerCase() === i.toLowerCase()));
    setIngredients([...ingredients, ...newItems]);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero */}
      <section className="relative mb-16 overflow-hidden rounded-[2.5rem] hero-gradient p-10 md:p-16 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl">🍳</div>
          <div className="absolute bottom-10 right-10 text-8xl animate-float">🥗</div>
          <div className="absolute top-1/2 right-1/4 text-6xl opacity-50">🍅</div>
        </div>
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6"
          >
            <Sparkles size={16} />
            <span>No API key needed — works offline!</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold font-display mb-4 leading-tight"
          >
            What's in your fridge?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/90 text-lg md:text-xl font-medium"
          >
            Enter ingredients you have — get recipes, steps, calories & shopping lists instantly.
          </motion.p>
          {!user && (
            <p className="mt-4 text-white/70 text-sm">
              Generate recipes as a guest, or <a href="/login" className="underline font-bold text-white">log in</a> to save favorites & track history.
            </p>
          )}
        </div>
      </section>

      {/* Quick presets */}
      <div className="flex flex-wrap gap-3 mb-8 justify-center">
        <span className="text-gray-500 text-sm font-semibold self-center">Quick add:</span>
        {[
          { label: '🍳 Breakfast', items: ['Eggs', 'Milk', 'Tomato', 'Onion'] },
          { label: '🍚 Asian', items: ['Rice', 'Eggs', 'Soy Sauce', 'Garlic'] },
          { label: '🥗 Healthy', items: ['Spinach', 'Tomato', 'Eggs', 'Onion'] },
        ].map(preset => (
          <button
            key={preset.label}
            onClick={() => quickAdd(preset.items)}
            className="suggestion-chip"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Input Section */}
      <div className="glass-card p-8 mb-10">
        <div className="flex items-center gap-2 mb-6">
          <ChefHat className="text-emerald-500" size={24} />
          <h2 className="text-xl font-bold">Your Ingredients</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
              className="input-field pl-12"
              placeholder="Type an ingredient (Tomato, Eggs, Rice...)"
            />
            {input && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                {filteredSuggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => addIngredient(s)}
                    className="w-full text-left px-4 py-3 hover:bg-emerald-50 text-sm font-medium transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => addIngredient()} className="btn-primary flex items-center justify-center gap-2">
            <Plus size={20} />
            <span>Add</span>
          </button>
        </div>

        {/* Ingredient chips */}
        <div className="flex flex-wrap gap-2 mb-6 min-h-[40px]">
          <AnimatePresence>
            {ingredients.map(ing => (
              <motion.span
                key={ing}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="ingredient-chip"
                onClick={() => removeIngredient(ing)}
              >
                {ing}
                <X size={14} className="text-emerald-500" />
              </motion.span>
            ))}
          </AnimatePresence>
          {ingredients.length === 0 && (
            <p className="text-gray-400 text-sm italic py-2">Add ingredients above or pick a quick preset...</p>
          )}
        </div>

        {/* Popular suggestions */}
        <div className="flex flex-wrap gap-2 mb-8">
          {suggestions.slice(0, 10).map(s => (
            !ingredients.includes(s) && (
              <button key={s} onClick={() => addIngredient(s)} className="suggestion-chip">
                + {s}
              </button>
            )
          ))}
        </div>

        {/* Filters */}
        <div className="border-t border-gray-100 pt-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-600 font-semibold mb-4 hover:text-emerald-600 transition-colors"
          >
            <Filter size={18} />
            <span>Dietary & Time Filters</span>
            <ChevronDown size={18} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 mb-4">
                  {DIET_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setPreferences({ ...preferences, diet_type: opt.value })}
                      className={`filter-pill ${preferences.diet_type === opt.value ? 'filter-pill-active' : 'filter-pill-inactive'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {TIME_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setPreferences({
                        ...preferences,
                        max_time: preferences.max_time === opt.value ? '' : opt.value
                      })}
                      className={`filter-pill ${preferences.max_time === opt.value ? 'filter-pill-active' : 'filter-pill-inactive'}`}
                    >
                      <Clock size={14} className="inline mr-1" />
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setPreferences({ ...preferences, low_calorie: !preferences.low_calorie })}
                    className={`filter-pill ${preferences.low_calorie ? 'filter-pill-active' : 'filter-pill-inactive'}`}
                  >
                    <Flame size={14} className="inline mr-1" />
                    Low Calorie
                  </button>
                  <button
                    onClick={() => setPreferences({ ...preferences, high_protein: !preferences.high_protein })}
                    className={`filter-pill ${preferences.high_protein ? 'filter-pill-active' : 'filter-pill-inactive'}`}
                  >
                    High Protein
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={generateRecipe}
            disabled={ingredients.length === 0 || loading}
            className={`btn-primary flex items-center gap-3 px-10 py-4 text-lg ${loading || ingredients.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Cooking up ideas...</span>
              </>
            ) : (
              <>
                <Sparkles size={22} />
                <span>Generate Recipes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card overflow-hidden">
              <div className="h-56 loading-shimmer" />
              <div className="p-6 space-y-3">
                <div className="h-6 loading-shimmer rounded-lg w-3/4" />
                <div className="h-4 loading-shimmer rounded-lg w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && recipes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="text-amber-500" />
            {recipes.length} Recipe{recipes.length > 1 ? 's' : ''} Found
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe, idx) => (
              <RecipeCard
                key={`${recipe.name}-${idx}`}
                recipe={recipe}
                onView={() => setSelectedRecipe(recipe)}
              />
            ))}
          </div>
        </div>
      )}

      {recipes.length === 0 && !loading && (
        <div className="text-center py-20">
          <div className="bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Utensils size={48} className="text-emerald-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-400 mb-2 font-display">Your future meal waits here</h3>
          <p className="text-gray-400 max-w-md mx-auto">Add a few ingredients and hit Generate to discover delicious recipes tailored to what you have.</p>
        </div>
      )}

      {selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
    </div>
  );
};

export default Home;
