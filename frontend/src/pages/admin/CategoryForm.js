import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createCategory, updateCategory, getCategoryById, reset } from '../../features/category/categorySlice';
import { toast } from 'react-toastify';

const CategoryForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
  });

  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isError, message, isSuccess } = useSelector(
    (state) => state.category
  );
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }

    if (isError) {
      toast.error(message);
    }

    if (isSuccess) {
      dispatch(reset());
      navigate('/admin/categories');
    }

    if (id) {
      dispatch(getCategoryById(id))
        .unwrap()
        .then((category) => {
          setFormData({
            name: category.name,
            description: category.description,
            image: category.image,
          });
        })
        .catch((error) => {
          toast.error(error);
        });
    }
  }, [user, navigate, isError, message, isSuccess, dispatch, id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (id) {
      dispatch(updateCategory({ id, categoryData: formData }))
        .unwrap()
        .then(() => {
          toast.success('Category updated successfully');
          navigate('/admin/categories');
        })
        .catch((error) => {
          toast.error(error);
        });
    } else {
      dispatch(createCategory(formData))
        .unwrap()
        .then(() => {
          toast.success('Category created successfully');
          navigate('/admin/categories');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-green-50 py-12 px-4">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8 border border-pink-100">
        <h1 className="text-3xl font-extrabold text-pink-600 tracking-tight drop-shadow-lg text-center mb-8">{id ? 'Edit Category' : 'Create Category'}</h1>
        <form onSubmit={handleSubmit} className="space-y-8">
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
          </div>
          <div>
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
          </div>
          <div>
            <label htmlFor="image" className="block text-base font-semibold text-primary-700 mb-1">Image URL</label>
            <input
              id="image"
              name="image"
              type="text"
              className="input-premium"
              value={formData.image}
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 btn-gradient font-semibold rounded-xl shadow-lg hover:scale-[1.03] transition-all duration-200"
          >
            {id ? 'Update Category' : 'Create Category'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;