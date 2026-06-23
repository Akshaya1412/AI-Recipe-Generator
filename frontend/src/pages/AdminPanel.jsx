import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Users, Database, ShieldCheck, Activity, Plus, Trash2 } from 'lucide-react';

const AdminPanel = () => {
  const [ingredients, setIngredients] = useState([]);
  const [stats, setStats] = useState(null);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('General');

  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/ingredients').then(r => setIngredients(r.data)).catch(console.error);
    axios.get('http://localhost:5000/api/admin/stats').then(r => setStats(r.data)).catch(console.error);
  }, []);

  const addIngredient = async () => {
    if (!newName.trim()) return;
    const res = await axios.post('http://localhost:5000/api/admin/ingredients', {
      name: newName.trim(), category: newCategory,
    });
    setIngredients([...ingredients, res.data]);
    setNewName('');
  };

  const deleteIngredient = async (id) => {
    await axios.delete(`http://localhost:5000/api/admin/ingredients/${id}`);
    setIngredients(ingredients.filter(i => i.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="bg-gray-900 p-3 rounded-2xl text-white">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-dark font-display">Admin Panel</h1>
          <p className="text-gray-500 font-medium">Manage ingredients and view activity.</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Login: admin@chefai.com / admin123</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Users', value: stats.total_users },
            { label: 'Ingredients', value: stats.total_ingredients },
            { label: 'Recipes Generated', value: stats.total_generated },
          ].map(s => (
            <div key={s.label} className="glass-card p-6 text-center">
              <p className="text-3xl font-bold text-emerald-600">{s.value}</p>
              <p className="text-sm text-gray-500 font-semibold">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass-card p-8 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Database className="text-emerald-500" />
              Ingredient Master List
            </h3>
          </div>

          <div className="flex gap-2 mb-6">
            <input
              className="input-field flex-1"
              placeholder="New ingredient"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              className="input-field w-36"
              placeholder="Category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button onClick={addIngredient} className="btn-primary !px-4">
              <Plus size={20} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ingredients.map(ing => (
                  <tr key={ing.id} className="group">
                    <td className="py-3 font-bold">{ing.name}</td>
                    <td className="py-3 text-gray-500">{ing.category}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => deleteIngredient(ing.id)}
                        className="text-red-400 hover:text-red-600 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Users className="text-amber-500" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {(stats?.recent_activity || []).map((act, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold">{act.user}</p>
                    <p className="text-xs text-gray-500">{act.action}</p>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">{act.time}</span>
                </div>
              ))}
              {(!stats?.recent_activity?.length) && (
                <p className="text-gray-400 text-sm">No activity yet.</p>
              )}
            </div>
          </div>

          <div className="glass-card p-8 bg-gray-900 text-white border-none">
            <Activity className="text-emerald-400 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">System Status</h3>
            <p className="text-gray-400 text-sm mb-4">
              Local recipe engine active. No API key required. SQLite database running.
            </p>
            <div className="w-full bg-white/10 h-2 rounded-full">
              <div className="bg-emerald-400 h-full w-[95%] rounded-full" />
            </div>
            <p className="text-emerald-400 text-xs font-bold mt-2">All systems operational</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
