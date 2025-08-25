import React, { useState } from 'react';
import axios from '../utils/axios';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
  const res = await axios.post('/newsletter/subscribe', { email });
      setMessage(res.data.message);
      setEmail('');
    } catch (err) {
      console.error('Newsletter signup error:', err, err?.response);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Subscription failed. Please check your connection or try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 items-center mt-8 max-w-md mx-auto bg-white/90 shadow-card rounded-2xl p-4 w-full border border-pink-100">
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="input-premium"
      />
      <button
        type="submit"
        disabled={loading}
        className="btn-gradient px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition-all w-full sm:w-auto"
      >
        {loading ? 'Subscribing...' : 'Subscribe'}
      </button>
      {message && <span className="text-green-600 text-xs sm:text-sm mt-2 sm:mt-0">{message}</span>}
      {error && <span className="text-red-600 text-xs sm:text-sm mt-2 sm:mt-0">{error}</span>}
    </form>
  );
};

export default NewsletterSignup;
