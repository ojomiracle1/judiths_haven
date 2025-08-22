import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers, banUser, resetUserPassword } from '../../features/user/userSlice';
import Spinner from '../../components/Spinner';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users = [], isLoading } = useSelector((state) => state.user);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleResetPassword = (userId) => {
    const newPassword = prompt('Enter new password (min 8 chars):');
    if (newPassword && newPassword.length >= 8) {
      dispatch(resetUserPassword({ id: userId, newPassword }))
        .unwrap()
        .then(() => toast.success('Password reset successfully'))
        .catch((err) => toast.error(err?.message || 'Failed to reset password'));
    } else if (newPassword) {
      toast.error('Password must be at least 8 characters.');
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-green-50 py-12 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-blue-100">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-extrabold text-blue-600 tracking-tight drop-shadow-lg">User Management</h2>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-premium w-64 max-w-full"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs sm:text-sm rounded-2xl overflow-hidden bg-white shadow-card backdrop-blur-md">
            <thead className="bg-gradient-to-r from-pink-100/80 to-blue-100/80">
              <tr>
                <th className="px-2 sm:px-6 py-3 text-left font-bold text-blue-700 uppercase tracking-wider">Avatar</th>
                <th className="px-2 sm:px-6 py-3 text-left font-bold text-blue-700 uppercase tracking-wider">Name</th>
                <th className="px-2 sm:px-6 py-3 text-left font-bold text-blue-700 uppercase tracking-wider">Email</th>
                <th className="px-2 sm:px-6 py-3 text-left font-bold text-blue-700 uppercase tracking-wider">Role</th>
                <th className="px-2 sm:px-6 py-3 text-left font-bold text-blue-700 uppercase tracking-wider">Status</th>
                <th className="px-2 sm:px-6 py-3 text-left font-bold text-blue-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-pink-50 transition">
                  <td className="px-2 sm:px-6 py-4">
                    <img src={user.avatar || '/images/default-avatar.png'} alt={user.name} className="w-10 h-10 rounded-full border border-pink-200 shadow" />
                  </td>
                  <td className="px-2 sm:px-6 py-4 font-semibold text-pink-700">{user.name}</td>
                  <td className="px-2 sm:px-6 py-4 text-blue-700">{user.email}</td>
                  <td className="px-2 sm:px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.isAdmin ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{user.isAdmin ? 'Admin' : 'User'}</span>
                  </td>
                  <td className="px-2 sm:px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.isBanned ? 'bg-pink-100 text-pink-700' : 'bg-green-100 text-green-700'}`}>{user.isBanned ? 'Banned' : 'Active'}</span>
                  </td>
                  <td className="px-2 sm:px-6 py-4 flex gap-2">
                    <button
                      className="btn-gradient px-3 py-1 rounded-lg text-xs font-semibold shadow"
                      onClick={() => handleResetPassword(user._id)}
                    >
                      Reset Password
                    </button>
                    <button
                      className={`px-3 py-1 rounded-lg text-xs font-semibold shadow ${user.isBanned ? 'bg-green-200 text-green-700' : 'bg-pink-200 text-pink-700'}`}
                      onClick={() => dispatch(banUser(user._id))}
                    >
                      {user.isBanned ? 'Unban' : 'Ban'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
