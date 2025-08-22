import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCategories, deleteCategory } from '../../features/category/categorySlice';
import { toast } from 'react-toastify';

const CategoryList = () => {
  const dispatch = useDispatch();
  const { categories, isLoading, isError, message } = useSelector(
    (state) => state.category
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    dispatch(getCategories());
  }, [dispatch, isError, message]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      dispatch(deleteCategory(id))
        .unwrap()
        .then(() => {
          toast.success('Category deleted successfully');
        })
        .catch((error) => {
          toast.error(error);
        });
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-green-50 py-12 px-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl p-8 border border-pink-100">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-extrabold text-pink-600 tracking-tight drop-shadow-lg">Categories</h1>
          <Link
            to="/admin/categories/create"
            className="btn-gradient w-full sm:w-auto text-center"
          >
            Add Category
          </Link>
        </div>
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No categories found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm rounded-2xl overflow-hidden">
              <thead className="bg-gradient-to-r from-pink-100/80 to-blue-100/80">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-primary-700">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-primary-700">Description</th>
                  <th className="px-4 py-3 text-left font-semibold text-primary-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-pink-50 transition-all">
                    <td className="px-4 py-3 font-semibold">{cat.name}</td>
                    <td className="px-4 py-3">{cat.description}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <Link to={`/admin/categories/edit/${cat._id}`} className="btn-gradient px-4 py-2 rounded-xl font-semibold text-sm shadow hover:scale-105 transition-all">Edit</Link>
                      <button onClick={() => handleDelete(cat._id)} className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-semibold text-sm shadow hover:bg-red-200 transition-all">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryList;