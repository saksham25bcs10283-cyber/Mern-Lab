import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Home = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/customers/me');
        setCustomer(response.data);
        setIsLoggedIn(true);
      } catch (err) {
        // If it fails (e.g., 401 Unauthorized because cookie is missing/expired)
        setIsLoggedIn(false);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, setIsLoggedIn]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex justify-center items-center bg-gray-50/50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

      <div className="max-w-4xl mx-auto relative">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-12 text-white relative">
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight">
                  Welcome back, {customer?.fullName?.split(' ')[0]}! 👋
                </h1>
                <p className="mt-2 text-blue-100 text-lg">
                  Here is a summary of your account details.
                </p>
              </div>
              <div className="mt-6 sm:mt-0">
                <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-md border-4 border-white/30 flex items-center justify-center text-4xl font-bold uppercase shadow-2xl">
                  {customer?.fullName?.charAt(0) || 'S'}
                </div>
              </div>
            </div>
            
            {/* Abstract shapes in header */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-64 h-64 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-0 right-1/4 mb-[-4rem] w-32 h-32 rounded-full bg-white opacity-10"></div>
          </div>

          {/* Profile Details Section */}
          <div className="px-8 py-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Full Name Card */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center text-gray-500 mb-2">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <span className="text-sm font-medium uppercase tracking-wider">Full Name</span>
                </div>
                <p className="text-xl font-semibold text-gray-900">{customer?.fullName}</p>
              </div>

              {/* Email Card */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center text-gray-500 mb-2">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span className="text-sm font-medium uppercase tracking-wider">Email Address</span>
                </div>
                <p className="text-xl font-semibold text-gray-900">{customer?.email}</p>
              </div>

              {/* Phone Card */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center text-gray-500 mb-2">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <span className="text-sm font-medium uppercase tracking-wider">Phone Number</span>
                </div>
                <p className="text-xl font-semibold text-gray-900">{customer?.phone}</p>
              </div>
              
              {/* Status Card */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                 <div className="flex items-center text-gray-500 mb-2">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="text-sm font-medium uppercase tracking-wider">Account Status</span>
                </div>
                <div className="flex items-center mt-1">
                  <span className="flex h-3 w-3 relative mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <p className="text-xl font-semibold text-gray-900">Active</p>
                </div>
              </div>
            </div>
            
            <div className="mt-10 flex justify-end">
               <button className="bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors duration-200">
                  Edit Profile
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
