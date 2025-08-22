import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderById } from '../features/order/orderSlice';
import { clearCartItems } from '../features/cart/cartSlice';
import { toast } from 'react-toastify';

const OrderSuccess = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { order, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (id) {
      dispatch(getOrderById(id));
      dispatch(clearCartItems());
      toast.success('Order placed successfully!');
    }
  }, [dispatch, id, error]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-green-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-green-100">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-green-600 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600">
            Thank you for your purchase. You will be redirected to your orders page
            shortly.
          </p>
        </div>
        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold text-pink-600 mb-4">
            Order Details
          </h2>
          {order && (
            <div className="space-y-2 text-gray-700">
              <div>
                <span className="font-medium">Order ID:</span> {order._id}
              </div>
              <div>
                <span className="font-medium">Total:</span> ${order.totalPrice}
              </div>
              <div>
                <span className="font-medium">Status:</span>{' '}
                <span className="text-green-600 font-semibold">
                  {order.status || 'Confirmed'}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/myorders"
            className="inline-block px-6 py-3 bg-gradient-to-r from-green-400 via-blue-400 to-pink-400 text-white font-bold rounded-xl shadow-lg hover:from-green-500 hover:to-pink-500 transition"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;