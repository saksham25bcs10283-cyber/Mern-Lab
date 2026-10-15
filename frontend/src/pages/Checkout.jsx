import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { cartItems, subtotal, cartCount, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Phone number must be a valid 10-digit number';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^[0-9]{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Pincode must contain exactly 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError(null);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setServerError(null);

    try {
      // Step 1: Ensure Razorpay SDK is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setServerError('Razorpay SDK failed to load. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // Step 2: Request server to validate cart, stock, and create orders
      const orderRes = await api.post('/orders/create-payment-order', {
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          addressLine1: formData.addressLine1.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
      });

      const orderData = orderRes.data;

      // Step 3: Open Razorpay Standard Checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ShopKart',
        description: `ShopKart Order #${orderData.shopKartOrderId}`,
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: formData.fullName.trim(),
          contact: formData.phone.trim(),
        },
        theme: {
          color: '#2563eb',
        },
        handler: async function (response) {
          try {
            setLoading(true);
            // Step 4: Verify payment signature on backend
            const verifyRes = await api.post('/orders/verify-payment', {
              shopKartOrderId: orderData.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              // Step 5: Clear frontend global cart state and navigate to order confirmation
              clearCart();
              navigate(`/order-success/${orderData.shopKartOrderId}`, {
                state: { order: verifyRes.data.order },
              });
            }
          } catch (verifyErr) {
            console.error('Signature verification error:', verifyErr);
            setServerError(
              verifyErr.response?.data?.message ||
                'Payment verification failed. Your cart was preserved.'
            );
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', function (failResponse) {
        console.error('Payment failed', failResponse.error);
        setServerError(
          `Payment failed: ${failResponse.error?.description || 'Transaction was declined'}. Your cart has not been cleared.`
        );
        setLoading(false);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error('Order creation error:', err);
      setServerError(
        err.response?.data?.message || 'Failed to initialize payment order. Please try again.'
      );
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-6">Please add items to your cart before proceeding to checkout.</p>
        <Link
          to="/products"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-all"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link to="/cart" className="text-blue-600 hover:underline text-sm font-medium">
          ← Back to Cart
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-2">Checkout</h1>
      </div>

      {serverError && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <strong className="font-semibold">Checkout Error:</strong> {serverError}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Shipping Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>📍</span> Shipping Details
          </h2>

          <form onSubmit={handlePlaceOrder} className="space-y-5" noValidate>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="e.g. Aarav Sharma"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.fullName ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors`}
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="10-digit mobile"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.phone ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  maxLength="6"
                  placeholder="6-digit pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.pincode ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors`}
                />
                {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                id="addressLine1"
                name="addressLine1"
                type="text"
                placeholder="House / Flat No., Street, Area"
                value={formData.addressLine1}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.addressLine1 ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors`}
              />
              {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="e.g. Bengaluru"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.city ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors`}
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  placeholder="e.g. Karnataka"
                  value={formData.state}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.state ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors`}
                />
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-6 py-4 px-6 rounded-xl text-white font-bold text-lg shadow-md transition-all flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-[0.99]'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Opening Razorpay Checkout...</span>
                </>
              ) : (
                <>
                  <span>💳</span>
                  <span>Pay ₹{subtotal.toLocaleString('en-IN')} with Razorpay</span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">
              🔒 Powered by Razorpay Standard Checkout (Test Mode)
            </p>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>🧾</span> Order Summary ({cartCount} {cartCount === 1 ? 'item' : 'items'})
            </h2>

            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1 mb-6">
              {cartItems.map((item) => (
                <div key={item.product._id} className="py-3 flex items-center gap-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-14 h-14 object-contain rounded-lg border border-gray-100 bg-gray-50 p-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 truncate">{item.product.name}</h3>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity} × ₹{item.product.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-sm font-bold text-gray-900">
                    ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-gray-100 pt-4 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-medium text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
              <span className="text-base font-bold text-gray-900">Total Payable</span>
              <span className="text-2xl font-extrabold text-blue-600">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="mt-6 bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-xs text-blue-800">
              💡 <strong>Test Mode Note:</strong> This transaction uses Razorpay Test Mode. You can use standard test UPI or dummy cards. No real money will be charged.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
