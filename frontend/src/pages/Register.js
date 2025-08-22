import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../features/auth/authSlice';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';
import * as yup from 'yup';
const logo = '/images/judiths-haven-logo.png';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { name, email, password, confirmPassword } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);

  const { isError, isSuccess, message } = authState;

  const schema = yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Confirm Password is required'),
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    AOS.init({ duration: 900, once: true, offset: 40 });
  }, []);

  useEffect(() => {
    if (isError) {
      toast.error(message);
      dispatch({ type: 'auth/reset' });
    }
    if (isSuccess) {
      toast.success('Registration successful!');
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
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
    } else {
      const userData = {
        name,
        email,
        password,
      };
      dispatch(register(userData));
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-green-50 py-12 px-4" aria-labelledby="register-heading">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-blue-100">
        <div className="flex flex-col items-center mb-8">
          <img
            src={logo}
            alt="Judith's Haven Logo"
            className="w-20 h-20 mb-2 rounded-full shadow-md bg-pink-50"
            loading="lazy"
          />
          <h1 id="register-heading" className="text-3xl font-extrabold text-blue-600 tracking-tight">
            Create Account
          </h1>
        </div>
        <form onSubmit={onSubmit} className="space-y-6" aria-label="Register form" autoComplete="on">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              required
              className="mt-1 block w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              placeholder="Your Name"
              aria-required="true"
              autoComplete="name"
            />
            {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              className="mt-1 block w-full rounded-xl border border-pink-200 bg-pink-50 px-4 py-2 shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition"
              placeholder="you@haven.com"
              aria-required="true"
              autoComplete="email"
            />
            {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              className="mt-1 block w-full rounded-xl border border-green-200 bg-green-50 px-4 py-2 shadow-sm focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
              placeholder="Password"
              aria-required="true"
              autoComplete="new-password"
            />
            {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
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
              className="mt-1 block w-full rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-2 shadow-sm focus:border-yellow-200 focus:ring-2 focus:ring-yellow-100 transition"
              placeholder="Confirm Password"
              aria-required="true"
              autoComplete="new-password"
            />
            {errors.confirmPassword && <div className="text-red-500 text-sm mt-1">{errors.confirmPassword}</div>}
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-400 via-pink-400 to-green-400 text-white font-bold rounded-xl shadow-lg hover:from-blue-500 hover:to-green-500 transition focus:outline-none focus:ring-2 focus:ring-blue-200"
            aria-label="Register"
          >
            Register
          </button>
        </form>
        <div className="mt-6 text-center">
          <span className="text-gray-500">Already have an account? </span>
          <Link
            to="/login"
            className="text-blue-500 hover:underline font-medium"
            aria-label="Go to Login"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Register;