import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Clock, Flame, Users, Heart, ShoppingCart, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RecipeCard = ({ recipe, onView }) => {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(false);
  const [addingShop, setAddingShop] = useState(false);

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (!user) {
      alert('Please log in to save favorites!');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/favorites', { recipe });
      setFavorited(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToShopping = async (e) => {
    e.stopPropagation();
    if (!user) {
      alert('Please log in to use shopping list!');
      return;
    }
    if (!recipe.missing_ingredients?.length) return;
    setAddingShop(true);
    try {
      await axios.post('http://localhost:5000/api/shopping-list', {
        items: recipe.missing_ingredients.map(name => ({
          name: name.replace(' (optional)', ''),
          quantity: '',
        })),
      });
      alert('Missing ingredients added to shopping list!');
    } catch (err) {
      console.error(err);
    } finally {
      setAddingShop(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="glass-card overflow-hidden group cursor-pointer"
      onClick={onView}
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800'}
          alt={recipe.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleFavorite}
            className={`p-2.5 rounded-full shadow-lg transition-all ${
              favorited ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart size={18} fill={favorited ? 'currentColor' : 'none'} />
          </button>
          {recipe.missing_ingredients?.length > 0 && (
            <button
              onClick={handleAddToShopping}
              disabled={addingShop}
              className="bg-white/90 p-2.5 rounded-full shadow-lg text-gray-500 hover:text-emerald-600 transition-colors"
              title="Add missing to shopping list"
            >
              <ShoppingCart size={18} />
            </button>
          )}
        </div>
        <div className="absolute bottom-4 left-4 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            recipe.difficulty === 'Easy' ? 'bg-emerald-500 text-white' :
            recipe.difficulty === 'Medium' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {recipe.difficulty}
          </span>
          {recipe.category && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-gray-700">
              {recipe.category}
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-dark mb-2 group-hover:text-emerald-600 transition-colors line-clamp-1">
          {recipe.name}
        </h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{recipe.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-5">
          <div className="flex items-center gap-1">
            <Clock size={16} className="text-amber-500" />
            <span className="font-semibold">{recipe.time}</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame size={16} className="text-orange-500" />
            <span className="font-semibold">{recipe.calories} kcal</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} className="text-blue-500" />
            <span className="font-semibold">{recipe.servings}</span>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ingredients Used</h4>
          <div className="flex flex-wrap gap-1.5">
            {recipe.used_ingredients?.slice(0, 4).map(ing => (
              <span key={ing} className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                {ing}
              </span>
            ))}
            {recipe.missing_ingredients?.length > 0 && (
              <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg text-xs font-semibold">
                +{recipe.missing_ingredients.length} missing
              </span>
            )}
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onView?.(); }}
          className="w-full btn-primary !rounded-xl flex items-center justify-center gap-2 !py-3"
        >
          <span>View Full Recipe</span>
          <TrendingUp size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default RecipeCard;
