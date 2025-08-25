import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, updateProduct, getProductById, reset } from '../../features/product/productSlice';
import { toast } from 'react-toastify';
import { getCategories } from '../../features/category/categorySlice';
import Spinner from '../../components/Spinner';
import api from '../../utils/axios';
import * as yup from 'yup';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  price: yup.number().min(0, 'Price must be a positive number').required('Price is required'),
  brand: yup.string().required('Brand is required'),
  category: yup.string().required('Category is required'),
  countInStock: yup.number().min(0, 'Stock must be a non-negative integer').required('Stock is required'),
  description: yup.string().required('Description is required'),
});

const ProductForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    images: [],
    brand: '',
    category: '',
    countInStock: '',
    sizes: [],
    colors: [],
    features: [], // new
    gender: 'unisex', // new
    featured: false, // new
    discount: 0, // new
    discountPrice: '', // new
  });

  const [uploading, setUploading] = useState(false);
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [featureInput, setFeatureInput] = useState(''); // new
  const [errors, setErrors] = useState({});

  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isError, message, isSuccess } = useSelector((state) => state.product);
  const { user } = useSelector((state) => state.auth);
  const { categories } = useSelector((state) => state.category);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }

    if (isError) {
      toast.error(message);
    }

    if (isSuccess) {
      dispatch(reset());
      navigate('/admin/products');
    }

    dispatch(getCategories());

    if (id) {
      dispatch(getProductById(id))
        .unwrap()
        .then((product) => {
          setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            images: product.images || [],
            brand: product.brand,
            category: product.category,
            countInStock: product.countInStock,
            sizes: product.sizes || [],
            colors: product.colors || [],
            features: product.features || [], // new
            gender: product.gender || 'unisex', // new
            featured: product.featured || false, // new
            discount: product.discount || 0, // new
            discountPrice: product.discountPrice || '', // new
          });
        })
        .catch((error) => {
          toast.error(error);
        });
    }
  }, [user, navigate, isError, message, isSuccess, dispatch, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const uploadFileHandler = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };

  const { data } = await api.post('/upload', formData, config);
        return data.path;
      });

      const uploadedPaths = await Promise.all(uploadPromises);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedPaths],
      }));
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
      toast.error('Upload failed');
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const addSize = () => {
    if (sizeInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        sizes: [...prev.sizes, sizeInput.trim()],
      }));
      setSizeInput('');
    }
  };

  const removeSize = (index) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  const addColor = () => {
    if (colorInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, colorInput.trim()],
      }));
      setColorInput('');
    }
  };

  const removeColor = (index) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, featureInput.trim()],
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
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
    const productData = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      images: formData.images,
      brand: formData.brand,
      category: formData.category,
      countInStock: Number(formData.countInStock),
      sizes: formData.sizes,
      colors: formData.colors,
      features: formData.features, // new
      gender: formData.gender, // new
      featured: formData.featured, // new
      discount: Number(formData.discount), // new
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null, // new
    };

    if (id) {
      dispatch(updateProduct({ id, productData }))
        .unwrap()
        .then(() => {
          toast.success('Product updated successfully');
          navigate('/admin/products');
        })
        .catch((error) => {
          toast.error(error);
        });
    } else {
      dispatch(createProduct(productData))
        .unwrap()
        .then(() => {
          toast.success('Product created successfully');
          navigate('/admin/products');
        })
        .catch((error) => {
          toast.error(error);
        });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-green-50">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-green-50 py-12 px-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 border border-pink-100">
        <h1 className="text-3xl font-extrabold mb-8 text-pink-600 tracking-tight drop-shadow-lg text-center">
          {id ? 'Edit Product' : 'Create Product'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Basic Info */}
          <div className="haven-section">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <label htmlFor="name" className="block text-base font-semibold text-primary-700 mb-1">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="input-premium"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
              </div>
              <div>
                <label htmlFor="brand" className="block text-base font-semibold text-primary-700 mb-1">Brand</label>
                <input
                  id="brand"
                  name="brand"
                  type="text"
                  required
                  className="input-premium"
                  value={formData.brand}
                  onChange={handleChange}
                />
                {errors.brand && <div className="text-red-500 text-sm mt-1">{errors.brand}</div>}
              </div>
            </div>
            <div className="mt-6">
              <label htmlFor="description" className="block text-base font-semibold text-primary-700 mb-1">Description</label>
              <textarea
                id="description"
                name="description"
                rows="3"
                required
                className="input-premium min-h-[90px]"
                value={formData.description}
                onChange={handleChange}
              />
              {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
            </div>
          </div>
          {/* Pricing & Stock */}
          <div className="haven-section">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <label htmlFor="price" className="block text-base font-semibold text-primary-700 mb-1">Price</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  required
                  className="input-premium"
                  value={formData.price}
                  onChange={handleChange}
                />
                {errors.price && <div className="text-red-500 text-sm mt-1">{errors.price}</div>}
              </div>
              <div>
                <label htmlFor="countInStock" className="block text-base font-semibold text-primary-700 mb-1">Stock</label>
                <input
                  id="countInStock"
                  name="countInStock"
                  type="number"
                  required
                  className="input-premium"
                  value={formData.countInStock}
                  onChange={handleChange}
                />
                {errors.countInStock && <div className="text-red-500 text-sm mt-1">{errors.countInStock}</div>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-6">
              <div>
                <label htmlFor="discount" className="block text-base font-semibold text-primary-700 mb-1">Discount (%)</label>
                <input
                  id="discount"
                  name="discount"
                  type="number"
                  min="0"
                  max="100"
                  className="input-premium"
                  value={formData.discount}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="discountPrice" className="block text-base font-semibold text-primary-700 mb-1">Discount Price</label>
                <input
                  id="discountPrice"
                  name="discountPrice"
                  type="number"
                  className="input-premium"
                  value={formData.discountPrice}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          {/* Category & Images */}
          <div className="haven-section">
            <div className="mb-6">
              <label htmlFor="category" className="block text-base font-semibold text-primary-700 mb-1">Category</label>
              <select
                id="category"
                name="category"
                required
                className="input-premium"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <div className="text-red-500 text-sm mt-1">{errors.category}</div>}
            </div>
            <div>
              <label className="block text-base font-semibold text-primary-700 mb-1">Images</label>
              <div className="mt-1">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={uploadFileHandler}
                  className="input-premium file:bg-gradient-to-r file:from-pink-200 file:to-blue-200 file:text-primary-700 file:rounded-lg file:shadow file:font-semibold file:px-4 file:py-2 hover:file:from-pink-300 hover:file:to-blue-300"
                />
                {uploading && <Spinner />}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-xl border border-pink-100"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 btn-gradient p-1 rounded-full shadow"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Variants & Features */}
          <div className="haven-section">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <label className="block text-base font-semibold text-primary-700 mb-1">Sizes</label>
                <div className="mt-1 flex space-x-2">
                  <input
                    type="text"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    placeholder="Add a size (e.g., 10, 11, 12)"
                    className="input-premium"
                  />
                  <button
                    type="button"
                    onClick={addSize}
                    className="btn-gradient"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.sizes.map((size, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 shadow"
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-base font-semibold text-primary-700 mb-1">Colors</label>
                <div className="mt-1 flex space-x-2">
                  <input
                    type="text"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    placeholder="Add a color"
                    className="input-premium"
                  />
                  <button
                    type="button"
                    onClick={addColor}
                    className="btn-gradient"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.colors.map((color, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800 shadow"
                    >
                      {color}
                      <button
                        type="button"
                        onClick={() => removeColor(index)}
                        className="ml-2 text-pink-600 hover:text-pink-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8">
              <label className="block text-base font-semibold text-primary-700 mb-1">Features</label>
              <div className="mt-1 flex space-x-2">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="Add a feature"
                  className="input-premium"
                />
                <button type="button" onClick={addFeature} className="btn-gradient">Add</button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 shadow">
                    {feature}
                    <button type="button" onClick={() => removeFeature(index)} className="ml-2 text-green-600 hover:text-green-800">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          {/* Other Options */}
          <div className="haven-section">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
              <div>
                <label htmlFor="gender" className="block text-base font-semibold text-primary-700 mb-1">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  className="input-premium"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="unisex">Unisex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="flex items-center mt-6 sm:mt-0">
                <input
                  id="featured"
                  name="featured"
                  type="checkbox"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="featured" className="text-base font-semibold text-primary-700">Featured Product</label>
              </div>
            </div>
          </div>
          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 btn-gradient font-semibold rounded-xl shadow-lg hover:scale-[1.03] transition-all duration-200"
            >
              {id ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;