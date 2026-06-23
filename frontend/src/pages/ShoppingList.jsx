import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, CheckCircle2, Trash2, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ShoppingList = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [newQty, setNewQty] = useState('');

  const fetchItems = () => {
    axios.get('http://localhost:5000/api/shopping-list')
      .then(res => setItems(res.data))
      .catch(console.error);
  };

  useEffect(() => { fetchItems(); }, []);

  const toggleItem = async (item) => {
    await axios.patch(`http://localhost:5000/api/shopping-list/${item.id}`, { checked: !item.checked });
    setItems(items.map(i => i.id === item.id ? { ...i, checked: !i.checked } : i));
  };

  const deleteItem = async (id) => {
    await axios.delete(`http://localhost:5000/api/shopping-list/${id}`);
    setItems(items.filter(i => i.id !== id));
  };

  const addItem = async () => {
    if (!newItem.trim()) return;
    await axios.post('http://localhost:5000/api/shopping-list', {
      items: [{ name: newItem.trim(), quantity: newQty.trim() }],
    });
    setNewItem('');
    setNewQty('');
    fetchItems();
  };

  const pending = items.filter(i => !i.checked);
  const done = items.filter(i => i.checked);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-dark font-display flex items-center gap-3">
            <ShoppingCart className="text-amber-500" />
            Shopping List
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            {pending.length} item{pending.length !== 1 ? 's' : ''} to buy
          </p>
        </div>
      </div>

      <div className="glass-card p-6 flex gap-3 flex-wrap">
        <input
          className="input-field flex-1 min-w-[200px]"
          placeholder="Ingredient name"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <input
          className="input-field w-32"
          placeholder="Qty"
          value={newQty}
          onChange={(e) => setNewQty(e.target.value)}
        />
        <button onClick={addItem} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add
        </button>
      </div>

      <div className="glass-card divide-y divide-gray-50">
        <AnimatePresence>
          {items.length === 0 ? (
            <div className="p-16 text-center text-gray-400">
              <ShoppingCart size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">No items yet. Generate a recipe and add missing ingredients!</p>
            </div>
          ) : (
            [...pending, ...done].map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleItem(item)}
                    className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${
                      item.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200 hover:border-emerald-400'
                    }`}
                  >
                    {item.checked && <CheckCircle2 size={16} />}
                  </button>
                  <div>
                    <p className={`font-bold ${item.checked ? 'text-gray-300 line-through' : 'text-dark'}`}>
                      {item.name}
                    </p>
                    {item.quantity && (
                      <p className="text-xs text-gray-400 font-semibold uppercase">{item.quantity}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors p-2 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ShoppingList;
