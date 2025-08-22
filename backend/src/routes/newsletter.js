const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    // Check for existing subscription
    const exists = await Newsletter.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'You are already subscribed.' });
    }
    await Newsletter.create({ email });
    res.json({ message: 'Subscribed successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
