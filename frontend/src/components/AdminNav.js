import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/messages', label: 'Customer Inquiries' },
  { to: '/admin/coupons', label: 'Coupon Management' },
  { to: '/admin/audit-logs', label: 'Audit Logs' },
];

const AdminNav = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="bg-gray-800 border-b border-gray-700 w-full">
      <div className="mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-bold text-white">Admin</span>
            </Link>
          </div>
          {/* Hamburger for mobile */}
          <div className="flex sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500 transition"
              aria-controls="admin-mobile-menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
          {/* Desktop nav */}
          <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-pink-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden px-2 pt-2 pb-3 space-y-1 bg-gray-800">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive(link.to)
                  ? 'bg-pink-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default AdminNav;