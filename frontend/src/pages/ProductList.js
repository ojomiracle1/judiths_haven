import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts, searchProducts } from '../features/product/productSlice';
import { addToCart } from '../features/cart/cartSlice.backend';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

const ProductList = () => {
  const dispatch = useDispatch();
  const { products, isLoading, isError, message } = useSelector(
    (state) => state.product
  );

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('');
  const [rating, setRating] = useState('');
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    dispatch(getProducts());
  }, [dispatch, isError, message]);

  useEffect(() => {
    AOS.init({ duration: 900, once: true, offset: 40 });
  }, []);

  const handleAddToCart = (id) => {
    dispatch(addToCart({ id, qty: 1 }))
      .unwrap()
      .then(() => {
        toast.success('Product added to cart!');
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  const handleFilter = (e) => {
    e.preventDefault();
    dispatch(searchProducts({ keyword: search, category, minPrice, maxPrice, sort, rating, brand, size, color }));
  };

  const handleSimpleSearch = (e) => {
    e.preventDefault();
    dispatch(searchProducts({ keyword: search }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-green-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-3xl font-extrabold text-pink-600 tracking-tight mb-2 md:mb-0">Product List</h1>
          <form onSubmit={handleSimpleSearch} className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition w-full md:w-64"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-400 via-pink-400 to-green-400 text-white font-bold rounded-xl shadow-lg hover:from-blue-500 hover:to-green-500 transition"
            >
              Search
            </button>
            <button
              type="button"
              className="ml-2 text-blue-500 underline text-sm font-medium hover:text-pink-500"
              onClick={() => setShowAdvanced((v) => !v)}
            >
              {showAdvanced ? 'Hide Filters' : 'Advanced Filters'}
            </button>
          </form>
        </div>
        {showAdvanced && (
          <form onSubmit={handleFilter} className="bg-white rounded-2xl shadow-md p-6 mb-8 flex flex-wrap gap-4 items-end border border-blue-100">
            <div className="flex flex-col w-32">
              <label className="text-xs font-medium text-gray-600 mb-1">Category</label>
              <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="rounded-lg border border-pink-200 bg-pink-50 px-2 py-1" />
            </div>
            <div className="flex flex-col w-24">
              <label className="text-xs font-medium text-gray-600 mb-1">Min Price</label>
              <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1" />
            </div>
            <div className="flex flex-col w-24">
              <label className="text-xs font-medium text-gray-600 mb-1">Max Price</label>
              <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="rounded-lg border border-green-200 bg-green-50 px-2 py-1" />
            </div>
            <div className="flex flex-col w-32">
              <label className="text-xs font-medium text-gray-600 mb-1">Sort</label>
              <select value={sort} onChange={e => setSort(e.target.value)} className="rounded-lg border border-yellow-200 bg-yellow-50 px-2 py-1">
                <option value="">Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Rating</option>
              </select>
            </div>
            <div className="flex flex-col w-24">
              <label className="text-xs font-medium text-gray-600 mb-1">Rating</label>
              <input type="number" value={rating} onChange={e => setRating(e.target.value)} className="rounded-lg border border-pink-200 bg-pink-50 px-2 py-1" />
            </div>
            <div className="flex flex-col w-32">
              <label className="text-xs font-medium text-gray-600 mb-1">Brand</label>
              <input type="text" value={brand} onChange={e => setBrand(e.target.value)} className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1" />
            </div>
            <div className="flex flex-col w-24">
              <label className="text-xs font-medium text-gray-600 mb-1">Size</label>
              <input type="text" value={size} onChange={e => setSize(e.target.value)} className="rounded-lg border border-green-200 bg-green-50 px-2 py-1" />
            </div>
            <div className="flex flex-col w-24">
              <label className="text-xs font-medium text-gray-600 mb-1">Color</label>
              <input type="text" value={color} onChange={e => setColor(e.target.value)} className="rounded-lg border border-yellow-200 bg-yellow-50 px-2 py-1" />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-400 via-pink-400 to-green-400 text-white font-bold rounded-xl shadow-lg hover:from-blue-500 hover:to-green-500 transition"
            >
              Apply Filters
            </button>
          </form>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {Array.isArray(products) && products.length > 0 ? (
            products.map((product) => {
              // Defensive: ensure product is an object and has required fields
              if (!product || typeof product !== 'object') return null;
              const name = typeof product.name === 'string' ? product.name : '';
              // Defensive: support both 'image' and 'images' fields
              let image = '';
              if (Array.isArray(product.images) && product.images.length > 0) {
                image = product.images[0];
              } else if (typeof product.image === 'string') {
                image = product.image;
              }
              const category = product.category && typeof product.category === 'object' ? product.category.name : (typeof product.category === 'string' ? product.category : '');
              const price = typeof product.price === 'number' || typeof product.price === 'string' ? product.price : '';
              const discount = product.discount;
              const discountPrice = product.discountPrice;
              const rating = typeof product.rating === 'number' ? product.rating : 0;
              const numReviews = typeof product.numReviews === 'number' ? product.numReviews : 0;
              const id = product._id || product.id || '';
              if (!id) return null;
              return (
                <div
                  key={id}
                  className="bg-white rounded-2xl shadow-lg border border-pink-100 flex flex-col hover:shadow-xl transition group relative"
                  data-aos="fade-up"
                >
                  <Link to={`/product/${id}`} className="block">
                    <img
                      src={image || '/images/placeholder.jpg'}
                      alt={name}
                      className="w-full h-48 object-cover rounded-t-2xl bg-pink-50"
                      onError={e => { e.target.onerror = null; e.target.src = '/images/placeholder.jpg'; }}
                    />
                    <div className="p-4 flex-1 flex flex-col">
                      <h2 className="text-lg font-bold text-pink-600 mb-1 truncate">{name}</h2>
                      <p className="text-gray-500 text-sm mb-2 truncate">{category}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl font-bold text-green-600">${price}</span>
                        {discount && (
                          <span className="text-xs line-through text-gray-400">${discountPrice}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400 mb-2">
                        {Array.from({ length: Math.round(rating) }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                        <span className="text-xs text-gray-400 ml-2">({numReviews})</span>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleAddToCart(id)}
                    className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-pink-400 to-blue-400 text-white px-4 py-2 rounded-xl shadow-lg font-bold hover:from-pink-500 hover:to-blue-500"
                  >
                    Add to Cart
                  </button>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center text-gray-500">No products found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;