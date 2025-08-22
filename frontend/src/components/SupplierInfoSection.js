import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SupplierInfoSection({ productId, token }) {
  const [supplier, setSupplier] = useState({ name: '', contact: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    axios.get(`/api/products/${productId}/supplier`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setSupplier(res.data))
    .catch(() => setMsg('Failed to fetch supplier info'))
    .finally(() => setLoading(false));
  }, [productId, token]);

  const handleChange = e => setSupplier({ ...supplier, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    setMsg('');
    axios.put(`/api/products/${productId}/supplier`, supplier, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setMsg('Supplier info updated!'))
    .catch(() => setMsg('Failed to update supplier info'));
  };

  if (loading) return <div>Loading supplier info...</div>;
  return (
    <form onSubmit={handleSubmit}>
      <h3>Supplier Info</h3>
      <input name="name" value={supplier.name} onChange={handleChange} placeholder="Name" />
      <input name="contact" value={supplier.contact} onChange={handleChange} placeholder="Contact" />
      <input name="email" value={supplier.email} onChange={handleChange} placeholder="Email" />
      <input name="phone" value={supplier.phone} onChange={handleChange} placeholder="Phone" />
      <button type="submit">Update Supplier</button>
      {msg && <div>{msg}</div>}
    </form>
  );
}

export default SupplierInfoSection;