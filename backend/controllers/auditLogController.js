const AuditLog = require('../models/AuditLog');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

// @desc    Get audit logs (paginated, filterable, searchable)
// @route   GET /api/audit-logs
// @access  Private/Admin
const getAuditLogs = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const { user, action, startDate, endDate, search } = req.query;
  const filter = {};
  if (user) filter.user = user;
  if (action) filter.action = action;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  if (search) {
    filter.$or = [
      { action: { $regex: search, $options: 'i' } },
      { 'details': { $regex: search, $options: 'i' } },
    ];
  }
  const count = await AuditLog.countDocuments(filter);
  const logs = await AuditLog.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  res.json({ logs, page, pages: Math.ceil(count / limit), total: count });
});

module.exports = { getAuditLogs }; 