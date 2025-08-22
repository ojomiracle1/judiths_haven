
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function RecommendedProducts({ token }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/recommendations', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setProducts(res.data))
      .catch(() => setError('Failed to fetch recommendations'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div>Loading recommendations...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!products.length) return <div>No recommendations available.</div>;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold">Recommended For You</h3>
        <Link
          to="/recommended"
          className="text-sm font-semibold text-blue-500 hover:text-pink-500 transition px-3 py-1 rounded-xl border border-blue-100 bg-blue-50 shadow-sm"
        >
          View All
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {products.map(product => {
          const image = product.image || product.images?.[0] || '/images/placeholder.jpg';
          const name = product.name || '';
          const id = product._id || product.id || '';
          return (
            <div
              key={id}
              className="bg-white rounded-2xl shadow-lg border border-pink-100 flex flex-col hover:shadow-xl transition group relative"
              data-aos="fade-up"
            >
              <Link to={`/product/${id}`} className="block">
                <img
                  src={image}
                  alt={name}
                  className="w-full h-40 object-cover rounded-t-2xl bg-pink-50"
                  onError={e => { e.target.onerror = null; e.target.src = '/images/placeholder.jpg'; }}
                />
                <div className="p-4 flex-1 flex flex-col">
                  <h2 className="text-base font-bold text-pink-600 mb-1 truncate">{name}</h2>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecommendedProducts;
