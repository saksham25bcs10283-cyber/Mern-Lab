import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children, isLoggedIn }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) {
      setCartItems([]);
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.get('/cart');
      setCartItems(response.data.cart || []);
      setError(null);
    } catch (err) {
      console.error("Failed to load cart", err);
      setError("Unable to load your cart.");
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId) => {
    try {
      const response = await api.post(`/cart/${productId}`);
      setCartItems(response.data.cart);
      return { success: true };
    } catch (err) {
      console.error("Failed to add to cart", err);
      return { success: false, message: err.response?.data?.message || "Failed to add to cart" };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await api.patch(`/cart/${productId}`, { quantity });
      setCartItems(response.data.cart);
      return { success: true };
    } catch (err) {
      console.error("Failed to update quantity", err);
      return { success: false, message: err.response?.data?.message || "Failed to update quantity" };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await api.delete(`/cart/${productId}`);
      setCartItems(response.data.cart);
      return { success: true };
    } catch (err) {
      console.error("Failed to remove from cart", err);
      return { success: false, message: "Failed to remove item" };
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Derived state
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      error,
      cartCount,
      subtotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshCart: fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
