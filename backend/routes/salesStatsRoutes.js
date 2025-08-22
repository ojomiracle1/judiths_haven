const express = require('express');
const router = express.Router();
const salesStatsController = require('../controllers/salesStatsController');

// GET /api/sales-stats/yearly?year=2025
router.get('/yearly', salesStatsController.getYearlySalesStats);

// GET /api/sales-stats/monthly?year=2025&month=7
router.get('/monthly', salesStatsController.getMonthlySalesStats);

// GET /api/sales-stats/total?year=2025
router.get('/total', salesStatsController.getTotalSalesForYear);

module.exports = router;
