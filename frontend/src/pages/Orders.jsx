import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to load orders', err);
      setError(err.response?.data?.message || 'Failed to load your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PLACED':
      case 'CONFIRMED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'DELIVERED':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'PENDING_PAYMENT':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col justify-center items-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-red-50 border border-red-200 p-8 rounded-2xl shadow-sm">
          <p className="text-xl font-bold text-red-700 mb-2">Error Loading Orders</p>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center min-h-[50vh]">
        <div className="text-7xl mb-4">📦</div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-3">You have not placed any orders yet.</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Once you complete a purchase, your order history and item details will appear here.
        </p>
        <Link
          to="/products"
          className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Review your recent orders and delivery details</p>
        </div>
        <Link
          to="/products"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          Continue Shopping →
        </Link>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            {/* Order Card Header */}
            <div className="bg-gray-50/70 border-b border-gray-100 px-6 py-4 flex flex-wrap justify-between items-center gap-3">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div>
                  <span className="text-gray-500 text-xs uppercase block">Order ID</span>
                  <span className="font-mono font-semibold text-gray-800">{order._id}</span>
                </div>
                <div className="hidden sm:block text-gray-300">|</div>
                <div>
                  <span className="text-gray-500 text-xs uppercase block">Placed On</span>
                  <span className="text-gray-700 font-medium">{formatDate(order.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                    order.status
                  )}`}
                >
                  {order.status || 'PLACED'}
                </span>
                <span className="text-lg font-extrabold text-gray-900">
                  ₹{order.totalAmount?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6">
              <div className="divide-y divide-gray-100">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 object-contain rounded-lg border border-gray-100 bg-gray-50 p-1 flex-shrink-0"
                        />
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Address & Footer */}
              {order.shippingAddress && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center text-xs text-gray-500 gap-2">
                  <div>
                    <span className="font-semibold text-gray-700">Delivered to: </span>
                    <span>
                      {order.shippingAddress.fullName}, {order.shippingAddress.city},{' '}
                      {order.shippingAddress.pincode}
                    </span>
                  </div>
                  <Link
                    to={`/order-success/${order._id}`}
                    state={{ order }}
                    className="text-blue-600 hover:text-blue-700 font-semibold self-start sm:self-auto hover:underline"
                  >
                    View Order Confirmation →
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
