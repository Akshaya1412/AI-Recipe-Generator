import React from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Flame, Users, ChefHat, ShoppingCart, ListOrdered } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const RecipeModal = ({ recipe, onClose }) => {
  const { user } = useAuth();

  const addMissingToShopping = async () => {
    if (!user) {
      alert('Please log in to use shopping list!');
      return;
    }
    if (!recipe.missing_ingredients?.length) return;
    try {
      await axios.post('http://localhost:5000/api/shopping-list', {
        items: recipe.missing_ingredients.map(name => ({
          name: name.replace(' (optional)', ''),
          quantity: '',
        })),
      });
      alert('Added to shopping list!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="recipe-modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-64">
          <img
            src={recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800'}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-white transition-colors"
          >
            <X size={20} />
          </button>
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${
              recipe.difficulty === 'Easy' ? 'bg-emerald-500' :
              recipe.difficulty === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
            }`}>
              {recipe.difficulty}
            </span>
            <h2 className="text-3xl font-bold font-display">{recipe.name}</h2>
            <p className="text-white/80 mt-1">{recipe.description}</p>
          </div>
        </div>

        <div className="p-8">
          <div className="flex flex-wrap gap-6 mb-8 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Clock className="text-amber-500" size={20} />
              <span className="font-bold">{recipe.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="text-orange-500" size={20} />
              <span className="font-bold">{recipe.calories} kcal</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="text-blue-500" size={20} />
              <span className="font-bold">{recipe.servings} servings</span>
            </div>
            <div className="flex items-center gap-2">
              <ChefHat className="text-emerald-500" size={20} />
              <span className="font-bold capitalize">{recipe.diet_type}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-bold text-emerald-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                Ingredients Used
              </h3>
              <ul className="space-y-2">
                {recipe.used_ingredients?.map(ing => (
                  <li key={ing} className="text-gray-700 font-medium flex items-center gap-2">
                    <span className="text-emerald-500">✓</span> {ing}
                  </li>
                ))}
              </ul>
            </div>
            {recipe.missing_ingredients?.length > 0 && (
              <div>
                <h3 className="font-bold text-amber-600 mb-3 flex items-center gap-2">
                  <ShoppingCart size={16} />
                  Missing Ingredients
                </h3>
                <ul className="space-y-2 mb-3">
                  {recipe.missing_ingredients.map(ing => (
                    <li key={ing} className="text-gray-600 font-medium flex items-center gap-2">
                      <span className="text-amber-500">+</span> {ing}
                    </li>
                  ))}
                </ul>
                {user && (
                  <button onClick={addMissingToShopping} className="btn-secondary text-sm !py-2">
                    Add to Shopping List
                  </button>
                )}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-bold text-dark mb-4 flex items-center gap-2 text-lg">
              <ListOrdered className="text-emerald-500" />
              Step-by-Step Instructions
            </h3>
            <ol className="space-y-4">
              {recipe.steps?.map((step, idx) => (
                <li key={idx} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </span>
                  <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RecipeModal;
