import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Clock, ChefHat, Heart, Activity, TrendingUp, PieChart as PieChartIcon
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(console.error);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const usage = stats.ingredient_usage || {};
  const labels = Object.keys(usage).length ? Object.keys(usage) : stats.most_used_ingredients;
  const values = Object.keys(usage).length ? Object.values(usage) : labels.map((_, i) => [12, 8, 6, 4, 3, 2][i] || 1);

  const barData = {
    labels,
    datasets: [{
      label: 'Times Used',
      data: values,
      backgroundColor: 'rgba(16, 185, 129, 0.7)',
      borderRadius: 10,
    }],
  };

  const diff = stats.difficulty_split || { Easy: 5, Medium: 3, Hard: 1 };
  const pieData = {
    labels: Object.keys(diff),
    datasets: [{
      data: Object.values(diff),
      backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(239, 68, 68, 0.8)'],
      borderWidth: 0,
    }],
  };

  const diet = stats.diet_split || {};
  const totalDiet = Object.values(diet).reduce((a, b) => a + b, 0) || 1;
  const vegPct = Math.round(((diet.vegetarian || 0) + (diet.vegan || 0)) / totalDiet * 100);

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div>
        <h1 className="text-4xl font-bold text-dark font-display">Culinary Dashboard</h1>
        <p className="text-gray-500 mt-2 font-medium">Your cooking habits, visualized.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Recipes Generated', value: stats.total_generated, icon: ChefHat, color: 'emerald' },
          { label: 'Saved Favorites', value: stats.favorites_count, icon: Heart, color: 'rose' },
          { label: 'Avg Cook Time', value: `${stats.avg_cooking_time}m`, icon: Clock, color: 'amber' },
          { label: 'Plant-Based', value: `${vegPct}%`, icon: Activity, color: 'blue' },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="stat-card"
          >
            <div className={`inline-flex p-3 rounded-2xl bg-${item.color}-50 text-${item.color}-600 mb-4`}>
              <item.icon size={24} />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
            <p className="text-3xl font-bold text-dark mt-1">{item.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="text-emerald-500" />
            Most Used Ingredients
          </h3>
          <div className="h-[350px]">
            <Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>

        <div className="glass-card p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <PieChartIcon className="text-amber-500" />
            Difficulty Split
          </h3>
          <div className="h-[250px]">
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500 font-medium">Vegetarian + Vegan</span>
              <span className="font-bold">{vegPct}%</span>
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${vegPct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
