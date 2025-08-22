import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../features/auth/authSlice';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { openGoogleOAuthPopup } from '../utils/googleOAuthPopup';
import AOS from 'aos';
import 'aos/dist/aos.css';
import * as yup from 'yup';

const logo = '/images/judiths-haven-logo.png';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { email, password } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  ); // Removed unused 'user' variable

  useEffect(() => {
    AOS.init({ duration: 900, once: true, offset: 40 });
  }, []);

  useEffect(() => {
    if (isError) {
      console.error('Login Error:', message);
      toast.error(message || 'Login failed. Please check your credentials.');
      dispatch({ type: 'auth/reset' });
    }
    if (isSuccess) {
      toast.success('Login successful!');
      dispatch({ type: 'auth/reset' });
      navigate('/');
    }
  }, [isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await schema.validate(formData, { abortEarly: false });
      setErrors({});
    } catch (validationError) {
      const newErrors = {};
      validationError.inner.forEach(err => {
        newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
      return;
    }
    try {
      await dispatch(login(formData)).unwrap();
    } catch (error) {
      console.error('Login submission error:', error);
      toast.error(error.message || 'Login failed. Please try again.');
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
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Judith's Haven Logo" className="h-16 mb-2 drop-shadow" />
          <h1 className="text-3xl font-extrabold text-pink-600 tracking-tight drop-shadow-lg text-center">Sign In</h1>
        </div>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-base font-semibold text-primary-700 mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="input-premium"
              value={email}
              onChange={onChange}
            />
            {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
          </div>
          <div>
            <label htmlFor="password" className="block text-base font-semibold text-primary-700 mb-1">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="input-premium pr-10"
                value={password}
                onChange={onChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-pink-500 hover:text-pink-700 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 btn-gradient font-semibold rounded-xl shadow-lg hover:scale-[1.03] transition-all duration-200"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={openGoogleOAuthPopup}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-200 to-pink-200 text-primary-700 font-semibold rounded-xl shadow hover:from-blue-300 hover:to-pink-300 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <img src="/images/google-logo.png" alt="Google" className="h-5 w-5" /> Sign in with Google
          </button>
          <div className="flex justify-between items-center mt-4">
            <Link to="/forgot-password" className="text-pink-600 hover:underline text-sm">Forgot password?</Link>
            <Link to="/register" className="text-blue-600 hover:underline text-sm">Create account</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;