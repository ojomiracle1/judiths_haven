import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { toast } from 'react-toastify';
import NotificationBell from './NotificationBell';

const Header = () => {
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const logoutHandler = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      dispatch(logout());
      toast.success('Logged out successfully');
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/70 backdrop-blur-md shadow-lg py-2'
          : 'bg-white/40 backdrop-blur-sm py-4'
      }`}
      style={{ borderBottomLeftRadius: '1.5rem', borderBottomRightRadius: '1.5rem' }}
    >
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only absolute left-2 top-2 bg-pink-600 text-white px-4 py-2 rounded z-50 focus:outline-none focus:ring-2 focus:ring-pink-400">
        Skip to main content
      </a>
      <nav className="container mx-auto px-2 sm:px-4" aria-label="Main navigation">
        <div className="flex flex-wrap justify-between items-center gap-y-2">
          <Link to="/" className="flex items-center text-lg sm:text-2xl font-extrabold text-gray-800 gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400">
            <img src="/images/judiths-haven-logo.png" alt="Judith's Haven logo" className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg shadow-md" loading="lazy" />
            Judith's Haven
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link to="/cart" className="relative group">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 sm:w-7 sm:h-7 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.5 17h9a1 1 0 00.85-1.53L17 13M7 13V6a4 4 0 018 0v7" />
              </svg>
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {cartItems.length}
                </span>
              )}
            </Link>
            <NotificationBell />
            {user ? (
              <>
                <Link to="/profile" className="text-sm sm:text-base font-medium text-gray-700 hover:text-pink-600 transition-colors">
                  {user.name}
                </Link>
                <button
                  className="ml-2 text-xs sm:text-sm px-2 py-1 rounded bg-pink-500 text-white hover:bg-pink-600 transition-colors"
                  onClick={logoutHandler}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="text-sm sm:text-base font-medium text-pink-600 hover:underline">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;