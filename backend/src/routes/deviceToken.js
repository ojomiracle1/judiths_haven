const express = require('express');
const router = express.Router();
const DeviceToken = require('../models/DeviceToken');
const { protect } = require('../middleware/auth');

// Register or update device token
router.post('/register', protect, async (req, res) => {
  try {
    const { token, platform } = req.body;
    if (!token) return res.status(400).json({ message: 'Device token is required' });
    let deviceToken = await DeviceToken.findOneAndUpdate(
      { user: req.user._id },
      { token, platform },
      { upsert: true, new: true }
    );
    res.json({ message: 'Device token registered', deviceToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
