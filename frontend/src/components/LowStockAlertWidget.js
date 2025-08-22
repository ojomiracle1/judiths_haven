import React, { useEffect, useState } from 'react';
import axios from 'axios';

function LowStockAlertWidget({ token, threshold = 5 }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/products/low-stock?threshold=${threshold}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setProducts(res.data.products))
    .finally(() => setLoading(false));
  }, [token, threshold]);

  if (loading) return <div>Loading low stock products...</div>;
  if (!products.length) return <div>All products are sufficiently stocked.</div>;
  return (
    <div>
      <h3>Low Stock Products</h3>
      <ul>
        {products.map(p => (
          <li key={p._id}>{p.name} (Stock: {p.countInStock})</li>
        ))}
      </ul>
    </div>
  );
}

export default LowStockAlertWidget;