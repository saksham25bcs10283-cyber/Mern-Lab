import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const WishlistCard = ({ product, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async (e) => {
    e.preventDefault();
    if (isRemoving) return;
    setIsRemoving(true);
    await onRemove(product._id);
    setIsRemoving(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col sm:flex-row overflow-hidden h-full sm:h-auto">
      <div className="sm:w-1/3 bg-gray-50 flex items-center justify-center p-4 relative h-48 sm:h-full min-h-[160px]">
        <img 
          src={product.image} 
          alt={product.name} 
          className="max-h-full max-w-full object-contain mix-blend-multiply"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
        />
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-2 left-2 bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-1 rounded-full border border-orange-200">
            Only {product.stock} left
          </span>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow w-full sm:w-2/3">
        <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          {product.category}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <div className="text-xl font-extrabold text-gray-900 mb-4">
          ₹{product.price.toLocaleString('en-IN')}
        </div>
        
        <div className="mt-auto flex flex-col sm:flex-row gap-3">
          <Link 
            to={`/products/${product._id}`}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            View Details
          </Link>
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-red-200 rounded-lg shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            {isRemoving ? '⏳ Removing...' : 'Remove ♥'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
