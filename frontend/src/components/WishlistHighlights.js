import React, { useEffect, useState } from 'react';
import axios from 'axios';

function WishlistHighlights({ token }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/admin/analytics', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setProducts(res.data.mostWishedProducts || []))
      .catch(() => setError('Failed to fetch wishlist highlights'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div role="status" aria-live="polite">Loading wishlist highlights...</div>;
  if (error) return <div className="text-red-600" role="alert">{error}</div>;
  if (!products.length) return <div role="alert">No wishlist highlights.</div>;

  return (
    <section className="mb-8" aria-labelledby="wishlist-highlights-heading">
      <h3 id="wishlist-highlights-heading" className="text-lg font-bold mb-2">Most Wished-For Products</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {products.map(p => (
          <div key={p.productId} className="bg-white rounded shadow p-2 text-center" tabIndex={0} aria-labelledby={`wishlist-highlight-${p.productId}`}> 
            <img 
              src={p.image || p.images?.[0]} 
              alt={p.name ? `Most wished-for product: ${p.name}` : 'Most wished-for product image'} 
              className="h-20 mx-auto mb-2 object-contain" 
              loading="lazy"
            />
            <div id={`wishlist-highlight-${p.productId}`} className="font-semibold">{p.name}</div>
            <div className="text-xs text-gray-500">Wishes: {p.count}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default WishlistHighlights;
