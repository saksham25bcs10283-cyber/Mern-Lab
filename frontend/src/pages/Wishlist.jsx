import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import WishlistCard from '../components/WishlistCard';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/wishlist');
      setWishlist(response.data.wishlist || []);
    } catch (err) {
      console.error("Failed to load wishlist:", err);
      setError("Unable to load wishlist.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      // Optimistically remove from UI
      setWishlist(current => current.filter(item => item._id !== productId));
    } catch (err) {
      console.error("Failed to remove product from wishlist:", err);
      alert("Failed to remove product. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-pink-500 mb-6"></div>
        <p className="text-xl text-gray-600 font-medium">Loading your wishlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-8 rounded-xl shadow-sm">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong.</h2>
          <p className="text-lg text-red-600 mb-6">{error}</p>
          <button 
            onClick={fetchWishlist}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-6">❤️</div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Your wishlist is empty</h2>
        <p className="text-xl text-gray-500 mb-8 max-w-md">
          Save products you love and find them here later.
        </p>
        <Link 
          to="/products"
          className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-transform hover:scale-105"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            My Wishlist <span className="text-pink-500">❤️</span>
          </h1>
          <p className="mt-2 text-lg text-gray-500">
            {wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/products" className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Continue Shopping
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {wishlist.map(product => (
          <WishlistCard 
            key={product._id} 
            product={product} 
            onRemove={handleRemove} 
          />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
