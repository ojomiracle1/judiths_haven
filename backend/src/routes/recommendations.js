const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// Get recommended products (simple: top rated)
router.get('/', protect, async (req, res) => {
  const products = await Product.find().sort({ rating: -1, numReviews: -1 }).limit(5);
  res.json(products);
});

module.exports = router;
