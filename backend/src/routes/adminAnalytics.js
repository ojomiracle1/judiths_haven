const express = require('express');
const Order = require('../../models/orderModel');
const User = require('../../models/userModel');
const Product = require('../../models/productModel');
const router = express.Router();
const { protect, admin } = require('../../middleware/authMiddleware');

// GET /api/admin/analytics
router.get('/', protect, admin, async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments();
    // Total orders
    const totalOrders = await Order.countDocuments();
    // Total revenue
    const totalRevenueAgg = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, revenue: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.revenue || 0;
    // Orders per month (last 6 months)
    const ordersPerMonth = await Order.aggregate([
      { $match: { createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 5)) } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 },
        revenue: { $sum: '$totalPrice' }
      } },
      { $sort: { _id: 1 } }
    ]);
    // Top 5 products by sales
    const topProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      { $group: {
        _id: '$orderItems.product',
        totalSold: { $sum: '$orderItems.quantity' },
        totalRevenue: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } }
      } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      } },
      { $unwind: '$product' },
      { $project: {
        _id: 0,
        productId: '$product._id',
        name: '$product.name',
        totalSold: 1,
        totalRevenue: 1
      } }
    ]);
    // Additional analytics: wishlist count, recommendations, comparison, recently viewed
    const Wishlist = require('../models/Wishlist');
    const RecentlyViewed = require('../models/RecentlyViewed');

    // Total wishlists
    const totalWishlists = await Wishlist.countDocuments();
    // Most wished products
    const mostWishedProductsAgg = await Wishlist.aggregate([
      { $unwind: '$products' },
      { $group: { _id: '$products', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      } },
      { $unwind: '$product' },
      { $project: { _id: 0, productId: '$product._id', name: '$product.name', count: 1 } }
    ]);

    // Recommendations (top rated)
    const recommendedProducts = await Product.find().sort({ rating: -1, numReviews: -1 }).limit(5);

    // Recently viewed stats
    const totalRecentlyViewed = await RecentlyViewed.countDocuments();
    const mostRecentlyViewedAgg = await RecentlyViewed.aggregate([
      { $unwind: '$products' },
      { $group: { _id: '$products', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      } },
      { $unwind: '$product' },
      { $project: { _id: 0, productId: '$product._id', name: '$product.name', count: 1 } }
    ]);

    res.json({
      totalUsers,
      totalOrders,
      totalRevenue,
      ordersPerMonth,
      topProducts,
      totalWishlists,
      mostWishedProducts: mostWishedProductsAgg,
      recommendedProducts,
      totalRecentlyViewed,
      mostRecentlyViewed: mostRecentlyViewedAgg
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: err.message });
  }
});

module.exports = router;
