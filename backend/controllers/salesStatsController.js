const SalesStats = require('../models/SalesStats');
const asyncHandler = require('express-async-handler');

// Get all monthly sales stats for a year
exports.getYearlySalesStats = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const stats = await SalesStats.find({ year }).sort({ month: 1 });
  res.json(stats);
});

// Get total sales for a specific month/year
exports.getMonthlySalesStats = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const month = parseInt(req.query.month) || new Date().getMonth() + 1;
  const stats = await SalesStats.findOne({ year, month });
  res.json(stats || { year, month, totalSales: 0, totalOrders: 0 });
});

// Get total sales for a year
exports.getTotalSalesForYear = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const stats = await SalesStats.aggregate([
    { $match: { year } },
    { $group: { _id: null, totalSales: { $sum: "$totalSales" }, totalOrders: { $sum: "$totalOrders" } } }
  ]);
  res.json(stats[0] || { year, totalSales: 0, totalOrders: 0 });
});
