import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import RecipeModal from '../components/RecipeModal';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/favorites')
      .then(res => setFavorites(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-dark font-display">Your Cookbook</h1>
        <p className="text-gray-500 mt-2 font-medium">Recipes you've loved and saved.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-32 glass-card">
          <div className="bg-rose-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-500">
            <Heart size={40} fill="currentColor" />
          </div>
          <h3 className="text-2xl font-bold text-gray-400 mb-2">Empty Cookbook</h3>
          <p className="text-gray-400 mb-8 max-w-sm mx-auto">
            Generate recipes and tap the heart icon to save your favorites here.
          </p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <Sparkles size={18} />
            Generate Recipes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favorites.map((recipe, idx) => (
            <RecipeCard key={idx} recipe={recipe} onView={() => setSelected(recipe)} />
          ))}
        </div>
      )}

      {selected && <RecipeModal recipe={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default Favorites;
