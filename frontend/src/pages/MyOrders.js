import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../features/order/orderSlice';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const MyOrders = () => {
  const dispatch = useDispatch();
  const { orders, isLoading, isError, message } = useSelector(
    (state) => state.order
  );
  const { user } = useSelector((state) => state.auth);
  const [search, setSearch] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    dispatch(getMyOrders());
  }, [dispatch, isError, message]);

  useEffect(() => {
    if (!user) return;
    const socket = io('/', { transports: ['websocket'] });
    if (orders && orders.length > 0) {
      orders.forEach((order) => {
        socket.emit('joinOrderRoom', order._id);
      });
    }
    socket.on('orderStatusUpdate', (data) => {
      toast.info(`Order #${data.orderId} status updated: ${data.status}`);
      dispatch(getMyOrders());
    });
    return () => {
      socket.disconnect();
    };
  }, [orders, user, dispatch]);

  useEffect(() => {
    if (!search) setFilteredOrders(orders);
    else
      setFilteredOrders(
        orders.filter(
          (order) =>
            order._id.includes(search) ||
            (order.status &&
              order.status.toLowerCase().includes(search.toLowerCase())) ||
            (order.trackingNumber &&
              order.trackingNumber.toLowerCase().includes(search.toLowerCase())) ||
            (order.createdAt &&
              new Date(order.createdAt).toLocaleDateString().includes(search))
        )
      );
  }, [search, orders]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-pink-300"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-10">
      <div className="max-w-6xl mx-auto card-haven">
        <h1 className="text-3xl font-extrabold text-primary-700 mb-10 tracking-tight drop-shadow-lg text-center">
          My Orders
        </h1>
        <div className="mb-8 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <input
            type="text"
            placeholder="Search by ID, status, tracking, or date"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-premium w-full sm:w-80"
          />
        </div>
        {!filteredOrders || filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-primary-300 text-lg bg-primary-50 rounded-2xl shadow-card-haven max-w-xl mx-auto">
            No orders found.<br />
            <Link
              to="/"
              className="mt-4 inline-block btn-gradient px-6 py-2 rounded-xl font-semibold shadow hover:scale-[1.03] transition-all duration-200"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white/90 rounded-2xl shadow-card-haven text-base">
              <thead className="bg-primary-50">
                <tr>
                  <th className="px-3 py-4 text-left font-bold text-primary-400 uppercase tracking-wider">Order ID</th>
                  <th className="px-3 py-4 text-left font-bold text-primary-400 uppercase tracking-wider">Date</th>
                  <th className="px-3 py-4 text-left font-bold text-primary-400 uppercase tracking-wider">Total</th>
                  <th className="px-3 py-4 text-left font-bold text-primary-400 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-4 text-left font-bold text-primary-400 uppercase tracking-wider">Delivery</th>
                  <th className="px-3 py-4 text-left font-bold text-primary-400 uppercase tracking-wider">Tracking</th>
                  <th className="px-3 py-4 text-left font-bold text-primary-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-blue-50/60 transition">
                    <td className="px-3 py-4 whitespace-nowrap text-primary-700 font-mono font-semibold">{order._id}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-primary-700">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-pink-500 font-bold">₦{order.totalPrice.toFixed(2)}</td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full shadow ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.isPaid ? 'Paid' : 'Not Paid'}</span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full shadow ${order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.isDelivered ? 'Delivered' : 'Not Delivered'}</span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-primary-700">{order.status || (order.isDelivered ? 'Delivered' : 'Processing')}</td>
                    <td className="px-3 py-4 whitespace-nowrap flex gap-2">
                      <Link
                        to={`/order/${order._id}`}
                        className="btn-gradient px-4 py-1 rounded-xl font-semibold shadow hover:scale-[1.03] transition-all duration-200"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => window.open(`/api/orders/${order._id}/invoice`, '_blank')}
                        className="btn-gradient px-4 py-1 rounded-xl font-semibold shadow hover:scale-[1.03] transition-all duration-200"
                      >
                        Invoice
                      </button>
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

export default MyOrders;