import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrders, updateOrderToDelivered, unmarkOrderAsDelivered } from '../../features/order/orderSlice';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import axios from 'axios';
import { saveAs } from 'file-saver';

const OrderList = () => {
  const dispatch = useDispatch();
  const { orders, isLoading, isError, message } = useSelector((state) => state.order);
  const [search, setSearch] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(new Set()); // Track which orders are being updated
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [bulkUpdateFields, setBulkUpdateFields] = useState({ status: '' });
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (isError) toast.error(message);
    dispatch(getOrders({ page, limit }));
    setSelected([]);
    setSelectAll(false);
  }, [dispatch, isError, message, page, limit]);

  // --- WebSocket for real-time admin updates ---
  useEffect(() => {
    const socket = io('/', { transports: ['websocket'] });
    if (orders && orders.length > 0) {
      orders.forEach(order => {
        socket.emit('joinOrderRoom', order._id);
      });
    }
    socket.on('orderStatusUpdate', (data) => {
      toast.info(`Order #${data.orderId} status updated: ${data.status}`);
      dispatch(getOrders());
    });
    return () => {
      socket.disconnect();
    };
  }, [orders, dispatch]);
  // --- End WebSocket ---

  useEffect(() => {
    if (!search) setFilteredOrders(orders);
    else setFilteredOrders(
      orders.filter(order =>
        order._id.includes(search) ||
        (order.user && order.user.name && order.user.name.toLowerCase().includes(search.toLowerCase()))
      )
    );
  }, [search, orders]);

  const handleMarkAsDelivered = (id) => {
    setLoadingOrders(prev => new Set(prev).add(id));
    dispatch(updateOrderToDelivered(id))
      .unwrap()
      .then(() => {
        toast.success('Order marked as delivered');
        dispatch(getOrders()); // Refetch orders to update UI
      })
      .catch((error) => toast.error(error))
      .finally(() => {
        setLoadingOrders(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      });
  };

  const handleUnmarkAsDelivered = (id) => {
    setLoadingOrders(prev => new Set(prev).add(id));
    dispatch(unmarkOrderAsDelivered(id))
      .unwrap()
      .then(() => {
        toast.success('Order unmarked as delivered');
        dispatch(getOrders()); // Refetch orders to update UI
      })
      .catch((error) => toast.error(error))
      .finally(() => {
        setLoadingOrders(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      });
  };

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
      setSelected(filteredOrders.map((o) => o._id));
      setSelectAll(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    if (!window.confirm(`Delete ${selected.length} orders? This cannot be undone!`)) return;
    setBulkLoading(true);
    try {
      await axios.post('/api/orders/bulk-delete', { orderIds: selected });
      toast.success('Orders deleted');
      dispatch(getOrders({ page, limit }));
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
      await axios.put('/api/orders/bulk-update', {
        orderIds: selected,
        update: bulkUpdateFields,
      });
      toast.success('Orders updated');
      dispatch(getOrders({ page, limit }));
      setSelected([]);
      setSelectAll(false);
      setShowBulkUpdate(false);
      setBulkUpdateFields({ status: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk update failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExport = async (format) => {
    setExportLoading(true);
    try {
      const res = await axios.get(`/api/orders/export?format=${format}`, {
        responseType: 'blob',
      });
      const filename = `orders.${format === 'excel' ? 'xlsx' : 'csv'}`;
      saveAs(res.data, filename);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  // Calculate total pages for pagination
  const pages = Math.ceil(filteredOrders.length / limit) || 1;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
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
              Bulk Update Status
            </button>
          </div>
        </div>
      )}
      {/* Bulk Update Modal */}
      {showBulkUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Bulk Update Orders</h2>
            <form onSubmit={handleBulkUpdate} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Status</label>
                <select
                  value={bulkUpdateFields.status}
                  onChange={e => setBulkUpdateFields(f => ({ ...f, status: e.target.value }))}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">-- No Change --</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
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
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight drop-shadow-lg">All Orders</h1>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search by Order ID or User Name"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-premium w-full sm:w-64"
          />
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
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white/70 rounded-2xl shadow-inner">
          <p className="text-gray-500 text-lg">No orders found.</p>
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
                      aria-label="Select all orders"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">Payment Status</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">Delivery Status</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-pink-50/60 transition-all duration-150">
                    <td className="px-2 py-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(order._id)}
                        onChange={() => handleSelect(order._id)}
                        aria-label={`Select order ${order._id}`}
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-800 font-semibold">{order._id}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-700">{order.user?.name || 'Unknown User'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-800">₦{order.totalPrice}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{order.isPaid ? 'Paid' : 'Not Paid'}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.isDelivered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{order.isDelivered ? 'Delivered' : 'Not Delivered'}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Link to={`/admin/order/${order._id}`} className="bg-gradient-to-r from-blue-200 to-green-200 hover:from-blue-300 hover:to-green-300 text-blue-900 font-semibold rounded-lg px-4 py-1 shadow focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-150">Details</Link>
                        {order.isDelivered ? (
                          <button 
                            onClick={() => handleUnmarkAsDelivered(order._id)}
                            disabled={loadingOrders.has(order._id)}
                            className={`bg-gradient-to-r from-yellow-200 to-pink-200 hover:from-yellow-300 hover:to-pink-300 text-yellow-900 font-semibold rounded-lg px-4 py-1 shadow focus:outline-none focus:ring-2 focus:ring-yellow-200 transition-all duration-150 ${
                              loadingOrders.has(order._id) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {loadingOrders.has(order._id) ? (
                              <span className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-yellow-600 mr-2"></div>
                                Updating...
                              </span>
                            ) : (
                              'Unmark as Delivered'
                            )}
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleMarkAsDelivered(order._id)}
                            disabled={loadingOrders.has(order._id)}
                            className={`bg-gradient-to-r from-green-200 to-blue-200 hover:from-green-300 hover:to-blue-300 text-green-900 font-semibold rounded-lg px-4 py-1 shadow focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-150 ${
                              loadingOrders.has(order._id) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {loadingOrders.has(order._id) ? (
                              <span className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-600 mr-2"></div>
                                Updating...
                              </span>
                            ) : (
                              'Mark as Delivered'
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mt-6">
        <div>
          <label htmlFor="limit" className="mr-2">Per page:</label>
          <select id="limit" value={limit} onChange={e => setLimit(Number(e.target.value))}>
            {[5, 10, 20, 50].map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div>
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`mx-1 px-3 py-1 rounded ${p === page ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderList;