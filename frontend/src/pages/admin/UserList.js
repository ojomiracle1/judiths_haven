import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers, deleteUser } from '../../features/user/userSlice';
import { toast } from 'react-toastify';
import Spinner from '../../components/Spinner';
import axios from 'axios';
import { saveAs } from 'file-saver';
import api from '../../utils/axios';

const UserList = () => {
  const dispatch = useDispatch();
  const { users = [], isLoading, isError, message } = useSelector((state) => state.user);
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [bulkUpdateFields, setBulkUpdateFields] = useState({ role: '', status: '' });
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    dispatch(getUsers());
    setSelected([]);
    setSelectAll(false);
  }, [dispatch, isError, message]);

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };
  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
      setSelectAll(false);
    } else {
      setSelected(users.map((u) => u._id));
      setSelectAll(true);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(id))
        .unwrap()
        .then(() => {
          toast.success('User deleted successfully');
        })
        .catch((error) => {
          toast.error(error);
        });
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    if (!window.confirm(`Delete ${selected.length} users? This cannot be undone!`)) return;
    setBulkLoading(true);
    try {
      await axios.post('/api/users/bulk-delete', { userIds: selected });
      toast.success('Users deleted');
      dispatch(getUsers());
      setSelected([]);
      setSelectAll(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk delete failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkUpdate = async (e) => {
    e.preventDefault();
    setBulkLoading(true);
    try {
      await axios.put('/api/users/bulk-update', {
        userIds: selected,
        update: bulkUpdateFields,
      });
      toast.success('Users updated');
      dispatch(getUsers());
      setSelected([]);
      setSelectAll(false);
      setShowBulkUpdate(false);
      setBulkUpdateFields({ role: '', status: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk update failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExport = async (format) => {
    setExportLoading(true);
    try {
      const res = await api.get(`/api/users/export?format=${format}`, {
        responseType: 'blob',
      });
      const filename = `users.${format === 'excel' ? 'xlsx' : 'csv'}`;
      saveAs(res.data, filename);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Bulk Action Bar */}
      {selected.length > 0 && (
        <div className="mb-4 flex flex-col sm:flex-row gap-2 items-center justify-between bg-blue-50 border border-blue-200 rounded-xl p-3 shadow">
          <span className="font-semibold text-blue-800">{selected.length} selected</span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkDelete}
              disabled={bulkLoading}
              className="bg-gradient-to-r from-red-200 to-pink-200 hover:from-red-300 hover:to-pink-300 text-red-900 font-semibold rounded-lg px-4 py-1 shadow focus:outline-none focus:ring-2 focus:ring-red-200 transition-all duration-150"
            >
              {bulkLoading ? 'Deleting...' : 'Bulk Delete'}
            </button>
            <button
              onClick={() => setShowBulkUpdate(true)}
              disabled={bulkLoading}
              className="bg-gradient-to-r from-green-200 to-blue-200 hover:from-green-300 hover:to-blue-300 text-blue-900 font-semibold rounded-lg px-4 py-1 shadow focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-150"
            >
              Bulk Update
            </button>
          </div>
        </div>
      )}
      {/* Bulk Update Modal */}
      {showBulkUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Bulk Update Users</h2>
            <form onSubmit={handleBulkUpdate} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Role</label>
                <select
                  value={bulkUpdateFields.role}
                  onChange={e => setBulkUpdateFields(f => ({ ...f, role: e.target.value }))}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">-- No Change --</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Status</label>
                <select
                  value={bulkUpdateFields.status}
                  onChange={e => setBulkUpdateFields(f => ({ ...f, status: e.target.value }))}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">-- No Change --</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowBulkUpdate(false)}
                  className="px-4 py-1 rounded bg-gray-200"
                  disabled={bulkLoading}
                >Cancel</button>
                <button
                  type="submit"
                  className="px-4 py-1 rounded bg-blue-500 text-white font-semibold"
                  disabled={bulkLoading}
                >{bulkLoading ? 'Updating...' : 'Update'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight drop-shadow-lg">Users</h1>
        <div className="flex gap-2 items-center">
          <Link
            to="/admin/user/new"
            className="bg-gradient-to-r from-pink-200 to-blue-200 hover:from-pink-300 hover:to-blue-300 text-blue-900 font-semibold rounded-xl px-6 py-2 shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-200 w-full sm:w-auto text-center"
          >
            Add New User
          </Link>
          <div className="relative">
            <button
              className="bg-gradient-to-r from-green-200 to-blue-200 hover:from-green-300 hover:to-blue-300 text-blue-900 font-semibold rounded-xl px-4 py-2 shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={exportLoading}
              onClick={() => handleExport('csv')}
            >
              {exportLoading ? 'Exporting...' : 'Export CSV'}
            </button>
            <button
              className="ml-2 bg-gradient-to-r from-blue-200 to-green-200 hover:from-blue-300 hover:to-green-300 text-green-900 font-semibold rounded-xl px-4 py-2 shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-200"
              disabled={exportLoading}
              onClick={() => handleExport('excel')}
            >
              {exportLoading ? 'Exporting...' : 'Export Excel'}
            </button>
          </div>
        </div>
      </div>
      {!users || users.length === 0 ? (
        <div className="text-center py-16 bg-white/70 rounded-2xl shadow-inner">
          <p className="text-gray-500 text-lg">No users found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="bg-white/80 shadow-2xl rounded-3xl p-4 sm:p-8 border border-blue-100">
            <table className="min-w-full text-sm rounded-2xl overflow-hidden">
              <thead className="bg-gradient-to-r from-pink-100/80 to-blue-100/80">
                <tr>
                  <th className="px-2 py-3">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      aria-label="Select all users"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-pink-50/60 transition-all duration-150">
                    <td className="px-2 py-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(user._id)}
                        onChange={() => handleSelect(user._id)}
                        aria-label={`Select user ${user.name}`}
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-800 font-semibold">{user.name}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-700">{user.email}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button onClick={() => handleDelete(user._id)} className="bg-gradient-to-r from-red-200 to-pink-200 hover:from-red-300 hover:to-pink-300 text-red-900 font-semibold rounded-lg px-4 py-1 shadow focus:outline-none focus:ring-2 focus:ring-red-200 transition-all duration-150">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;