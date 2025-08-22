import React, { useEffect } from 'react';
import WishlistHighlights from '../components/WishlistHighlights';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, removeFromWishlist } from '../features/wishlist/wishlistSlice';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { products, isLoading } = useSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  // Get token from localStorage (or auth state if available)
  const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : '';
  return (
    <main className="container mx-auto px-2 sm:px-4 py-10" aria-labelledby="wishlist-heading">
      <div className="max-w-5xl mx-auto">
        {/* Wishlist Highlights Section */}
        <WishlistHighlights token={token} />
        <h1 id="wishlist-heading" className="text-3xl font-extrabold mb-10 text-primary-700 tracking-tight drop-shadow-lg text-center">My Wishlist</h1>
        {isLoading ? (
          <div className="flex justify-center items-center min-h-32 py-16" role="status" aria-live="polite">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-pink-300" aria-label="Loading wishlist"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-primary-300 text-lg bg-primary-50 rounded-2xl shadow-card-haven max-w-xl mx-auto" role="alert">
            Your wishlist is empty.
          </div>
        ) : (
          <section aria-label="Wishlist products" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <article key={product._id} className="card-haven flex flex-col h-full" tabIndex={0} aria-labelledby={`wishlist-product-${product._id}`}> 
                <Link to={`/product/${product._id}`} tabIndex={0} aria-label={`View details for ${product.name}`}> 
                  <img 
                    src={product.images[0]} 
                    alt={product.name ? `Wishlist product: ${product.name}` : 'Wishlist product image'} 
                    className="w-full h-40 object-cover rounded-xl mb-3 border border-pink-100 shadow-sm transition-transform hover:scale-105" 
                    loading="lazy"
                  />
                  <h2 id={`wishlist-product-${product._id}`} className="text-lg font-semibold text-primary-700 mb-1 truncate">{product.name}</h2>
                </Link>
                <span className="text-pink-500 font-bold mb-2 text-base">₦{product.price}</span>
                <button
                  onClick={() => dispatch(removeFromWishlist(product._id))}
                  className="mt-auto btn-gradient py-2 px-4 rounded-xl font-semibold shadow hover:scale-[1.03] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  aria-label={`Remove ${product.name} from wishlist`}
                >
                  Remove
                </button>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
};

export default Wishlist;
