import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      {/* Sidebar */}
      <div
        className={`fixed z-50 inset-y-0 left-0 w-64 bg-white shadow-md transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-200 ease-in-out md:static md:translate-x-0 md:w-64 md:block`}
      >
        <div className="p-4 border-b flex items-center justify-between md:justify-center">
          <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
          <button
            className="md:hidden p-2"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <XMarkIcon className="h-6 w-6 text-gray-700" />
          </button>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/admin/orders"
                className={`flex items-center p-2 rounded-md ${
                  isActive('/admin/orders')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Orders
              </Link>
            </li>
            <li>
              <Link
                to="/admin/products"
                className={`flex items-center p-2 rounded-md ${
                  isActive('/admin/products')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                Products
              </Link>
            </li>
            <li>
              <Link
                to="/admin/users"
                className={`flex items-center p-2 rounded-md ${
                  isActive('/admin/users')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                Users
              </Link>
            </li>
            <li>
              <Link
                to="/admin/categories"
                className={`flex items-center p-2 rounded-md ${
                  isActive('/admin/categories')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Categories
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="flex items-center p-2 rounded-md text-gray-600 hover:bg-gray-50"
                onClick={() => setSidebarOpen(false)}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Back to Store
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      {/* Sidebar hamburger for mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md bg-white shadow-md"
          aria-label="Open sidebar"
        >
          <Bars3Icon className="h-6 w-6 text-gray-700" />
        </button>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;