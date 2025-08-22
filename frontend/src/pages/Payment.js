import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { savePaymentMethod } from '../features/cart/cartSlice';

const Payment = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [paymentMethod, setPaymentMethod] = useState('PayPal');

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/placeorder');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-green-50 py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-blue-100">
        <h1 className="text-3xl font-extrabold text-blue-600 mb-8 text-center tracking-tight">
          Payment Method
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Method
            </label>
            <div className="space-y-4">
              <div className="flex items-center bg-blue-50 rounded-xl px-4 py-2 border border-blue-200">
                <input
                  type="radio"
                  id="paypal"
                  name="paymentMethod"
                  value="PayPal"
                  checked={paymentMethod === 'PayPal'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="paypal"
                  className="ml-3 text-blue-700 font-medium"
                >
                  PayPal or Credit Card
                </label>
              </div>
              <div className="flex items-center bg-pink-50 rounded-xl px-4 py-2 border border-pink-200">
                <input
                  type="radio"
                  id="stripe"
                  name="paymentMethod"
                  value="Stripe"
                  checked={paymentMethod === 'Stripe'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500"
                />
                <label
                  htmlFor="stripe"
                  className="ml-3 text-pink-700 font-medium"
                >
                  Stripe
                </label>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-400 via-pink-400 to-green-400 text-white font-bold rounded-xl shadow-lg hover:from-blue-500 hover:to-green-500 transition focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;