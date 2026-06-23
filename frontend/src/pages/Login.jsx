import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Mail, Lock, ArrowRight, ChefHat } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid credentials');
    }
  };

  const handleForgot = async () => {
    if (!email) {
      setForgotMsg('Enter your email above first.');
      return;
    }
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setForgotMsg(res.data.msg + (res.data.demo_note ? ` (${res.data.demo_note})` : ''));
    } catch {
      setForgotMsg('Could not process request.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-10 w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ChefHat className="text-emerald-600" size={32} />
          </div>
          <h2 className="text-3xl font-bold mb-2 font-display">Welcome Back</h2>
          <p className="text-gray-500 font-medium">Log in to save favorites & track your cooking.</p>
          <p className="text-xs text-emerald-600 mt-2 font-semibold">Demo: demo@chefai.com / demo123</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-medium border border-red-100">{error}</div>}
          {forgotMsg && <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-sm font-medium border border-emerald-100">{forgotMsg}</div>}

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 tracking-wide uppercase">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                className="input-field pl-12"
                placeholder="chef@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-bold text-gray-700 tracking-wide uppercase">Password</label>
              <button type="button" onClick={handleForgot} className="text-xs font-bold text-emerald-600 hover:underline">
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                className="input-field pl-12"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="w-full btn-primary !py-4 flex items-center justify-center gap-2 text-lg">
            <span>Sign In</span>
            <ArrowRight size={20} />
          </button>
        </form>

        <p className="text-center mt-8 text-gray-500 font-medium">
          New here? <Link to="/register" className="text-emerald-600 font-bold hover:underline">Create an account</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
