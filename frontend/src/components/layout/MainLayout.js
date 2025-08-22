import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon, UserIcon, HeartIcon, MenuIcon, XIcon } from '@heroicons/react/24/outline';

const MainLayout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img src="/images/judiths-haven-logo.png" alt="Judith's Haven logo" className="h-12 w-auto" /><span className="sr-only">Judith's Haven</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-pink-600">Home</Link>
              <Link to="/products" className="text-gray-700 hover:text-pink-600">Products</Link>
              <Link to="/categories" className="text-gray-700 hover:text-pink-600">Categories</Link>
              <Link to="/about" className="text-gray-700 hover:text-pink-600">About</Link>
              <Link to="/contact" className="text-gray-700 hover:text-pink-600">Contact</Link>
            </div>

            {/* Icons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/wishlist" className="text-gray-700 hover:text-pink-600">
                <HeartIcon className="h-6 w-6" />
              </Link>
              <Link to="/cart" className="text-gray-700 hover:text-pink-600">
                <ShoppingCartIcon className="h-6 w-6" />
              </Link>
              <Link to="/account" className="text-gray-700 hover:text-pink-600">
                <UserIcon className="h-6 w-6" />
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-pink-600 focus:outline-none"
                aria-label="Open menu"
              >
                {mobileMenuOpen ? (
                  <XIcon className="h-6 w-6" />
                ) : (
                  <MenuIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-2 bg-white rounded shadow-lg z-50 absolute left-0 right-0 px-4 py-4">
              <div className="flex flex-col space-y-4">
                <Link to="/" className="text-gray-700 hover:text-pink-600" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link to="/products" className="text-gray-700 hover:text-pink-600" onClick={() => setMobileMenuOpen(false)}>Products</Link>
                <Link to="/categories" className="text-gray-700 hover:text-pink-600" onClick={() => setMobileMenuOpen(false)}>Categories</Link>
                <Link to="/about" className="text-gray-700 hover:text-pink-600" onClick={() => setMobileMenuOpen(false)}>About</Link>
                <Link to="/contact" className="text-gray-700 hover:text-pink-600" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
                <div className="flex space-x-4 pt-2 border-t">
                  <Link to="/wishlist" className="text-gray-700 hover:text-pink-600" onClick={() => setMobileMenuOpen(false)}>
                    <HeartIcon className="h-6 w-6" />
                  </Link>
                  <Link to="/cart" className="text-gray-700 hover:text-pink-600" onClick={() => setMobileMenuOpen(false)}>
                    <ShoppingCartIcon className="h-6 w-6" />
                  </Link>
                  <Link to="/account" className="text-gray-700 hover:text-pink-600" onClick={() => setMobileMenuOpen(false)}>
                    <UserIcon className="h-6 w-6" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-2 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">About Us</h3>
              <p className="mt-4 text-gray-600">
                Judith's Haven offers the finest fashion and beauty products for our valued customers.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
              <ul className="mt-4 space-y-2">
                <li><Link to="/products" className="text-gray-600 hover:text-pink-600">Products</Link></li>
                <li><Link to="/categories" className="text-gray-600 hover:text-pink-600">Categories</Link></li>
                <li><Link to="/about" className="text-gray-600 hover:text-pink-600">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-600 hover:text-pink-600">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Customer Service</h3>
              <ul className="mt-4 space-y-2">
                <li><Link to="/shipping" className="text-gray-600 hover:text-pink-600">Shipping Policy</Link></li>
                <li><Link to="/returns" className="text-gray-600 hover:text-pink-600">Returns & Exchanges</Link></li>
                <li><Link to="/faq" className="text-gray-600 hover:text-pink-600">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Contact Us</h3>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li>Email: info@mamamiracle.com</li>
                <li>Phone: (123) 456-7890</li>
                <li>Address: 123 Fashion Street, Style City</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} Judith's Haven. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;