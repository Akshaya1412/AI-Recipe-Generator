import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, LayoutDashboard, Heart, ShoppingCart, LogOut, User as UserIcon, Home } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLink = (to, label, Icon) => (
    <Link
      to={to}
      className={`flex items-center gap-1.5 font-semibold transition-colors ${
        location.pathname === to ? 'text-emerald-600' : 'text-gray-600 hover:text-emerald-600'
      }`}
    >
      {Icon && <Icon size={18} />}
      <span>{label}</span>
    </Link>
  );

  return (
    <nav className="bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-emerald-100/50 shadow-sm">
      <div className="container mx-auto px-4 h-18 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-200 group-hover:scale-105 transition-transform">
            <Utensils className="text-white w-5 h-5" />
          </div>
          <span className="text-2xl font-display font-bold bg-gradient-to-r from-emerald-600 to-amber-500 bg-clip-text text-transparent">
            ChefAI
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {navLink('/', 'Home', Home)}
          {user && (
            <>
              {navLink('/dashboard', 'Dashboard', LayoutDashboard)}
              {navLink('/favorites', 'Favorites', Heart)}
              {navLink('/shopping-list', 'Shop', ShoppingCart)}
              {user.role === 'admin' && navLink('/admin', 'Admin', Utensils)}
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                <UserIcon size={16} className="text-emerald-600" />
                <span className="text-sm font-bold text-emerald-800">{user.name}</span>
              </div>
              <button onClick={handleLogout} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn-secondary text-sm !py-2">Login</Link>
              <Link to="/register" className="btn-primary text-sm !py-2">Join Free</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
