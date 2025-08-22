const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getAuditLogs } = require('../controllers/auditLogController');

// @route   GET /api/audit-logs
// @access  Private/Admin
router.get('/', protect, admin, getAuditLogs);

module.exports = router; 