import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Footer = () => {
  useEffect(() => {
    AOS.init({ duration: 900, once: true, offset: 40 });
  }, []);

  return (
    <footer className="bg-gradient-to-t from-pink-200 via-blue-100 to-white text-gray-900 shadow-inner pt-8 pb-2 font-sans animate-fade-in w-full" role="contentinfo">
      <div className="container mx-auto px-4 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 animate-fade-in">
          <div>
            <h3 className="text-base md:text-lg font-extrabold font-display mb-2 md:mb-4 tracking-tight text-pink-600">About Us</h3>
            <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
              Judith's Haven is your one-stop destination for style & comfort. We offer a wide range of clothing and accessories for all occasions.
            </p>
          </div>
          <div>
            <h3 className="text-base md:text-lg font-extrabold font-display mb-2 md:mb-4 tracking-tight text-pink-600">Quick Links</h3>
            <ul className="space-y-1 md:space-y-2" aria-label="Footer quick links">
              <li>
                <Link to="/" className="text-gray-600 hover:text-pink-600 font-medium transition-colors text-xs md:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400">Home</Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-600 hover:text-pink-600 font-medium transition-colors text-xs md:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400">Products</Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-600 hover:text-pink-600 font-medium transition-colors text-xs md:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400">Cart</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-base md:text-lg font-extrabold font-display mb-2 md:mb-4 tracking-tight text-pink-600">Contact Us</h3>
            <ul className="space-y-1 md:space-y-2 text-gray-600 text-xs md:text-sm">
              <li>Email: info@mamamiracle.com</li>
              <li>Phone: +1 234 567 890</li>
              <li>Address: 123 Fashion Street, Style City</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-300 mt-8 pt-4 text-center text-gray-400 text-xs animate-fade-in">
          <p>&copy; {new Date().getFullYear()} Judith's Haven. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;