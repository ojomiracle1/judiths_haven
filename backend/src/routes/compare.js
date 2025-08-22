const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// Compare products by IDs
router.post('/', protect, async (req, res) => {
  const { productIds } = req.body;
  if (!Array.isArray(productIds) || productIds.length < 2) {
    return res.status(400).json({ message: 'Provide at least two product IDs to compare.' });
  }
  const products = await Product.find({ _id: { $in: productIds } });
  res.json(products);
});

module.exports = router;
