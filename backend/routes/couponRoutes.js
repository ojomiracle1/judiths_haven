const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect, admin } = require('../middleware/authMiddleware');
const asyncHandler = require('express-async-handler');

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
router.post('/', protect, admin, asyncHandler(async (req, res) => {
  const { code, type, value, expiry } = req.body;
  if (!code || !type || !value) {
    return res.status(400).json({ message: 'Code, type, and value are required.' });
  }
  const exists = await Coupon.findOne({ code: code.toUpperCase() });
  if (exists) {
    return res.status(400).json({ message: 'Coupon code already exists.' });
  }
  const coupon = new Coupon({
    code: code.toUpperCase(),
    type,
    value,
    expiry,
  });
  await coupon.save();
  res.status(201).json(coupon);
}));

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Public
router.post('/validate', asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ message: 'Coupon code required.' });
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) return res.status(404).json({ message: 'Invalid coupon code.' });
  if (coupon.isUsed) return res.status(400).json({ message: 'Coupon already used.' });
  if (coupon.expiry && new Date() > coupon.expiry) return res.status(400).json({ message: 'Coupon expired.' });
  res.json({ valid: true, coupon });
}));

// @desc    Apply a coupon code (mark as used)
// @route   POST /api/coupons/apply
// @access  Private
router.post('/apply', protect, asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ message: 'Coupon code required.' });
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) return res.status(404).json({ message: 'Invalid coupon code.' });
  if (coupon.isUsed) return res.status(400).json({ message: 'Coupon already used.' });
  if (coupon.expiry && new Date() > coupon.expiry) return res.status(400).json({ message: 'Coupon expired.' });
  coupon.isUsed = true;
  await coupon.save();
  res.json({ success: true, coupon });
}));

module.exports = router; 