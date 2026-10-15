import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error("Failed to fetch product details:", err);
        setError(err.response?.status === 404 ? "Product not found." : "Something went wrong while loading the product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-8 rounded-xl inline-block w-full">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <h2 className="text-2xl font-bold mb-2">{error || "Product not found"}</h2>
          <p className="text-red-600 mb-6">The product you are looking for might have been removed or is temporarily unavailable.</p>
          <Link to="/products" className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Section */}
          <div className="bg-gray-50 p-8 flex items-center justify-center min-h-[400px] border-b md:border-b-0 md:border-r border-gray-200">
            <img 
              src={product.image} 
              alt={product.name} 
              className="max-w-full max-h-[500px] object-contain mix-blend-multiply"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/600?text=No+Image'; }}
            />
          </div>

          {/* Details Section */}
          <div className="p-8 md:p-12 flex flex-col">
            <div className="mb-2">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
                {product.category}
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>
            
            <div className="text-4xl font-black text-gray-900 mb-6">
              ₹{product.price.toLocaleString('en-IN')}
            </div>
            
            <div className="prose prose-blue prose-lg text-gray-600 mb-8 max-w-none">
              <p>{product.description}</p>
            </div>
            
            <div className="mt-auto pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`font-medium ${product.stock > 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {product.stock > 0 
                      ? product.stock > 10 ? 'In Stock' : `Only ${product.stock} left in stock` 
                      : 'Out of Stock'}
                  </span>
                </div>
              </div>
              
              <button 
                disabled={product.stock === 0}
                className={`w-full py-4 px-8 rounded-xl text-lg font-bold text-white transition-all transform flex justify-center items-center shadow-lg
                  ${product.stock > 0 
                    ? 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 hover:shadow-xl focus:ring-4 focus:ring-blue-300' 
                    : 'bg-gray-400 cursor-not-allowed opacity-70'}`}
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
