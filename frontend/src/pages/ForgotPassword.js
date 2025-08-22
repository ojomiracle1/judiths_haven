import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from '../features/auth/authSlice';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();

  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    console.log('--- ForgotPassword useEffect Triggered ---');
    console.log('isError:', isError);
    console.log('isSuccess:', isSuccess);
    console.log('message:', message);

    if (isError) {
      console.error('Forgot password error:', isError);
      toast.error(message || 'Failed to send reset link');
      dispatch({ type: 'auth/reset' });
    }
    if (isSuccess) {
      console.log('Forgot password success:', isSuccess);
      toast.success(message || 'Password reset email sent!');
      setEmail('');
      dispatch({ type: 'auth/reset' });
    }
    console.log('--- End useEffect ---');
  }, [isError, isSuccess, message, dispatch]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    try {
      console.log('Sending forgot password request for email:', email);
      dispatch(resetPassword(email));
    } catch (err) {
      console.error('Error in onSubmit:', err);
      // Error will be handled by the useEffect
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-green-50 py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-pink-100">
        <h1 className="text-3xl font-extrabold text-pink-600 tracking-tight drop-shadow-lg text-center mb-8">
          Forgot Password
        </h1>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-base font-semibold text-primary-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="input-premium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 btn-gradient font-semibold rounded-xl shadow-lg hover:scale-[1.03] transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
          <div className="flex justify-between items-center mt-4">
            <Link
              to="/login"
              className="text-blue-600 hover:underline text-sm"
            >
              Back to login
            </Link>
            <Link
              to="/register"
              className="text-pink-600 hover:underline text-sm"
            >
              Create account
            </Link>
          </div>
          {message && (
            <div className="text-green-600 text-sm mt-2">{message}</div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;