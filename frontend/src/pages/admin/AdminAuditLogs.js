import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ user: '', action: '', startDate: '', endDate: '', search: '' });

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit, ...filters };
      Object.keys(params).forEach((k) => (params[k] === '' ? delete params[k] : null));
      const res = await axios.get('/api/audit-logs', { params });
      setLogs(res.data.logs);
      setPages(res.data.pages);
      setTotal(res.data.total);
    } catch (err) {
      setError('Failed to fetch logs');
      toast.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, [page, limit]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8">Audit Logs</h1>
      <form onSubmit={handleSearch} className="flex flex-wrap gap-4 mb-6 items-end">
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Search action/details..."
          className="border rounded px-3 py-2"
        />
        <input
          type="text"
          name="user"
          value={filters.user}
          onChange={handleFilterChange}
          placeholder="User ID"
          className="border rounded px-3 py-2"
        />
        <input
          type="text"
          name="action"
          value={filters.action}
          onChange={handleFilterChange}
          placeholder="Action"
          className="border rounded px-3 py-2"
        />
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
          className="border rounded px-3 py-2"
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
          className="border rounded px-3 py-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded font-semibold shadow"
        >
          Filter/Search
        </button>
      </form>
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-blue-50">
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">Action</th>
                <th className="px-4 py-2 text-left">Details</th>
                <th className="px-4 py-2 text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-500">No logs found.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="border-b hover:bg-blue-50">
                    <td className="px-4 py-2">
                      {log.user ? (
                        <span title={log.user.email}>{log.user.name || log.user.email}</span>
                      ) : (
                        <span className="italic text-gray-400">System</span>
                      )}
                    </td>
                    <td className="px-4 py-2">{log.action}</td>
                    <td className="px-4 py-2">
                      <pre className="whitespace-pre-wrap break-all text-xs bg-gray-50 rounded p-2 max-w-xs overflow-x-auto">{JSON.stringify(log.details, null, 2)}</pre>
                    </td>
                    <td className="px-4 py-2">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-4">
            <div>Total: {total}</div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded bg-gray-200"
              >Prev</button>
              <span>Page {page} of {pages}</span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="px-3 py-1 rounded bg-gray-200"
              >Next</button>
              <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }} className="ml-2 px-2 py-1 rounded border">
                {[10, 20, 50, 100].map(opt => <option key={opt} value={opt}>{opt} per page</option>)}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs; 