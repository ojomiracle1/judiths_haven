const Order = require('../models/orderModel');
const asyncHandler = require('express-async-handler');

// Aggregate monthly sales directly from Order collection
exports.aggregateMonthlySales = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const stats = await Order.aggregate([
    {
      $match: {
        isPaid: true,
        paidAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) }
      }
    },
    {
      $group: {
        _id: { month: { $month: "$paidAt" } },
        totalSales: { $sum: "$totalPrice" },
        totalOrders: { $sum: 1 }
      }
    },
    { $sort: { "_id.month": 1 } }
  ]);
  res.json(stats);
});

// Top-selling products (by quantity)
exports.topProducts = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const topProducts = await Order.aggregate([
    { $match: { isPaid: true, paidAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) } } },
    { $unwind: '$orderItems' },
    { $group: {
      _id: '$orderItems.product',
      name: { $first: '$orderItems.name' },
      totalSold: { $sum: '$orderItems.quantity' },
      totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
    } },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
  ]);
  res.json(topProducts);
});

// Sales by category
exports.salesByCategory = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const sales = await Order.aggregate([
    { $match: { isPaid: true, paidAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) } } },
    { $unwind: '$orderItems' },
    { $lookup: {
      from: 'products',
      localField: 'orderItems.product',
      foreignField: '_id',
      as: 'productInfo',
    } },
    { $unwind: '$productInfo' },
    { $group: {
      _id: '$productInfo.category',
      categoryName: { $first: '$productInfo.category' },
      totalSales: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
      totalOrders: { $sum: 1 },
    } },
    { $sort: { totalSales: -1 } },
  ]);
  res.json(sales);
});
