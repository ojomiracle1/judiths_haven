import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetPasswordConfirm } from '../features/auth/authSlice';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const { password, confirmPassword } = formData;
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message || 'Failed to reset password');
      dispatch({ type: 'auth/reset' });
    }
    if (isSuccess) {
      toast.success('Password reset successful!');
      dispatch({ type: 'auth/reset' });
      navigate('/login');
    }
  }, [isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
    } else {
      dispatch(resetPasswordConfirm({ token, password }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-green-50" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-400" aria-label="Loading reset password form"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-green-50 py-12 px-4" aria-labelledby="reset-password-heading">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-blue-100">
        <h1 id="reset-password-heading" className="text-3xl font-extrabold text-blue-600 mb-8 text-center tracking-tight">
          Reset Password
        </h1>
        <form onSubmit={onSubmit} className="space-y-6" aria-label="Reset password form" autoComplete="on">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              className="mt-1 block w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              placeholder="Enter new password"
              aria-required="true"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              required
              className="mt-1 block w-full rounded-xl border border-pink-200 bg-pink-50 px-4 py-2 shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition"
              placeholder="Confirm new password"
              aria-required="true"
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-400 via-pink-400 to-green-400 text-white font-bold rounded-xl shadow-lg hover:from-blue-500 hover:to-green-500 transition focus:outline-none focus:ring-2 focus:ring-blue-200"
            aria-label="Reset Password"
          >
            Reset Password
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-blue-500 hover:underline font-medium"
            aria-label="Back to Login"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
};

export default ResetPassword;