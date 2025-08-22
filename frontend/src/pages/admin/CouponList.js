import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const CouponList = () => {
  const { user } = useSelector((state) => state.auth);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ code: '', type: 'percent', value: '', expiry: '' });
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchCoupons = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/coupons', {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch coupons');
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setSuccess('');
    setError('');
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create coupon');
      }
      setForm({ code: '', type: 'percent', value: '', expiry: '' });
      setSuccess('Coupon created!');
      fetchCoupons();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <h2>Coupon Management</h2>
      <form onSubmit={handleCreate} style={{ marginBottom: 20 }}>
        <input name="code" placeholder="Code" value={form.code} onChange={handleChange} required />
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="percent">Percent</option>
          <option value="fixed">Fixed</option>
        </select>
        <input name="value" type="number" placeholder="Value" value={form.value} onChange={handleChange} required />
        <input name="expiry" type="date" value={form.expiry} onChange={handleChange} />
        <button type="submit" disabled={creating}>Create Coupon</button>
      </form>
      {success && <div style={{ color: 'green' }}>{success}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {loading ? (
        <div>Loading coupons...</div>
      ) : (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Expiry</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id}>
                <td>{c.code}</td>
                <td>{c.type}</td>
                <td>{c.value}</td>
                <td>{c.expiry ? new Date(c.expiry).toLocaleDateString() : 'N/A'}</td>
                <td>
                  {c.isUsed ? 'Used' : (c.expiry && new Date() > new Date(c.expiry)) ? 'Expired' : 'Active'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CouponList; 