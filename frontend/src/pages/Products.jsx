import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

// Categories specific to the assignment
const CATEGORIES = ['Electronics', 'Fashion', 'Books', 'Home'];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');

  const [wishlistIds, setWishlistIds] = useState([]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (search.trim()) queryParams.append('search', search.trim());
      if (category !== 'All Categories') queryParams.append('category', category);
      
      const [productsRes, wishlistRes] = await Promise.all([
        api.get(`/products?${queryParams.toString()}`),
        api.get('/wishlist').catch(() => ({ data: { wishlist: [] } }))
      ]);

      setProducts(productsRes.data.products);
      // Store just the IDs for easy lookup
      setWishlistIds(wishlistRes.data.wishlist.map(p => typeof p === 'object' ? p._id : p));
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Something went wrong while loading products.");
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  // Debounce search effect to avoid hitting API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchProducts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Our Products</h1>
          <p className="mt-2 text-lg text-gray-600">Discover exactly what you're looking for.</p>
        </div>
      </div>

      <SearchBar 
        search={search} 
        setSearch={setSearch} 
        category={category} 
        setCategory={setCategory}
        categories={CATEGORIES}
      />

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500 font-medium">Loading products...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-6 rounded-xl flex items-center flex-col justify-center text-center">
           <svg className="w-12 h-12 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           <p className="text-lg font-semibold">{error}</p>
           <button onClick={fetchProducts} className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors font-medium">Try Again</button>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-16 flex flex-col items-center justify-center text-center h-64">
          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <h3 className="text-xl font-medium text-gray-900 mb-1">No products found.</h3>
          <p className="text-gray-500 max-w-sm">We couldn't find any products matching your current search or category filters.</p>
          {(search || category !== 'All Categories') && (
            <button 
              onClick={() => { setSearch(''); setCategory('All Categories'); }} 
              className="mt-6 text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product._id} 
              product={product} 
              initialWishlisted={wishlistIds.includes(product._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
