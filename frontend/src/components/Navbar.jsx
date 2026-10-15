import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const { cartCount } = useCart();

  const handleLogout = async () => {
    try {
      // Call the logout API (clears the HttpOnly cookie on the backend)
      await api.post('/customers/logout');
      setIsLoggedIn(false);
      navigate('/login');
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/home" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl leading-none">S</span>
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">ShopKart</span>
            </Link>
            
            {isLoggedIn && (
              <div className="ml-10 flex space-x-4">
                <Link to="/products" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Products
                </Link>
                <Link to="/wishlist" className="text-gray-600 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Wishlist ❤️
                </Link>
                <Link to="/cart" className="text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Cart ({cartCount || 0})
                </Link>
                <Link to="/orders" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  My Orders 📦
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 ease-in-out hover:scale-105"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out hover:scale-105"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
