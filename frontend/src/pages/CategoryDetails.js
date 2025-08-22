import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductsByCategory } from '../features/product/productSlice';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';

const CategoryDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { products, isLoading, isError, message } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(getProductsByCategory(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
  }, [isError, message]);

  useEffect(() => {
    AOS.init({ duration: 900, once: true, offset: 40 });
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 text-gray-900 container mx-auto px-4 py-8 font-sans animate-fade-in">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 drop-shadow-lg animate-fade-in" data-aos="fade-down">
        {products[0]?.category?.name || 'Category Products'}
      </h1>

      {products.length === 0 ? (
        <p className="text-gray-600 animate-fade-in" data-aos="fade-up">No products found in this category.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in" data-aos="fade-up">
          {products.map((product, idx) => (
            <div
              key={product._id}
              className="bg-white/90 rounded-2xl shadow-card overflow-hidden hover:shadow-2xl hover:scale-[1.035] transition-all duration-300 backdrop-blur-md flex flex-col glass-card animate-fade-in"
              data-aos="zoom-in"
              data-aos-delay={100 + idx * 100}
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-64 object-cover object-center group-hover:opacity-80 transition-all duration-200"
              />
              <div className="p-5 flex-1 flex flex-col justify-between">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {product.name}
                </h2>
                <p className="text-gray-600 text-sm mb-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-lg font-bold text-primary-600">
                    ₦{product.price}
                  </span>
                  <button
                    className="bg-gradient-to-r from-primary-500 to-pink-500 text-white px-4 py-2 rounded-xl shadow-card hover:from-primary-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-semibold btn-gradient"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryDetails;