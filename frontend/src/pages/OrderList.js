import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getOrders } from '../features/order/orderSlice';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';

const OrderList = () => {
  const dispatch = useDispatch();
  const { orders, isLoading, isError, message } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(getOrders())
      .unwrap()
      .then((data) => {
        console.log('Orders data:', data);
      })
      .catch((error) => {
        console.error('Error fetching orders:', error);
      });
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
  }, [isError, message]);

  console.log('Current orders state:', orders);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-green-50">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-green-50">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-pink-100 max-w-lg w-full text-center">
          <h1 className="text-2xl font-bold text-pink-600 mb-4">Orders</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
            {message}
          </div>
        </div>
      </div>
    );
  }

  // Ensure orders is an array before mapping
  const ordersList = Array.isArray(orders) ? orders : [];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-green-50 py-12 px-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl p-8 border border-pink-100">
        <h1 className="text-3xl font-extrabold text-pink-600 tracking-tight drop-shadow-lg text-center mb-8">
          Orders
        </h1>
        {ordersList.length === 0 ? (
          <p className="text-gray-500 text-center">No orders found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm rounded-2xl overflow-hidden">
              <thead className="bg-gradient-to-r from-pink-100/80 to-blue-100/80">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-primary-700">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-primary-700">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-primary-700">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-primary-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-primary-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {ordersList.map((order) => (
                  <tr key={order._id} className="hover:bg-pink-50 transition-all">
                    <td className="px-4 py-3 font-mono text-blue-700">{order._id}</td>
                    <td className="px-4 py-3">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">${order.totalPrice.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow ${
                          order.isPaid
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {order.isPaid ? 'Paid' : 'Not Paid'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/order/${order._id}`}
                        className="btn-gradient px-4 py-2 rounded-xl font-semibold text-sm shadow hover:scale-105 transition-all"
                      >
                        View
                      </Link>
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

export default OrderList;