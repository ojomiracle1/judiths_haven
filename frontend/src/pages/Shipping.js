import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { saveShippingAddress } from '../features/cart/cartSlice';

const Shipping = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress(formData));
    navigate('/payment');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-green-50 py-12 px-4" aria-labelledby="shipping-heading">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-pink-100">
        <h1 id="shipping-heading" className="text-3xl font-extrabold text-pink-600 mb-8 text-center tracking-tight">
          Shipping Address
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6" aria-label="Shipping address form" autoComplete="on">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-xl border border-pink-200 bg-pink-50 px-4 py-2 shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition"
              placeholder="123 Haven Lane"
              autoComplete="street-address"
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              placeholder="Haven City"
              autoComplete="address-level2"
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-xl border border-green-200 bg-green-50 px-4 py-2 shadow-sm focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
              placeholder="12345"
              autoComplete="postal-code"
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-2 shadow-sm focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition"
              placeholder="Havenland"
              autoComplete="country"
              aria-required="true"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-pink-400 via-blue-400 to-green-400 text-white font-bold rounded-xl shadow-lg hover:from-pink-500 hover:to-green-500 transition focus:outline-none focus:ring-2 focus:ring-pink-200"
            aria-label="Continue to Payment"
          >
            Continue to Payment
          </button>
        </form>
      </div>
    </main>
  );
};

export default Shipping;