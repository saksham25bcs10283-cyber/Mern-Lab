import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../services/api';

const OrderSuccess = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!order && id) {
      const fetchOrder = async () => {
        try {
          const res = await api.get(`/orders/${id}`);
          setOrder(res.data.order);
        } catch (err) {
          console.error('Failed to fetch order', err);
          setError(err.response?.data?.message || 'Unable to load order details');
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [id, order]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">Fetching order confirmation...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border border-red-200 p-8 rounded-2xl">
          <p className="text-xl font-bold text-red-700 mb-2">Order Not Found</p>
          <p className="text-red-600 mb-6">{error || 'Could not find the requested order.'}</p>
          <Link
            to="/orders"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            Go to My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-12 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-4xl mb-6 shadow-sm">
          ✓
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Thank you for shopping with ShopKart. Your payment was verified and your order has been confirmed.
        </p>

        {/* Order Details Card */}
        <div className="bg-gray-50 rounded-2xl p-6 text-left mb-8 border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-gray-200 text-sm">
            <div>
              <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Order ID</span>
              <span className="font-mono font-semibold text-gray-800 break-all">{order._id}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Status</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                {order.status || 'PLACED'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Total Paid</span>
              <span className="font-extrabold text-xl text-blue-600">
                ₹{order.totalAmount?.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Payment ID</span>
              <span className="font-mono text-xs text-gray-700">{order.razorpayPaymentId || 'Test Payment'}</span>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="pt-4 border-b border-gray-200 pb-4 text-sm">
              <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Delivery Address</span>
              <p className="font-semibold text-gray-800">{order.shippingAddress.fullName} ({order.shippingAddress.phone})</p>
              <p className="text-gray-600">
                {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
            </div>
          )}

          {/* Items Purchased Snapshot */}
          <div className="pt-4">
            <span className="text-gray-500 block text-xs uppercase tracking-wider mb-3">Purchased Items ({order.items?.length})</span>
            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-contain rounded bg-white border border-gray-200 p-1"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-800">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/orders"
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all hover:shadow-lg"
          >
            View My Orders
          </Link>
          <Link
            to="/products"
            className="px-8 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
