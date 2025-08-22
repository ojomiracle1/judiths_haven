import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createUser, updateUser, getUserById, reset } from '../../features/user/userSlice';
import { toast } from 'react-toastify';
import Spinner from '../../components/Spinner';

const UserForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    isAdmin: false,
  });

  const { name, email, password, isAdmin } = formData;

  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isLoading, isError, message, isSuccess } = useSelector((state) => state.user);

  useEffect(() => {
    // Reset user slice state on mount
    dispatch(reset());
    console.log('UserForm useEffect', { user, isError, message, isSuccess, id });
    if (!user) {
      navigate('/login');
    }

    if (isError) {
      toast.error(message);
    }

    if (isSuccess) {
      dispatch(reset());
      navigate('/admin/users');
    }

    if (id) {
      dispatch(getUserById(id))
        .unwrap()
        .then((user) => {
          setFormData({
            name: user.name,
            email: user.email,
            password: '',
            isAdmin: user.isAdmin,
          });
        })
        .catch((error) => {
          toast.error(error);
        });
    }
  }, [user, navigate, isError, message, isSuccess, dispatch, id]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (id) {
      dispatch(updateUser({ id, ...formData }))
        .unwrap()
        .then(() => toast.success('User updated successfully'))
        .catch((error) => toast.error(error));
    } else {
      dispatch(createUser(formData))
        .unwrap()
        .then(() => toast.success('User created successfully'))
        .catch((error) => toast.error(error));
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-green-50 py-12 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8 border border-blue-100">
        <h1 className="text-3xl font-extrabold text-blue-600 mb-8 text-center tracking-tight">{id ? 'Edit User' : 'Create User'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              placeholder="User Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-xl border border-pink-200 bg-pink-50 px-4 py-2 shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition"
              placeholder="user@haven.com"
            />
          </div>
          {!id && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-xl border border-green-200 bg-green-50 px-4 py-2 shadow-sm focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
                placeholder="Password"
              />
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="isAdmin"
              name="isAdmin"
              checked={isAdmin}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
            />
            <label htmlFor="isAdmin" className="text-blue-700 font-medium">Admin User</label>
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-400 via-pink-400 to-green-400 text-white font-bold rounded-xl shadow-lg hover:from-blue-500 hover:to-green-500 transition focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {id ? 'Update User' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserForm;