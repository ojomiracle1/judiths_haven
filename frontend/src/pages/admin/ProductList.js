import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts, deleteProduct } from '../../features/product/productSlice';
import { toast } from 'react-toastify';
import api from '../../utils/axios';
import { saveAs } from 'file-saver';

const ProductList = () => {
  const dispatch = useDispatch();
  const { products, isLoading, isError, message } = useSelector(
    (state) => state.product
  );
  const [deletingProducts, setDeletingProducts] = useState(new Set());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [bulkUpdateFields, setBulkUpdateFields] = useState({ category: '', status: '', featured: false });
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    dispatch(getProducts({ page, limit }));
    setSelected([]);
    setSelectAll(false);
  }, [dispatch, isError, message, page, limit]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setDeletingProducts(prev => new Set(prev).add(id));
      dispatch(deleteProduct(id))
        .unwrap()
        .then(() => {
          toast.success('Product deleted successfully');
        })
        .catch((error) => {
          toast.error(error);
        })
        .finally(() => {
          setDeletingProducts(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        });
    }
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
      setSelected(products.map((p) => p._id));
      setSelectAll(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    if (!window.confirm(`Delete ${selected.length} products? This cannot be undone!`)) return;
    setBulkLoading(true);
    try {
      await api.post('/products/bulk-delete', { productIds: selected });
      toast.success('Products deleted');
      dispatch(getProducts({ page, limit }));
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
      await api.put('/products/bulk-update', {
        productIds: selected,
        update: bulkUpdateFields,
      });
      toast.success('Products updated');
      dispatch(getProducts({ page, limit }));
      setSelected([]);
      setSelectAll(false);
      setShowBulkUpdate(false);
      setBulkUpdateFields({ category: '', status: '', featured: false });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk update failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExport = async (format) => {
    setExportLoading(true);
    try {
      console.log(`Exporting products as ${format}...`);
      const res = await api.get(`/api/products/export?format=${format}`, {
        responseType: 'blob',
      });
      
      if (!res.data) {
        throw new Error('No data received from server');
      }
      
      const filename = `products.${format === 'excel' ? 'xlsx' : 'csv'}`;
      saveAs(res.data, filename);
      toast.success(`Exported as ${format.toUpperCase()}`);
      console.log(`Export successful: ${filename}`);
    } catch (err) {
      console.error('Export error:', err);
      console.error('Error response:', err.response);
      const errorMessage = err.response?.data?.message || err.message || 'Export failed';
      toast.error(`Export failed: ${errorMessage}`);
    } finally {
      setExportLoading(false);
    }
  };

  // Calculate total pages for pagination
  const pages = Math.ceil(products.length / limit) || 1;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
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
              Bulk Update
            </button>
          </div>
        </div>
      )}
      {/* Bulk Update Modal */}
      {showBulkUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Bulk Update Products</h2>
            <form onSubmit={handleBulkUpdate} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Category ID</label>
                <input
                  type="text"
                  value={bulkUpdateFields.category}
                  onChange={e => setBulkUpdateFields(f => ({ ...f, category: e.target.value }))}
                  className="w-full border rounded px-2 py-1"
                  placeholder="Category ID (optional)"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Status</label>
                <select
                  value={bulkUpdateFields.status}
                  onChange={e => setBulkUpdateFields(f => ({ ...f, status: e.target.value }))}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">-- No Change --</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={bulkUpdateFields.featured}
                  onChange={e => setBulkUpdateFields(f => ({ ...f, featured: e.target.checked }))}
                  id="featured"
                />
                <label htmlFor="featured" className="font-semibold">Set as Featured</label>
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
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight drop-shadow-lg">
          Products
        </h1>
        <div className="flex gap-2 items-center">
          <Link
            to="/admin/product/new"
            className="bg-gradient-to-r from-pink-200 to-blue-200 hover:from-pink-300 hover:to-blue-300 text-blue-900 font-semibold rounded-xl px-6 py-2 shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-200"
          >
            + Add Product
          </Link>
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
      {products.length === 0 ? (
        <div className="text-center py-16 bg-white/70 rounded-2xl shadow-inner">
          <p className="text-gray-500 text-lg">No products found.</p>
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
                      aria-label="Select all products"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-pink-50/60 transition-all duration-150"
                  >
                    <td className="px-2 py-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(product._id)}
                        onChange={() => handleSelect(product._id)}
                        aria-label={`Select product ${product.name}`}
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-12 w-12 object-cover rounded-xl shadow border border-blue-100 bg-white"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-800 font-semibold">
                      {product.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-700">
                      ₦{product.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-700">
                      {product.category.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-700">
                      {product.brand}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-700">
                      {product.countInStock}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Link
                          to={`/admin/product/${product._id}/edit`}
                          className="bg-gradient-to-r from-blue-200 to-green-200 hover:from-blue-300 hover:to-green-300 text-blue-900 font-semibold rounded-lg px-4 py-1 shadow focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-150"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={deletingProducts.has(product._id)}
                          className={`bg-gradient-to-r from-red-200 to-pink-200 hover:from-red-300 hover:to-pink-300 text-red-900 font-semibold rounded-lg px-4 py-1 shadow focus:outline-none focus:ring-2 focus:ring-red-200 transition-all duration-150 ${
                            deletingProducts.has(product._id) ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {deletingProducts.has(product._id) ? (
                            <span className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600 mr-2"></div>
                              Deleting...
                            </span>
                          ) : (
                            'Delete'
                          )}
                        </button>
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

export default ProductList;