import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, updateProfileImage } from '../features/auth/authSlice';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';
import * as yup from 'yup';

const Profile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone: '',
  });
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const { name, email, password, confirmPassword, address, phone } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
        address: user.address || '',
        phone: user.phone || '',
      });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
      dispatch({ type: 'auth/reset' });
    }

    if (isSuccess) {
      toast.success('Profile updated successfully!');
      dispatch({ type: 'auth/reset' });
    }
  }, [isError, isSuccess, message, dispatch]);

  useEffect(() => {
    AOS.init({ duration: 900, once: true, offset: 40 });
  }, []);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const schema = yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').notRequired(),
    confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match'),
    phone: yup.string().required('Phone is required'),
  });

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
        password: password || undefined,
        address,
        phone,
      };
      dispatch(updateProfile(userData));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
  const res = await fetch('/upload/profile', {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (data.imageUrl) {
        await dispatch(updateProfileImage(data.imageUrl));
        toast.success('Profile image updated!');
      } else {
        toast.error(data.message || 'Image upload failed');
      }
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500" aria-label="Loading profile"></div>
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 bg-gradient-to-br from-pink-50 via-white to-blue-50 min-h-screen" aria-labelledby="profile-heading">
      <h1 id="profile-heading" className="text-3xl font-extrabold text-gray-800 mb-8 drop-shadow-lg text-center">
        Profile
      </h1>
      <div className="flex flex-col items-center mt-4 animate-fade-in">
        <img
          src={user && user.profileImage ? user.profileImage : '/images/default-avatar.png'}
          alt={user && user.name ? `${user.name}'s profile` : 'Profile'}
          className="w-24 h-24 rounded-full object-cover border-4 border-pink-300 shadow-lg"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/default-avatar.png';
          }}
          loading="lazy"
        />
        <label className="mt-2 cursor-pointer text-pink-600 hover:underline" htmlFor="profile-image-upload">
          {uploading ? 'Uploading...' : 'Change Photo'}
          <input
            id="profile-image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={uploading}
            aria-label="Upload profile image"
          />
        </label>
      </div>
      <div className="mt-8 bg-white/80 py-8 px-4 shadow-2xl rounded-2xl animate-fade-in">
        <div>
          <h3 className="text-lg leading-6 font-bold text-gray-800">
            Profile Information
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Update your account's profile information.</p>
          </div>
        </div>
        <form className="space-y-6 max-w-md mx-auto" onSubmit={onSubmit} aria-label="Profile form" autoComplete="on">
          <div>
            <label htmlFor="name" className="block text-base font-semibold text-primary-700 mb-1">
              Full Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="name"
                id="name"
                value={name}
                onChange={onChange}
                className="input-premium"
                aria-required="true"
                autoComplete="name"
              />
              {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-base font-semibold text-primary-700 mb-1">
              Email address
            </label>
            <div className="mt-1">
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={onChange}
                className="input-premium"
                aria-required="true"
                autoComplete="email"
              />
              {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-base font-semibold text-primary-700 mb-1">
              New Password
            </label>
            <div className="mt-1">
              <input
                type="password"
                name="password"
                id="password"
                value={password}
                onChange={onChange}
                className="input-premium"
                aria-required="false"
                autoComplete="new-password"
              />
              {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-base font-semibold text-primary-700 mb-1">
              Confirm New Password
            </label>
            <div className="mt-1">
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                className="input-premium"
                aria-required="false"
                autoComplete="new-password"
              />
              {errors.confirmPassword && <div className="text-red-500 text-sm mt-1">{errors.confirmPassword}</div>}
            </div>
          </div>
          <div>
            <label htmlFor="address" className="block text-base font-semibold text-primary-700 mb-1">
              Address
            </label>
            <div className="mt-1">
              <textarea
                id="address"
                name="address"
                rows={3}
                value={address}
                onChange={onChange}
                className="input-premium"
                aria-required="false"
                autoComplete="street-address"
              />
            </div>
          </div>
          <div>
            <label htmlFor="phone" className="block text-base font-semibold text-primary-700 mb-1">
              Phone Number
            </label>
            <div className="mt-1">
              <input
                type="tel"
                name="phone"
                id="phone"
                value={phone}
                onChange={onChange}
                className="input-premium"
                aria-required="true"
                autoComplete="tel"
              />
              {errors.phone && <div className="text-red-500 text-sm mt-1">{errors.phone}</div>}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="w-full py-3 px-4 btn-gradient text-lg font-semibold rounded-xl shadow-lg hover:scale-[1.03] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
              aria-label="Save Changes"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Profile;