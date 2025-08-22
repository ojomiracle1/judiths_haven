import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getUsers } from '../../features/user/userSlice';
import { getProducts } from '../../features/product/productSlice';
import { getOrders } from '../../features/order/orderSlice';
import Spinner from '../../components/Spinner';
import api from '../../utils/axios';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { FaUsers, FaBoxes, FaShoppingCart, FaMoneyBillWave, FaExclamationTriangle } from 'react-icons/fa';
import AdminDashboardAnalytics from '../../components/AdminDashboardAnalytics';
import WishlistHighlights from '../../components/WishlistHighlights';
import RecommendedProducts from '../../components/RecommendedProducts';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { users = [], isLoading: usersLoading } = useSelector((state) => state.user);
  const { products = [], isLoading: productsLoading } = useSelector((state) => state.product);
  const { orders = [], isLoading: ordersLoading } = useSelector((state) => state.order);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [lowStockLoading, setLowStockLoading] = useState(true);
  const [lowStockError, setLowStockError] = useState('');
  const [salesStats, setSalesStats] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [topProducts, setTopProducts] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [yearlyTotals, setYearlyTotals] = useState({});
  const [inventoryStats, setInventoryStats] = useState({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedTimeframe, setSelectedTimeframe] = useState('yearly');
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(getUsers());
    dispatch(getProducts());
    dispatch(getOrders());
    // Fetch low stock products
    const fetchLowStock = async () => {
      setLowStockLoading(true);
      setLowStockError('');
      try {
        const res = await api.get('/api/products/low-stock', {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setLowStockProducts(res.data.products || []);
      } catch (err) {
        setLowStockError('Failed to fetch low stock products');
      } finally {
        setLowStockLoading(false);
      }
    };
    if (user?.isAdmin) fetchLowStock();
  }, [dispatch, user]);

  useEffect(() => {
    // Fetch analytics data
    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError('');
      try {
        const year = selectedYear;
        const salesRes = await api.get(`/api/sales-stats/yearly?year=${year}`);
        setSalesStats(salesRes.data || []);
        
        // Get yearly totals
        const totalsRes = await api.get(`/api/sales-stats/total?year=${year}`);
        setYearlyTotals(totalsRes.data || { totalSales: 0, totalOrders: 0 });
        
        const usersRes = await api.get('/api/users');
        // Group users by month
        const usersByMonth = Array(12).fill(0);
        usersRes.data.forEach(u => {
          const d = new Date(u.createdAt);
          if (d.getFullYear() === year) usersByMonth[d.getMonth()]++;
        });
        setUserStats(usersByMonth);
        
        // Fetch top products
        const topProductsRes = await api.get(`/api/orders/aggregate/top-products?year=${year}`);
        setTopProducts(topProductsRes.data || []);
        
        // Fetch sales by category
        const catSalesRes = await api.get(`/api/orders/aggregate/sales-by-category?year=${year}`);
        setCategorySales(catSalesRes.data || []);
        
        // Calculate inventory statistics
        const inStock = products.filter(p => p.countInStock > 0).length;
        const outOfStock = products.filter(p => p.countInStock === 0).length;
        const lowStock = products.filter(p => p.countInStock > 0 && p.countInStock <= 5).length;
        const totalInventoryValue = products.reduce((sum, p) => sum + (p.price * p.countInStock), 0);
        
        setInventoryStats({
          inStock,
          outOfStock,
          lowStock,
          totalValue: totalInventoryValue
        });
      } catch (err) {
        setStatsError('Failed to load analytics');
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [dispatch, user]);

  if (usersLoading || productsLoading || ordersLoading) return <Spinner />
  
  // Calculate key metrics
  const totalSales = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  const recentOrders = orders.slice(-5).reverse();
  const averageOrderValue = orders.length > 0 ? totalSales / orders.length : 0;
  const paidOrders = orders.filter(order => order.isPaid).length;
  const orderConversionRate = orders.length > 0 ? (paidOrders / orders.length * 100).toFixed(1) : 0;
  
  // Year selector options
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = currentYear - 2; i <= currentYear; i++) {
    yearOptions.push(i);
  }

  // Get token from localStorage (or auth state if available)
  const token = user?.token || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : '');
  return (
    <div className="container mx-auto px-2 sm:px-4 py-10">
      <Helmet>
        <title>Admin Dashboard - Judith's Haven</title>
        <meta name="description" content="Admin dashboard for managing users, products, orders, and analytics at Judith's Haven." />
        <link rel="canonical" href="https://yourdomain.com/admin/dashboard" />
      </Helmet>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-6 text-primary-700 tracking-tight drop-shadow-lg text-center">{t('adminDashboard')}</h1>
        
        {/* Admin Dashboard Analytics Component */}
        {token && <AdminDashboardAnalytics token={token} />}

        {/* Admin Insights: Wishlist Highlights & Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <WishlistHighlights token={token} />
          <RecommendedProducts token={token} />
        </div>
        
        {/* Time Period Selector */}
        <div className="flex justify-center items-center mb-8 gap-4">
          <div className="flex items-center">
            <label htmlFor="year-select" className="mr-2 text-gray-700">{t('year')}:</label>
            <select 
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4 flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <FaMoneyBillWave className="text-blue-500 text-xl" />
            </div>
            <div>
              <h3 className="text-sm text-gray-500">{t('totalSales')}</h3>
              <p className="text-2xl font-bold text-blue-600">₦{totalSales.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{yearlyTotals.totalOrders || 0} {t('orders')}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4 flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <FaUsers className="text-green-500 text-xl" />
            </div>
            <div>
              <h3 className="text-sm text-gray-500">{t('totalUsers')}</h3>
              <p className="text-2xl font-bold text-green-600">{users.length}</p>
              <p className="text-xs text-gray-500">{userStats.reduce((a, b) => a + b, 0)} {t('newThisYear')}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4 flex items-center">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <FaBoxes className="text-purple-500 text-xl" />
            </div>
            <div>
              <h3 className="text-sm text-gray-500">{t('inventory')}</h3>
              <p className="text-2xl font-bold text-purple-600">{products.length}</p>
              <p className="text-xs text-gray-500">₦{inventoryStats.totalValue?.toLocaleString() || 0} {t('value')}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4 flex items-center">
            <div className="rounded-full bg-yellow-100 p-3 mr-4">
              <FaShoppingCart className="text-yellow-500 text-xl" />
            </div>
            <div>
              <h3 className="text-sm text-gray-500">{t('avgOrderValue')}</h3>
              <p className="text-2xl font-bold text-yellow-600">₦{averageOrderValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
              <p className="text-xs text-gray-500">{orderConversionRate}% {t('conversionRate')}</p>
            </div>
          </div>
        </div>
        {/* Analytics Charts */}
        <div className="mb-10">
          {statsLoading ? (
            <div>Loading analytics...</div>
          ) : statsError ? (
            <div className="text-red-500">{statsError}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow p-4">
                <h3 className="font-bold mb-2">{t('monthlySales')}</h3>
                <Line
                  data={{
                    labels: [
                      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                    ],
                    datasets: [
                      {
                        label: t('sales') + ' (₦)',
                        data: salesStats.map(s => s.totalSales),
                        borderColor: 'rgba(75,192,192,1)',
                        backgroundColor: 'rgba(75,192,192,0.2)',
                        tension: 0.3,
                        fill: true,
                      },
                      {
                        label: t('orders'),
                        data: salesStats.map(s => s.totalOrders),
                        borderColor: 'rgba(255,99,132,1)',
                        backgroundColor: 'rgba(255,99,132,0.2)',
                        tension: 0.3,
                        fill: false,
                        yAxisID: 'y1',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: 'top' }, title: { display: false } },
                    scales: { y1: { position: 'right', grid: { drawOnChartArea: false } } },
                  }}
                />
              </div>
              <div className="bg-white rounded-xl shadow p-4">
                <h3 className="font-bold mb-2">{t('userRegistrations')} ({t('monthly')})</h3>
                <Bar
                  data={{
                    labels: [
                      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                    ],
                    datasets: [
                      {
                        label: t('users'),
                        data: userStats,
                        backgroundColor: 'rgba(54,162,235,0.5)',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false }, title: { display: false } },
                  }}
                />
              </div>
            </div>
          )}
        </div>
        {/* More Analytics Charts */}
        <div className="mb-10">
          {statsLoading ? null : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow p-4">
                <h3 className="font-bold mb-2">{t('top5Products')} ({t('byQuantitySold')})</h3>
                <Bar
                  data={{
                    labels: topProducts.map(p => p.name),
                    datasets: [
                      {
                        label: t('quantitySold'),
                        data: topProducts.map(p => p.totalSold),
                        backgroundColor: 'rgba(255, 159, 64, 0.7)',
                      },
                      {
                        label: t('revenue') + ' (₦)',
                        data: topProducts.map(p => p.totalRevenue),
                        backgroundColor: 'rgba(54, 162, 235, 0.4)',
                        yAxisID: 'y1',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: 'top' }, title: { display: false } },
                    scales: { y1: { position: 'right', grid: { drawOnChartArea: false } } },
                  }}
                />
              </div>
              <div className="bg-white rounded-xl shadow p-4">
                <h3 className="font-bold mb-2">{t('salesByCategory')}</h3>
                <Pie
                  data={{
                    labels: categorySales.map(c => c.categoryName || 'Unknown'),
                    datasets: [
                      {
                        label: t('sales') + ' (₦)',
                        data: categorySales.map(c => c.totalSales),
                        backgroundColor: [
                          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#B2FF66', '#FF66B2', '#66B2FF',
                        ],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: 'right' }, title: { display: false } },
                  }}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Inventory Analytics */}
        <div className="mb-10">
          {statsLoading ? null : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow p-4">
                <h3 className="font-bold mb-2">{t('inventoryStatus')}</h3>
                <Doughnut
                  data={{
                    labels: [t('inStock'), t('lowStock'), t('outOfStock')],
                    datasets: [
                      {
                        data: [
                          inventoryStats.inStock - inventoryStats.lowStock,
                          inventoryStats.lowStock,
                          inventoryStats.outOfStock
                        ],
                        backgroundColor: [
                          '#4BC0C0', '#FFCE56', '#FF6384'
                        ],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: 'right' }, title: { display: false } },
                  }}
                />
              </div>
              <div className="bg-white rounded-xl shadow p-4 flex flex-col justify-center">
                <h3 className="font-bold mb-4">{t('inventoryMetrics')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">{t('totalProducts')}</p>
                    <p className="text-2xl font-bold text-green-600">{products.length}</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">{t('lowStockItems')}</p>
                    <p className="text-2xl font-bold text-yellow-600">{inventoryStats.lowStock}</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">{t('outOfStock')}</p>
                    <p className="text-2xl font-bold text-red-600">{inventoryStats.outOfStock}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">{t('inventoryValue')}</p>
                    <p className="text-2xl font-bold text-blue-600">₦{inventoryStats.totalValue?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Low Stock Alert Section */}
        <div className="mb-8">
          {lowStockLoading ? (
            <div className="text-yellow-600">{t('checkingLowStock')}</div>
          ) : lowStockError ? (
            <div className="text-red-500">{lowStockError}</div>
          ) : lowStockProducts.length > 0 ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-4">
              <div className="flex items-center font-bold text-yellow-800 mb-2">
                <FaExclamationTriangle className="mr-2 text-yellow-600" />
                {t('lowStockAlert')}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white/90 rounded shadow text-base">
                  <thead className="bg-yellow-100">
                    <tr>
                      <th className="px-3 py-2 text-left font-bold text-yellow-700 uppercase tracking-wider">{t('product')}</th>
                      <th className="px-3 py-2 text-left font-bold text-yellow-700 uppercase tracking-wider">{t('stock')}</th>
                      <th className="px-3 py-2 text-left font-bold text-yellow-700 uppercase tracking-wider">{t('category')}</th>
                      <th className="px-3 py-2 text-left font-bold text-yellow-700 uppercase tracking-wider">{t('action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map((p) => (
                      <tr key={p._id} className="hover:bg-yellow-50">
                        <td className="px-3 py-2">{p.name}</td>
                        <td className="px-3 py-2 font-bold text-red-600">{p.countInStock}</td>
                        <td className="px-3 py-2">{p.category?.name || 'N/A'}</td>
                        <td className="px-3 py-2">
                          <Link to={`/admin/product/${p._id}/edit`} className="text-blue-600 hover:text-blue-800 underline">
                            {t('updateStock')}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-green-700 bg-green-50 p-3 rounded-lg inline-block">{t('noProductsLowStock')}</div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <Link to="/admin/users" className="card-haven flex flex-col items-center py-8 hover:scale-[1.03] transition-all duration-200">
            <div className="flex items-center justify-center bg-blue-100 rounded-full w-16 h-16 mb-3">
              <FaUsers className="text-blue-500 text-2xl" />
            </div>
            <div className="text-4xl font-extrabold text-primary-400 mb-2">{users.length}</div>
            <div className="text-lg text-primary-700 font-semibold">{t('users')}</div>
            <div className="text-sm text-gray-500 mt-1">{t('manageUsers')}</div>
          </Link>
          <Link to="/admin/products" className="card-haven flex flex-col items-center py-8 hover:scale-[1.03] transition-all duration-200">
            <div className="flex items-center justify-center bg-pink-100 rounded-full w-16 h-16 mb-3">
              <FaBoxes className="text-pink-500 text-2xl" />
            </div>
            <div className="text-4xl font-extrabold text-pink-400 mb-2">{products.length}</div>
            <div className="text-lg text-primary-700 font-semibold">{t('products')}</div>
            <div className="text-sm text-gray-500 mt-1">{t('manageProducts')}</div>
          </Link>
          <Link to="/admin/orders" className="card-haven flex flex-col items-center py-8 hover:scale-[1.03] transition-all duration-200">
            <div className="flex items-center justify-center bg-green-100 rounded-full w-16 h-16 mb-3">
              <FaShoppingCart className="text-green-500 text-2xl" />
            </div>
            <div className="text-4xl font-extrabold text-blue-400 mb-2">{orders.length}</div>
            <div className="text-lg text-primary-700 font-semibold">{t('orders')}</div>
            <div className="text-sm text-gray-500 mt-1">{t('manageOrders')}</div>
          </Link>
        </div>
        <div className="card-haven py-8">
          <div className="text-xl font-semibold mb-6 text-primary-700">{t('recentOrders')}</div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white/90 rounded-2xl shadow-card-haven text-base">
              <thead className="bg-primary-50">
                <tr>
                  <th className="px-3 py-4 text-left font-bold text-primary-400 uppercase tracking-wider">{t('orderId')}</th>
                  <th className="px-3 py-4 text-left font-bold text-primary-400 uppercase tracking-wider">{t('user')}</th>
                  <th className="px-3 py-4 text-left font-bold text-primary-400 uppercase tracking-wider">{t('total')}</th>
                  <th className="px-3 py-4 text-left font-bold text-primary-400 uppercase tracking-wider">{t('status')}</th>
                  <th className="px-3 py-4 text-left font-bold text-primary-400 uppercase tracking-wider">{t('date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-blue-50/60 transition">
                    <td className="px-3 py-4 whitespace-nowrap text-primary-700 font-mono font-semibold">{order._id}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-primary-700">{order.user?.name || 'N/A'}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-pink-500 font-bold">₦{order.totalPrice?.toLocaleString()}</td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full shadow ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.isPaid ? 'Paid' : 'Pending'}</span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-primary-700">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
