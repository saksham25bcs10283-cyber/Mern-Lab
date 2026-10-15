import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderSuccess from './pages/OrderSuccess';
import { CartProvider } from './context/CartContext';
import api from './services/api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check initial login status when the app loads
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get('/customers/me');
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50/50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <CartProvider isLoggedIn={isLoggedIn}>
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
          <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          <main>
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              
              <Route 
                path="/register" 
                element={isLoggedIn ? <Navigate to="/home" replace /> : <Register />} 
              />
              
              <Route 
                path="/login" 
                element={isLoggedIn ? <Navigate to="/home" replace /> : <Login setIsLoggedIn={setIsLoggedIn} />} 
              />
              
              <Route 
                path="/home" 
                element={<Home setIsLoggedIn={setIsLoggedIn} />} 
              />

              <Route 
                path="/products" 
                element={isLoggedIn ? <Products /> : <Navigate to="/login" replace />} 
              />

              <Route 
                path="/products/:id" 
                element={isLoggedIn ? <ProductDetails /> : <Navigate to="/login" replace />} 
              />

              <Route 
                path="/wishlist" 
                element={isLoggedIn ? <Wishlist /> : <Navigate to="/login" replace />} 
              />

              <Route 
                path="/cart" 
                element={isLoggedIn ? <Cart /> : <Navigate to="/login" replace />} 
              />

              <Route 
                path="/checkout" 
                element={isLoggedIn ? <Checkout /> : <Navigate to="/login" replace />} 
              />

              <Route 
                path="/orders" 
                element={isLoggedIn ? <Orders /> : <Navigate to="/login" replace />} 
              />

              <Route 
                path="/orders/:id" 
                element={isLoggedIn ? <OrderSuccess /> : <Navigate to="/login" replace />} 
              />

              <Route 
                path="/order-success/:id" 
                element={isLoggedIn ? <OrderSuccess /> : <Navigate to="/login" replace />} 
              />
              
              {/* Catch-all route */}
              <Route path="*" element={<Navigate to={isLoggedIn ? "/home" : "/login"} replace />} />
            </Routes>
          </main>
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
