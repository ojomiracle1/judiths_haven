import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductById, updateProduct } from '../../features/product/productSlice';
import { toast } from 'react-toastify';
import * as yup from 'yup';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  price: yup.number().min(0, 'Price must be a positive number').required('Price is required'),
  brand: yup.string().required('Brand is required'),
  category: yup.string().required('Category is required'),
  countInStock: yup.number().min(0, 'Stock must be a non-negative integer').required('Stock is required'),
  description: yup.string().required('Description is required'),
});

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoading, isError, message } = useSelector((state) => state.product);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    brand: '',
    category: '',
    countInStock: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    dispatch(getProductById(id));
  }, [dispatch, id, isError, message]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
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
    dispatch(updateProduct({ id, ...formData }));
    navigate('/admin/productlist');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-green-50 py-12 px-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 border border-pink-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-pink-600 tracking-tight">Edit Product</h1>
          <Link
            to="/admin/productlist"
            className="px-4 py-2 bg-gradient-to-r from-blue-400 to-pink-400 text-white font-bold rounded-xl shadow hover:from-blue-500 hover:to-pink-500 transition"
          >
            Back to List
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              placeholder="Product Name"
            />
            {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-xl border border-green-200 bg-green-50 px-4 py-2 shadow-sm focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
              placeholder="Price"
            />
            {errors.price && <div className="text-red-500 text-sm mt-1">{errors.price}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-xl border border-pink-200 bg-pink-50 px-4 py-2 shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition min-h-[90px]"
              placeholder="Description"
            />
            {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="mt-1 block w-full rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-2 shadow-sm focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition"
              placeholder="Image URL"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              placeholder="Brand"
            />
            {errors.brand && <div className="text-red-500 text-sm mt-1">{errors.brand}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-xl border border-pink-200 bg-pink-50 px-4 py-2 shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition"
              placeholder="Category"
            />
            {errors.category && <div className="text-red-500 text-sm mt-1">{errors.category}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <input
              type="number"
              name="countInStock"
              value={formData.countInStock}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-xl border border-green-200 bg-green-50 px-4 py-2 shadow-sm focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
              placeholder="Stock"
            />
            {errors.countInStock && <div className="text-red-500 text-sm mt-1">{errors.countInStock}</div>}
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-pink-400 via-blue-400 to-green-400 text-white font-bold rounded-xl shadow-lg hover:from-pink-500 hover:to-green-500 transition focus:outline-none focus:ring-2 focus:ring-pink-200"
          >
            Update Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductEdit;