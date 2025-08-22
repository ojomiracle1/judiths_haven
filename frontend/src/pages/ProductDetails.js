import React, { useEffect, useState } from 'react';
import RecentlyViewedProducts from '../components/RecentlyViewedProducts';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductById, fetchRelatedProducts } from '../features/product/productSlice';
import { addToCart } from '../features/cart/cartSlice.backend';
import { toast } from 'react-toastify';
import { fetchReviews, addReview, resetReviews } from '../features/reviews/reviewsSlice';
import AOS from 'aos';
import 'aos/dist/aos.css';
import * as yup from 'yup';

const reviewSchema = yup.object().shape({
  rating: yup.number().min(1, 'Rating is required').max(5, 'Rating must be 1-5').required('Rating is required'),
  comment: yup.string().required('Comment is required'),
});

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { product, isLoading, isError, message } = useSelector(
    (state) => state.product
  );
  const { items: reviews, isLoading: reviewsLoading } = useSelector((state) => state.reviews);
  const { user } = useSelector((state) => state.auth);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [related, setRelated] = useState([]);
  const [reviewErrors, setReviewErrors] = useState({});

  useEffect(() => {
    // Check if the ID is a valid MongoDB ObjectId (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    if (!isValidObjectId) {
      toast.error('Invalid product ID');
      navigate('/products');
      return;
    }
    if (isError) {
      toast.error(message);
    }
    dispatch(resetReviews()); // Clear reviews when product changes
    dispatch(getProductById(id));
    dispatch(fetchReviews(id));
  }, [dispatch, id, isError, message, navigate]);

  const handleAddToCart = () => {
    dispatch(addToCart({ id: product._id, qty }));
    navigate('/cart');
  };

  useEffect(() => {
    if (product?._id) {
      dispatch(fetchReviews(product._id));
    }
  }, [dispatch, product?._id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to leave a review.');
      return;
    }
    try {
      await reviewSchema.validate({ rating, comment }, { abortEarly: false });
      setReviewErrors({});
    } catch (validationError) {
      const newErrors = {};
      validationError.inner.forEach(err => {
        newErrors[err.path] = err.message;
      });
      setReviewErrors(newErrors);
      return;
    }
    try {
      await dispatch(addReview({ productId: product._id, rating, comment })).unwrap();
      setRating(0);
      setComment('');
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err?.message || err?.response?.data?.message || 'Failed to submit review.');
    }
  };

  useEffect(() => {
    if (product?._id) {
      dispatch(fetchRelatedProducts(product._id)).unwrap().then(setRelated).catch(() => setRelated([]));
    }
  }, [dispatch, product?._id]);

  useEffect(() => {
    AOS.init({ duration: 900, once: true, offset: 40 });
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/products')}
            className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Get token from localStorage (or auth state if available)
  const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : '';
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 text-gray-900 container mx-auto px-2 sm:px-4 py-8 font-sans animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in" data-aos="fade-up">
        {/* Product Images */}
        <div className="space-y-4">
          <section className="md:w-1/2" aria-label="Product images">
            <img
              src={product.images[selectedImage] || '/images/placeholder.jpg'}
              alt={product.name ? `Product: ${product.name}` : 'Product image'}
              className="w-full h-56 sm:h-80 md:h-96 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/placeholder.jpg';
              }}
              loading="lazy"
            />
          </section>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 sm:gap-4 animate-fade-in" data-aos="fade-up">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`rounded-lg overflow-hidden border ${selectedImage === index ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <img
                    src={image || '/images/placeholder.jpg'}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-12 sm:h-20 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Product Info */}
        <div className="flex flex-col gap-4 animate-fade-in" data-aos="fade-left">
          <section className="md:w-1/2 flex flex-col gap-6" aria-labelledby="product-details-heading">
            <h1 id="product-details-heading" className="text-3xl font-extrabold text-primary-700 mb-2">{product.name}</h1>
            <p className="text-lg text-gray-700 mb-4">{product.description}</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold text-pink-600">₦{product.price}</span>
              <span className="text-sm text-gray-500">({product.numReviews} reviews)</span>
            </div>
            {/* ...existing code... */}
          </section>
          <p className="text-gray-600 text-sm sm:text-base">{product.description}</p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            {product.discount > 0 && product.discountPrice ? (
              <>
                <span className="text-2xl font-bold text-primary-600 line-through opacity-60">₦{product.price}</span>
                <span className="text-2xl font-bold text-red-600">₦{product.discountPrice}</span>
                <span className="text-sm text-green-600 font-semibold">-{product.discount}%</span>
              </>
            ) : (
              <span className="text-2xl font-bold text-primary-600">₦{product.price}</span>
            )}
            <span className="text-sm text-gray-500">In Stock: {product.countInStock}</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <label htmlFor="qty" className="text-sm text-gray-700">Qty:</label>
            <select
              id="qty"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-pink-500 w-full sm:w-24 bg-white/80"
            >
              {[...Array(product.countInStock).keys()].map((x) => (
                <option key={x + 1} value={x + 1}>{x + 1}</option>
              ))}
            </select>
            <button
              className="bg-gradient-to-r from-pink-500 to-blue-500 text-white px-4 py-2 rounded-xl shadow-lg hover:from-pink-600 hover:to-blue-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all w-full sm:w-auto font-semibold btn-gradient"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 pt-6 animate-fade-in" data-aos="fade-up">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Details</h2>
        <div className="space-y-2">
          <p><span className="font-medium">Brand:</span> {product.brand}</p>
          <p><span className="font-medium">Category:</span> {product.category?.name}</p>
          <p><span className="font-medium">Gender:</span> {product.gender}</p>
          {product.sizes && product.sizes.length > 0 && (
            <p><span className="font-medium">Available Sizes:</span> {product.sizes.join(', ')}</p>
          )}
          {product.colors && product.colors.length > 0 && (
            <p><span className="font-medium">Available Colors:</span> {product.colors.join(', ')}</p>
          )}
          {product.features && product.features.length > 0 && (
            <div>
              <span className="font-medium">Features:</span>
              <ul className="list-disc pl-5">
                {product.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-gray-200 pt-6 mt-8 animate-fade-in" data-aos="fade-up">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Reviews</h2>
        {reviewsLoading ? (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-gray-600">No reviews yet.</p>
        ) : (
          <div className="space-y-4 mb-6">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white/80 rounded-xl p-4 shadow-card glass-card animate-fade-in" data-aos="fade-up">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-800">{review.user?.name || 'Anonymous'}</span>
                  <span className="flex items-center">
                    {[1,2,3,4,5].map((star) => (
                      <svg key={star} className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.95-.69l1.07-3.292z" /></svg>
                    ))}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
        <div className="bg-white/90 rounded-xl shadow-card glass-card p-4 mt-4 animate-fade-in" data-aos="fade-up">
          <h3 className="text-lg font-semibold mb-2">Write a Review</h3>
          <form onSubmit={handleReviewSubmit} className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Your Rating:</label>
              {[1,2,3,4,5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <svg className={`h-6 w-6 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.95-.69l1.07-3.292z" /></svg>
                </button>
              ))}
            </div>
            {reviewErrors.rating && <div className="text-red-500 text-sm mt-1">{reviewErrors.rating}</div>}
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white/80"
              rows={3}
              placeholder="Share your experience..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              required
            />
            {reviewErrors.comment && <div className="text-red-500 text-sm mt-1">{reviewErrors.comment}</div>}
            <button
              type="submit"
              className="bg-gradient-to-r from-pink-500 to-blue-500 text-white px-4 py-2 rounded-xl shadow-lg hover:from-pink-600 hover:to-blue-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all font-semibold btn-gradient"
            >
              Submit Review
            </button>
          </form>
        </div>
      </div>

      {/* Related Products Section */}
      {related && related.length > 0 && (
        <div className="border-t border-gray-200 pt-6 mt-8 animate-fade-in" data-aos="fade-up">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {related.map((item, idx) => (
              <div key={item._id} className="bg-white/90 rounded-xl shadow-card glass-card p-2 flex flex-col items-center animate-fade-in" data-aos="zoom-in" data-aos-delay={100 + idx * 100}>
                <img src={item.images?.[0] || '/images/placeholder.jpg'} alt={item.name} className="w-full h-28 object-cover rounded mb-2" onError={e => { e.target.onerror = null; e.target.src = '/images/placeholder.jpg'; }} />
                <div className="text-center">
                  <div className="font-medium text-gray-900 line-clamp-1">{item.name}</div>
                  <div className="text-pink-600 font-bold">₦{item.price}</div>
                  <div className="flex items-center justify-center mt-1">
                    {[1,2,3,4,5].map(star => (
                      <svg key={star} className={`h-4 w-4 ${star <= Math.round(item.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.95-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Recently Viewed Products Section */}
      <RecentlyViewedProducts token={token} />
    </div>
  );
};

export default ProductDetails;