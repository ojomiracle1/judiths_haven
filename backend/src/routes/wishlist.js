const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// Get user's wishlist
router.get('/', protect, async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
  res.json(wishlist || { user: req.user._id, products: [] });
});

// Add product to wishlist
router.post('/add', protect, async (req, res) => {
  const { productId } = req.body;
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = new Wishlist({ user: req.user._id, products: [productId] });
  } else if (!wishlist.products.includes(productId)) {
    wishlist.products.push(productId);
  }
  await wishlist.save();
  res.json(wishlist);
});

// Remove product from wishlist
router.post('/remove', protect, async (req, res) => {
  const { productId } = req.body;
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (wishlist) {
    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );
    await wishlist.save();
  }
  res.json(wishlist);
});

module.exports = router;
