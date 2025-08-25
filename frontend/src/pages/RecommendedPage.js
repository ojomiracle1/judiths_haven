import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const RecommendedPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Get token from localStorage (or auth state if available)
  const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : '';

  // Sorting state
  const [sort, setSort] = useState('recent'); // 'recent' | 'name' | 'priceLow' | 'priceHigh'
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  // Filtering state
  const [filter, setFilter] = useState(''); // filter by name substring

  useEffect(() => {
  axios.get('/recommendations', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setProducts(res.data))
      .catch(() => setError('Failed to fetch recommended products'))
      .finally(() => setLoading(false));
  }, [token]);

  // Sorting logic
  const sortedProducts = [...products].sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'priceLow') return (a.price || 0) - (b.price || 0);
    if (sort === 'priceHigh') return (b.price || 0) - (a.price || 0);
    return 0; // 'recent' (default order from API)
  });

  // Filtering logic
  const filteredProducts = sortedProducts.filter(product =>
    filter === '' || (product.name && product.name.toLowerCase().includes(filter.toLowerCase()))
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  if (loading) return <div className="flex justify-center items-center min-h-64" role="status" aria-live="polite">Loading recommended products...</div>;
  if (error) return <div className="text-red-600 text-center py-8" role="alert">{error}</div>;
  if (!products.length) return <div className="text-center py-16 text-primary-300 text-lg bg-primary-50 rounded-2xl shadow-card-haven max-w-xl mx-auto" role="alert">No recommended products found.</div>;

  return (
    <main className="container mx-auto py-8 px-4" aria-labelledby="recommended-heading">
      <h1 id="recommended-heading" className="text-2xl font-bold mb-4">Recommended Products</h1>
      {/* Sorting & Filtering Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <label htmlFor="sort-select" className="font-medium">Sort by:</label>
        <select
          id="sort-select"
          className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-pink-200"
          value={sort}
          onChange={e => { setSort(e.target.value); setPage(1); }}
          aria-label="Sort products"
        >
          <option value="recent">Most Recent</option>
          <option value="name">Name (A-Z)</option>
          <option value="priceLow">Price: Low to High</option>
          <option value="priceHigh">Price: High to Low</option>
        </select>
        <input
          type="text"
          className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="Filter by name..."
          value={filter}
          onChange={e => { setFilter(e.target.value); setPage(1); }}
          aria-label="Filter products by name"
        />
      </div>
      {/* Product Grid */}
      <section aria-label="Recommended products" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {paginatedProducts.map(product => {
          const image = product.image || product.images?.[0] || '/images/placeholder.jpg';
          const name = product.name || '';
          const id = product._id || product.id || '';
          const price = product.price || '';
          return (
            <article
              key={id}
              className="bg-white rounded-2xl shadow-lg border border-pink-100 flex flex-col hover:shadow-xl transition group relative"
              data-aos="fade-up"
              tabIndex={0}
              aria-labelledby={`recommended-product-${id}`}
            >
              <Link to={`/product/${id}`} className="block" tabIndex={0} aria-label={`View details for ${name}`}>
                <img
                  src={image}
                  alt={name ? `Recommended product: ${name}` : 'Recommended product image'}
                  loading="lazy"
                  className="w-full h-40 object-cover rounded-t-2xl bg-pink-50"
                  onError={e => { e.target.onerror = null; e.target.src = '/images/placeholder.jpg'; }}
                />
                <div className="p-4 flex-1 flex flex-col">
                  <h2 id={`recommended-product-${id}`} className="text-base font-bold text-pink-600 mb-1 truncate">{name}</h2>
                  <span className="text-pink-500 font-bold">₦{price}</span>
                </div>
              </Link>
            </article>
          );
        })}
      </section>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav className="flex justify-center items-center gap-2 mt-8" aria-label="Pagination">
          <button
            className="px-3 py-1 rounded bg-pink-100 text-pink-700 font-semibold disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-pink-400"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
          >
            Prev
          </button>
          <span className="font-medium">Page {page} of {totalPages}</span>
          <button
            className="px-3 py-1 rounded bg-pink-100 text-pink-700 font-semibold disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-pink-400"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            Next
          </button>
        </nav>
      )}
    </main>
  );
};

export default RecommendedPage;
