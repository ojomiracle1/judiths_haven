const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// In-memory store for demo; replace with DB in production
const tokens = new Set();

// @route   POST /api/device-token
// @desc    Register device token for push notifications
// @access  Private
router.post('/', protect, (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: 'No token provided' });
  }
  tokens.add(token);
  res.status(201).json({ message: 'Device token registered' });
});

module.exports = router;
