const express = require('express');
const router = express.Router();
const RecentlyViewed = require('../models/RecentlyViewed');
const { protect } = require('../middleware/auth');

// Get user's recently viewed products
router.get('/', protect, async (req, res) => {
  const rv = await RecentlyViewed.findOne({ user: req.user._id }).populate('products');
  res.json(rv || { user: req.user._id, products: [] });
});

// Add product to recently viewed
router.post('/add', protect, async (req, res) => {
  const { productId } = req.body;
  let rv = await RecentlyViewed.findOne({ user: req.user._id });
  if (!rv) {
    rv = new RecentlyViewed({ user: req.user._id, products: [productId] });
  } else {
    rv.products = [productId, ...rv.products.filter(p => p.toString() !== productId)].slice(0, 10);
    rv.updatedAt = Date.now();
  }
  await rv.save();
  res.json(rv);
});

module.exports = router;
