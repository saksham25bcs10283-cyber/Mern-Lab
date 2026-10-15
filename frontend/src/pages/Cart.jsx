import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

const Cart = () => {
  const { cartItems, loading, error, subtotal, cartCount } = useCart();

  if (loading && cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600 mb-6"></div>
        <p className="text-xl text-gray-600 font-medium">Loading your cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-red-50 border border-red-200 p-8 rounded-2xl shadow-sm">
          <p className="text-xl font-bold text-red-700 mb-2">Unable to load your cart.</p>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center min-h-[60vh]">
        <div className="text-7xl mb-6">🛒</div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-xl text-gray-500 mb-10 max-w-md">
          Looks like you haven't added anything yet. Explore our products and find something you love.
        </p>
        <Link 
          to="/products"
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-sm transition-all hover:-translate-y-1"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">My Cart</h1>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Cart Items Section */}
        <div className="lg:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
            <h2 className="text-lg font-bold text-gray-900">Items ({cartCount})</h2>
          </div>
          
          <div className="flex flex-col">
            {cartItems.map((item) => (
              <CartItem key={item.product._id} item={item} />
            ))}
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Items ({cartCount})</span>
                <span className="font-medium text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span className="font-medium text-gray-900">Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-xl font-extrabold text-gray-900">Subtotal</span>
                <span className="text-2xl font-extrabold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <Link 
              to="/checkout"
              className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
            >
              Proceed to Checkout
            </Link>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              Secure checkout powered by ShopKart
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
