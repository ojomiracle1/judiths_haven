import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts } from '../features/product/productSlice';
import { getCategories } from '../features/category/categorySlice';
import { ArrowRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import NewsletterSignup from '../components/NewsletterSignup';
import RecommendedProducts from '../components/RecommendedProducts';
import RecentlyViewedProducts from '../components/RecentlyViewedProducts';
import { addToCart } from '../features/cart/cartSlice.backend';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

const Home = () => {
  const dispatch = useDispatch();
  const { products, isLoading: productsLoading, isError: productsError, message: productsMessage } = useSelector((state) => state.product);
  const { categories, isLoading: categoriesLoading, isError: categoriesError, message: categoriesMessage } = useSelector((state) => state.category);
  const [loadTimeout, setLoadTimeout] = useState(false);
  // const [topRated, setTopRated] = useState([]); // Removed unused variable to fix build warning
  const [search, setSearch] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(getProducts());
    dispatch(getCategories());
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => setLoadTimeout(true), 15000); // 15 seconds
    return () => clearTimeout(timeout);
  }, [dispatch]);

  useEffect(() => {
    AOS.init({ duration: 900, once: true, offset: 40 });
  }, []);

  // Get featured products (first 4 products)
  const featuredProducts = products.slice(0, 4);

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    await dispatch(addToCart({ id: product._id, qty: 1 })).unwrap();
  };

  if (productsLoading || categoriesLoading) {
    if (loadTimeout) {
      return (
        <div className="flex flex-col justify-center items-center min-h-screen">
          <div className="text-red-600 font-bold text-lg mb-4">The site is taking too long to load. Please try again later.</div>
        </div>
      );
    }
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }
  if (productsError || categoriesError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-red-600 font-bold text-lg mb-4">Failed to load products or categories.</div>
        <div className="text-gray-500">{productsMessage || categoriesMessage}</div>
      </div>
    );
  }

  // Get token from localStorage (or auth state if available)
  const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : '';
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 text-gray-900 font-sans">
      <Helmet>
        <title>Judith's Haven - Home</title>
        <meta name="description" content="Discover the latest trends in fashion and beauty. Shop our curated collection of premium products." />
        <link rel="canonical" href="https://yourdomain.com/" />
      </Helmet>
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-pink-100/80 via-white/80 to-blue-100/80 rounded-2xl overflow-hidden shadow-2xl mb-8 animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold mb-8 text-center text-primary-700 drop-shadow-lg">{t('welcome')}</h1>
              <p className="mt-3 max-w-md mx-auto text-base sm:text-lg md:mt-5 md:text-xl md:max-w-3xl text-gray-500 animate-fade-in" data-aos="fade-up" data-aos-delay="200">
                Discover the latest trends in fashion and beauty. Shop our curated collection of premium products.
              </p>
              <div className="mt-5 max-w-md mx-auto flex flex-col sm:flex-row sm:justify-center md:mt-8 gap-2 animate-fade-in" data-aos="zoom-in" data-aos-delay="400">
                <Link
                  to="/products"
                  className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-semibold rounded-xl text-primary-700 bg-gradient-to-r from-pink-200 to-blue-200 shadow-lg hover:from-pink-300 hover:to-blue-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all duration-200 btn-gradient"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Search Bar */}
        <section className="max-w-2xl mx-auto mt-8 animate-fade-in" data-aos="fade-up" data-aos-delay="100">
          <form className="flex items-center glass-card px-3 py-2" onSubmit={e => { e.preventDefault(); window.location.href = `/products?search=${encodeURIComponent(search)}`; }} role="search" aria-label="Site search">
            <input
              type="text"
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 px-2 font-medium"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search products"
            />
            <button type="submit" className="p-2 text-pink-600 hover:bg-pink-50 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 transition-all" aria-label="Submit search">
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </button>
          </form>
        </section>

        {/* Featured Products Section */}
        <section data-aos="fade-up" data-aos-delay="200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
            <h2 className="text-xl font-bold mb-4 text-primary-700">{t('products')}</h2>
            <Link
              to="/products"
              className="flex items-center text-pink-600 hover:text-pink-700 font-semibold transition-colors group"
            >
              View All
              <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, idx) => (
              <Link
                key={product._id}
                to={`/product/${product._id}`}
                className="group"
                data-aos="zoom-in"
                data-aos-delay={100 + idx * 100}
              >
                <div className="relative rounded-2xl overflow-hidden bg-white/90 shadow-card hover:shadow-2xl hover:scale-[1.035] transition-all duration-300 flex flex-col backdrop-blur-md card-haven animate-fade-in">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
                    <img
                      src={product.images?.[0] || 'https://via.placeholder.com/400x500/E6E6FA/FFFFFF?text=Product'}
                      alt={product.name}
                      className="w-full h-48 sm:h-64 object-cover object-center group-hover:opacity-80 transition-all duration-200"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x500/E6E6FA/FFFFFF?text=Product';
                      }}
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <h3 className="text-base font-semibold text-gray-800 line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-2">
                      <span className="text-lg font-bold text-primary-600">₦{product.price}</span>
                      <button
                        className="ml-0 sm:ml-auto btn-gradient w-full sm:w-auto font-semibold"
                        onClick={e => handleAddToCart(e, product)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recommended Products Section */}
        <RecommendedProducts token={token} />

        {/* Recently Viewed Products Section */}
        <RecentlyViewedProducts token={token} />

        {/* Categories Section */}
        <section data-aos="fade-up" data-aos-delay="400">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, idx) => (
              <Link
                key={category._id}
                to={`/category/${category._id}`}
                className="group"
                data-aos="zoom-in"
                data-aos-delay={100 + idx * 100}
              >
                <div className="relative rounded-2xl overflow-hidden bg-white/90 shadow-card hover:shadow-2xl transition-shadow duration-300 glass-card animate-fade-in">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
                    <img
                      src={category.image || 'https://via.placeholder.com/400x500/E6E6FA/FFFFFF?text=Category'}
                      alt={category.name}
                      className="w-full h-64 object-cover object-center group-hover:opacity-75 transition-all duration-200"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x500/E6E6FA/FFFFFF?text=Category';
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-opacity duration-300 rounded-2xl">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-xl font-bold text-white drop-shadow-lg">{category.name}</h3>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-gradient-to-r from-pink-100 via-blue-100 to-pink-200 rounded-2xl p-8 mt-12 shadow-xl animate-fade-in" data-aos="fade-up" data-aos-delay="500">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Subscribe to our Newsletter</h2>
          <p className="text-center text-gray-600 mb-4">Get the latest updates, offers, and news straight to your inbox.</p>
          <NewsletterSignup />
        </section>
      </div>
    </div>
  );
};

export default Home;