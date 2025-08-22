import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { t } = useTranslation();

  // Mock product data (in a real app, this would come from an API)
  const product = {
    id: parseInt(id),
    name: 'Summer Floral Dress',
    price: 89.99,
    description: 'A beautiful summer dress with a floral pattern, perfect for warm days and special occasions. Made from high-quality, breathable fabric that ensures comfort throughout the day.',
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    ],
    category: 'Dresses',
    rating: 4.5,
    reviews: 128,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Pink', 'Blue', 'White'],
    inStock: true,
    features: [
      '100% Cotton',
      'Machine washable',
      'Imported',
      "Model is 5'10\" and wearing size S"
    ]
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    // In a real app, this would dispatch an action to add the item to the cart
    console.log('Adding to cart:', { ...product, quantity });
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-green-50 py-12 px-4">
      <Helmet>
        <title>{product?.name ? `${product.name} - Judith's Haven` : `Product - Judith's Haven`}</title>
        <meta name="description" content={product?.description || 'Product details and features.'} />
        <link rel="canonical" href={`https://yourdomain.com/products/${product?.id || ''}`} />
      </Helmet>
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-pink-100 flex flex-col lg:flex-row gap-10">
        {/* Product Images */}
        <div className="lg:w-1/2 flex flex-col gap-4">
          <div className="aspect-w-1 aspect-h-1 rounded-2xl overflow-hidden bg-pink-50">
            <img
              src={product.images[0]}
              alt={product.name}
              className="object-cover w-full h-80 rounded-2xl shadow-md"
            />
          </div>
          <div className="flex gap-2 mt-2">
            {product.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={product.name + ' thumb'}
                className="w-16 h-16 object-cover rounded-xl border border-pink-100 bg-pink-50"
              />
            ))}
          </div>
        </div>
        {/* Product Details */}
        <div className="lg:w-1/2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-extrabold text-pink-600 tracking-tight">{product.name}</h1>
            <button
              onClick={toggleWishlist}
              className={`rounded-full p-2 border-2 ${isWishlisted ? 'border-pink-400 bg-pink-100' : 'border-gray-200 bg-white'} transition`}
              aria-label="Add to wishlist"
            >
              {isWishlisted ? (
                <HeartIconSolid className="h-6 w-6 text-pink-500" />
              ) : (
                <HeartIcon className="h-6 w-6 text-pink-400" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-green-600">${product.price}</span>
            <span className="text-sm text-gray-400 line-through">$99.99</span>
            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-lg font-semibold">In Stock</span>
          </div>
          <div className="flex items-center gap-2 text-yellow-400">
            {Array.from({ length: Math.round(product.rating) }).map((_, i) => (
              <span key={i}>★</span>
            ))}
            <span className="text-xs text-gray-400 ml-2">({product.reviews} reviews)</span>
          </div>
          <p className="text-gray-600 text-base leading-relaxed">{product.description}</p>
          <ul className="list-disc pl-6 text-gray-500 text-sm">
            {product.features.map((feature, idx) => (
              <li key={idx}>{feature}</li>
            ))}
          </ul>
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Quantity:</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-20 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-pink-400 via-blue-400 to-green-400 text-white font-bold rounded-xl shadow-lg hover:from-pink-500 hover:to-green-500 transition focus:outline-none focus:ring-2 focus:ring-pink-200"
          >
            <ShoppingCartIcon className="h-5 w-5" /> {t('addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;