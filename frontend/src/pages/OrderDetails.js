import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderById, updateOrderStatus, unmarkOrderAsDelivered } from '../features/order/orderSlice';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { order, loading, error } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.auth);

  const isAdmin = user && user.role === 'admin';
  const [status, setStatus] = useState(order?.status || '');
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
  const [notes, setNotes] = useState(order?.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  // --- WebSocket for real-time order tracking ---
  useEffect(() => {
    const socket = io('/', { transports: ['websocket'] });
    socket.emit('joinOrderRoom', id);
    socket.on('orderStatusUpdate', (data) => {
      if (data.orderId === id) {
        toast.info(`Order status updated: ${data.status}`);
        dispatch(getOrderById(id));
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [id, dispatch]);
  // --- End WebSocket ---

  useEffect(() => {
    if (!user) navigate('/login');
    dispatch(getOrderById(id));
  }, [dispatch, id, user, navigate]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    setStatus(order?.status || '');
    setTrackingNumber(order?.trackingNumber || '');
    setNotes(order?.notes || '');
  }, [order]);

  // Poll for real-time order updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(getOrderById(id));
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, [dispatch, id]);

  const handleStatusUpdate = (e) => {
    e.preventDefault();
    setIsUpdating(true);
    dispatch(updateOrderStatus({ id: order._id, status, trackingNumber, notes }))
      .unwrap()
      .then(() => {
        toast.success('Order status updated!');
        dispatch(getOrderById(id)); // Refetch order details to update UI
      })
      .catch((err) => toast.error(err))
      .finally(() => {
        setIsUpdating(false);
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-green-50">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-pink-100 max-w-lg w-full text-center">
          <h1 className="text-2xl font-bold text-pink-600 mb-4">Order Details</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-green-50 py-12 px-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl p-8 border border-pink-100">
        <h1 className="text-3xl font-extrabold text-pink-600 tracking-tight drop-shadow-lg text-center mb-8">Order Details</h1>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-primary-700 mb-4">Order Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-xl p-4 shadow">
              <div className="font-semibold">Order ID:</div>
              <div className="font-mono text-blue-700">{order?._id}</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 shadow">
              <div className="font-semibold">Status:</div>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold shadow bg-green-100 text-green-700">{order?.status}</div>
            </div>
          </div>
        </div>

        {/* Shipping Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-2 text-blue-700">Shipping</h2>
          <div className="text-gray-700 space-y-1">
            <div><strong>Name:</strong> {order.user?.name || 'Unknown User'}</div>
            <div><strong>Email:</strong> {order.user?.email || 'Unknown Email'}</div>
            <div><strong>Address:</strong> {order.shippingAddress?.address || 'Unknown Address'}, {order.shippingAddress?.city || ''} {order.shippingAddress?.postalCode || ''}, {order.shippingAddress?.country || ''}</div>
            {order.estimatedDelivery && (
              <div><strong>Estimated Delivery:</strong> {new Date(order.estimatedDelivery).toLocaleDateString()}</div>
            )}
          </div>
        </div>

        {/* Payment Card */}

        {/* Order Items Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-2 text-blue-700">Order Items</h2>
          <div className="divide-y divide-gray-100">
            {Array.isArray(order.orderItems) && order.orderItems.length > 0 ? (
              order.orderItems.map((item) => (
                <div key={item._id || item.product || item.name} className="flex items-center py-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div className="ml-4 flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-gray-600">{(item.qty || item.quantity) || 0} x ₦{item.price} = ₦{(((item.qty || item.quantity) || 0) * (item.price || 0)).toFixed(2)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No items found.</div>
            )}
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-gray-50 rounded-lg p-6 shadow mb-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between"><span>Items</span><span>₦{order.itemsPrice ? order.itemsPrice.toFixed(2) : '0.00'}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>₦{order.shippingPrice ? order.shippingPrice.toFixed(2) : '0.00'}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>₦{order.taxPrice ? order.taxPrice.toFixed(2) : '0.00'}</span></div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total</span><span>₦{order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}</span></div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-700">Order Status</h2>
            {/* Status Progress Bar */}
            <div className="flex items-center justify-between mb-4">
              {statusSteps.map((step, idx, arr) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div className={`rounded-full w-8 h-8 flex items-center justify-center text-white text-sm font-bold ${order.status === step || arr.slice(0, arr.indexOf(order.status) + 1).includes(step) ? 'bg-blue-600' : 'bg-gray-300'}`}>
                      {idx + 1}
                    </div>
                    <span className="mt-1 text-xs capitalize text-gray-700">{step}</span>
                  </div>
                  {idx < arr.length - 1 && (
                    <div className={`flex-1 h-1 mx-1 ${arr.slice(0, arr.indexOf(order.status) + 1).includes(step) ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="mb-2">
              <strong>Status:</strong> <span className={order.isDelivered ? 'text-green-600' : 'text-yellow-600'}>{order.status || (order.isDelivered ? 'Delivered' : 'Processing')}</span>
            </div>
            {order.trackingNumber && <div><strong>Tracking Number:</strong> {order.trackingNumber}</div>}
            {order.notes && <div><strong>Notes:</strong> {order.notes}</div>}
            {order.isDelivered && <div><strong>Delivered at:</strong> {new Date(order.deliveredAt).toLocaleDateString()}</div>}
            {isAdmin && (
              <form onSubmit={handleStatusUpdate} className="mt-4 space-y-2">
                <div>
                  <label className="block text-sm font-medium">Status</label>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value)} 
                    className="w-full border rounded px-2 py-1"
                    disabled={isUpdating}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Tracking Number</label>
                  <input 
                    type="text" 
                    value={trackingNumber} 
                    onChange={e => setTrackingNumber(e.target.value)} 
                    className="w-full border rounded px-2 py-1"
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Notes</label>
                  <textarea 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    className="w-full border rounded px-2 py-1"
                    disabled={isUpdating}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
                    isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isUpdating ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Updating...
                    </span>
                  ) : (
                    'Update Status'
                  )}
                </button>
              </form>
            )}
            {/* Cancellation and Return Buttons */}
            {order.status === 'pending' || order.status === 'processing' ? (
              <button
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/orders/${order._id}/cancel`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
                    const data = await res.json();
                    if (res.ok) {
                      window.location.reload();
                    } else {
                      alert(data.message);
                    }
                  } catch (err) {
                    alert('Error submitting cancellation request.');
                  }
                }}
                disabled={order.cancelRequested}
              >
                {order.cancelRequested ? 'Cancellation Requested' : 'Request Cancellation'}
              </button>
            ) : null}

            {order.isDelivered && order.deliveredAt && (Date.now() - new Date(order.deliveredAt).getTime() <= 5 * 24 * 60 * 60 * 1000) ? (
              <button
                className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 ml-2"
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/orders/${order._id}/return`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
                    const data = await res.json();
                    if (res.ok) {
                      window.location.reload();
                    } else {
                      alert(data.message);
                    }
                  } catch (err) {
                    alert('Error submitting return request.');
                  }
                }}
                disabled={order.returnRequested}
              >
                {order.returnRequested ? 'Return Requested' : 'Request Return'}
              </button>
            ) : null}

            {isAdmin && order.isDelivered && (
              <button
                className="mt-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 w-full"
                onClick={async (e) => {
                  e.preventDefault();
                  dispatch(unmarkOrderAsDelivered(order._id))
                    .unwrap()
                    .then(() => toast.success('Order marked as not delivered'))
                    .catch((err) => toast.error(err));
                }}
              >
                Unmark as Delivered
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;