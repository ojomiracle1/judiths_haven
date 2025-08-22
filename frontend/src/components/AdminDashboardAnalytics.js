import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { FaChartLine, FaExclamationCircle } from 'react-icons/fa';

function AdminDashboardAnalytics({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    axios.get('/api/admin/analytics', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setStats(res.data))
    .catch(() => setError('Failed to fetch analytics'))
    .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="text-center py-4">Loading analytics...</div>;
  if (error) return <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center"><FaExclamationCircle className="mr-2" />{error}</div>;
  if (!stats) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <FaChartLine className="text-primary-600 mr-2" />
        <h2 className="text-xl font-bold text-primary-700">{t('advancedAnalytics')}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-sm text-gray-500 mb-1">{t('totalSales')}</h3>
          <p className="text-2xl font-bold text-blue-600">₦{stats.salesTotal?.toLocaleString() || 0}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-sm text-gray-500 mb-1">{t('totalOrders')}</h3>
          <p className="text-2xl font-bold text-green-600">{stats.orderCount || 0}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-sm text-gray-500 mb-1">{t('lowStockItems')}</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.lowStockCount || 0}</p>
        </div>
      </div>
      
      {stats.additionalMetrics && (
        <div className="mt-4 bg-white rounded-xl shadow p-4">
          <h3 className="font-bold mb-2">{t('additionalMetrics')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.additionalMetrics).map(([key, value]) => (
              <div key={key} className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">{t(key)}</p>
                <p className="text-lg font-bold text-primary-600">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboardAnalytics;
