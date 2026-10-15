import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, initialWishlisted = false }) => {
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [isWishlisting, setIsWishlisting] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const { addToCart, cartItems } = useCart();

  useEffect(() => {
    setIsWishlisted(initialWishlisted);
  }, [initialWishlisted]);

  const toggleWishlist = async (e) => {
    e.preventDefault(); 
    if (isWishlisting) return;
    
    setIsWishlisting(true);
    try {
      const response = await api.patch(`/wishlist/${product._id}/toggle`);
      setIsWishlisted(response.data.saved);
    } catch (error) {
      console.error("Failed to toggle wishlist", error);
      alert("Unable to save product. Please try again.");
    } finally {
      setIsWishlisting(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (isAddingToCart) return;

    setIsAddingToCart(true);
    const result = await addToCart(product._id);
    if (!result.success) {
      alert(result.message);
    }
    setIsAddingToCart(false);
  };

  const cartItem = cartItems.find(item => item.product._id === product._id || item.product === product._id);
  const inCartCount = cartItem ? cartItem.quantity : 0;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full border border-gray-100">
      <div className="relative h-48 overflow-hidden bg-gray-50 flex items-center justify-center p-4">
        <img 
          src={product.image} 
          alt={product.name} 
          className="max-h-full object-contain mix-blend-multiply transition-transform duration-500 hover:scale-110"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
        />
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-2 right-2 bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full border border-orange-200">
            Only {product.stock} left
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full border border-red-200">
            Out of Stock
          </span>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          {product.category}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2" title={product.name}>
          {product.name}
        </h3>
        
        <div className="mt-auto">
          <div className="text-xl font-extrabold text-gray-900 mb-4">
            ₹{product.price.toLocaleString('en-IN')}
          </div>
          <div className="flex flex-col gap-2">
            <Link 
              to={`/products/${product._id}`}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              View Details
            </Link>
            
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.stock === 0}
              className={`w-full inline-flex justify-center items-center px-4 py-2 border rounded-lg shadow-sm text-sm font-medium transition-colors ${
                product.stock === 0 
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 border-transparent'
              }`}
            >
              {isAddingToCart ? '⏳ Adding...' : inCartCount > 0 ? `Add Another (${inCartCount} in cart)` : '🛒 Add to Cart'}
            </button>

            <button
              onClick={toggleWishlist}
              disabled={isWishlisting}
              className={`w-full inline-flex justify-center items-center px-4 py-2 border rounded-lg shadow-sm text-sm font-medium transition-colors ${
                isWishlisted 
                  ? 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100' 
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              {isWishlisting ? '⏳ Saving...' : isWishlisted ? '♥ Remove from Wishlist' : '♡ Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
