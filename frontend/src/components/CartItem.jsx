import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const product = item.product;

  const handleIncrease = async () => {
    if (isUpdating || item.quantity >= product.stock) return;
    setIsUpdating(true);
    await updateQuantity(product._id, item.quantity + 1);
    setIsUpdating(false);
  };

  const handleDecrease = async () => {
    if (isUpdating || item.quantity <= 1) return;
    setIsUpdating(true);
    await updateQuantity(product._id, item.quantity - 1);
    setIsUpdating(false);
  };

  const handleRemove = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    await removeFromCart(product._id);
    setIsUpdating(false);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center py-6 border-b border-gray-200 gap-6">
      {/* Product Image */}
      <div className="w-full sm:w-32 h-32 flex-shrink-0 bg-gray-50 rounded-xl flex items-center justify-center p-2 relative">
        <img 
          src={product.image} 
          alt={product.name} 
          className="max-h-full max-w-full object-contain mix-blend-multiply"
        />
        {product.stock <= 5 && (
          <span className="absolute -top-2 -right-2 bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-1 rounded-full border border-orange-200">
            Only {product.stock} left
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-grow flex flex-col justify-between w-full">
        <div>
          <Link to={`/products/${product._id}`} className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
            {product.name}
          </Link>
          <p className="text-sm text-gray-500 mt-1">{product.category}</p>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
            <button 
              onClick={handleDecrease}
              disabled={isUpdating || item.quantity <= 1}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
            >
              −
            </button>
            <div className="w-12 h-10 flex items-center justify-center font-semibold text-gray-900 border-x border-gray-300">
              {isUpdating ? <span className="animate-pulse">...</span> : item.quantity}
            </div>
            <button 
              onClick={handleIncrease}
              disabled={isUpdating || item.quantity >= product.stock}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
            >
              +
            </button>
          </div>
          
          <button 
            onClick={handleRemove}
            disabled={isUpdating}
            className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Price Subtotal */}
      <div className="w-full sm:w-auto sm:text-right flex sm:flex-col justify-between sm:justify-center items-center sm:items-end">
        <div className="text-sm text-gray-500 sm:mb-1">
          {item.quantity} × ₹{product.price.toLocaleString('en-IN')}
        </div>
        <div className="text-xl font-bold text-gray-900">
          ₹{(product.price * item.quantity).toLocaleString('en-IN')}
        </div>
      </div>
    </div>
  );
};

export default CartItem;
