import React, { useState } from 'react';

const ProductImage = ({ src, alt, className }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);

  // Default placeholder images
  const placeholderImages = [
    'https://via.placeholder.com/400x500/E6E6FA/FFFFFF?text=Product',
    'https://picsum.photos/400/500?random=1',
    'https://picsum.photos/400/500?random=2',
    'https://picsum.photos/400/500?random=3'
  ];

  const handleError = () => {
    if (!error) {
      setError(true);
      // Try a different placeholder image
      const randomIndex = Math.floor(Math.random() * placeholderImages.length);
      setImgSrc(placeholderImages[randomIndex]);
    }
  };

  // If no src provided, use a placeholder
  const imageSrc = src || placeholderImages[0];

  return (
    <img
      src={imgSrc || imageSrc}
      alt={alt || 'Product image'}
      className={`object-contain w-full h-auto max-h-60 sm:max-h-80 rounded ${className || ''}`}
      onError={handleError}
      loading="lazy"
      draggable={false}
    />
  );
};

export default ProductImage;