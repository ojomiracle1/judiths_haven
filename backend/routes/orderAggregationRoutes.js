const express = require('express');
const router = express.Router();
const orderAggregationController = require('../controllers/orderAggregationController');

// GET /api/orders/aggregate/monthly?year=2025
router.get('/monthly', orderAggregationController.aggregateMonthlySales);
// GET /api/orders/aggregate/top-products?year=2025
router.get('/top-products', orderAggregationController.topProducts);
// GET /api/orders/aggregate/sales-by-category?year=2025
router.get('/sales-by-category', orderAggregationController.salesByCategory);

module.exports = router;
