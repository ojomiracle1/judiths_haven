const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');
const { rateLimiter } = require('../middleware/rateLimiter');
const mongoose = require('mongoose');
const { getTopProducts, bulkDeleteProducts, bulkUpdateProducts, exportProducts } = require('../controllers/productController');
const asyncHandler = require('express-async-handler');
const { validateProduct } = require('../middleware/validation');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get(
  '/',
  rateLimiter,
  asyncHandler(async (req, res) => {
    try {
      // Validate and sanitize query params
      const pageSize = Math.max(Number(req.query.pageSize) || 10, 1);
      const page = Math.max(Number(req.query.page) || 1, 1);
      const {
        keyword,
        category,
        minPrice,
        maxPrice,
        minRating,
        sort,
        brand,
        tags
      } = req.query;

      let filter = {};
      if (keyword) {
        filter.$or = [
          { name: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } }
        ];
      }
      if (category) {
        filter.category = category;
      }
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice && !isNaN(minPrice)) filter.price.$gte = Number(minPrice);
        if (maxPrice && !isNaN(maxPrice)) filter.price.$lte = Number(maxPrice);
      }
      if (minRating && !isNaN(minRating)) {
        filter.rating = { $gte: Number(minRating) };
      }
      if (brand) {
        filter.brand = { $regex: brand, $options: 'i' };
      }
      if (tags) {
        // Support comma-separated tags
        const tagsArr = Array.isArray(tags) ? tags : String(tags).split(',').map(t => t.trim());
        filter.tags = { $in: tagsArr };
      }

      // Sorting
      let sortOption = { createdAt: -1 };
      if (sort === 'price-asc') sortOption = { price: 1 };
      else if (sort === 'price-desc') sortOption = { price: -1 };
      else if (sort === 'rating-desc') sortOption = { rating: -1 };
      else if (sort === 'rating-asc') sortOption = { rating: 1 };
      else if (sort === 'newest') sortOption = { createdAt: -1 };

      // Defensive: only allow certain fields to be projected
      const projection = { name: 1, price: 1, category: 1, rating: 1, brand: 1, tags: 1, countInStock: 1, createdAt: 1 };

      const count = await Product.countDocuments(filter);
      const products = await Product.find(filter, projection)
        .populate('category', 'name')
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort(sortOption);

      res.json({
        products,
        page,
        pages: Math.ceil(count / pageSize),
        total: count
      });
    } catch (error) {
      console.error('Error in product search:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  })
);

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
router.get('/category/:categoryId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    const products = await Product.find({ category: req.params.categoryId })
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get low stock products
// @route   GET /api/products/low-stock
// @access  Private/Admin
router.get('/low-stock', protect, admin, asyncHandler(async (req, res) => {
  try {
    const threshold = Number(req.query.threshold);
    if (isNaN(threshold) || threshold < 0) {
      return res.status(400).json({ message: 'Invalid threshold value' });
    }
    const lowStockProducts = await Product.find({ countInStock: { $lt: threshold } })
      .populate('category', 'name')
      .sort({ countInStock: 1 });
    if (lowStockProducts.length > 0) {
      console.info(`Low stock alert: ${lowStockProducts.length} products below threshold (${threshold})`);
      await sendLowStockAlert(lowStockProducts);
    }
    res.json({ products: lowStockProducts });
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({
      message: 'Server error fetching low stock products',
      error: error.message,
      stack: error.stack,
    });
  }
}));

// Fallback error handler for /low-stock
router.use('/low-stock', (err, req, res, next) => {
  console.error('Fallback error handler for /low-stock:', err);
  res.status(500).json({
    message: 'Server error (fallback) fetching low stock products',
    error: err.message,
    stack: err.stack,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching single product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post(
  '/',
  protect,
  admin,
  validateProduct,
  asyncHandler(async (req, res) => {
    try {
      const product = new Product({
        ...req.body,
        user: req.user._id,
      });
      const createdProduct = await product.save();
      res.status(201).json(createdProduct);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  })
);

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, validateProduct, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get top rated products
// @route   GET /api/products/top/rated
// @access  Public
router.get('/top/rated', getTopProducts);

// @desc    Get reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
router.get('/:id/reviews', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product.reviews || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Bulk operations (admin only)
router.post('/bulk-delete', protect, admin, bulkDeleteProducts);
router.put('/bulk-update', protect, admin, bulkUpdateProducts);

// Export products (admin only)
router.get('/export', protect, admin, exportProducts);

// @desc    Get supplier info for a product
// @route   GET /api/products/:id/supplier
// @access  Private/Admin
router.get('/:id/supplier', protect, admin, asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    const product = await Product.findById(req.params.id).select('supplier');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product.supplier || {});
  } catch (error) {
    console.error('Error fetching supplier info:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}));

// @desc    Update supplier info for a product
// @route   PUT /api/products/:id/supplier
// @access  Private/Admin
router.put('/:id/supplier', protect, admin, asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    const { name, contact, email, phone } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    product.supplier = { name, contact, email, phone };
    await product.save();
    res.json(product.supplier);
  } catch (error) {
    console.error('Error updating supplier info:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}));

// Enhanced stock alert: send email to admin if low stock
const sendLowStockAlert = async (products) => {
  // Replace with your email utility and admin email
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  if (!products || products.length === 0) return;
  const productList = products.map(p => `${p.name} (Stock: ${p.countInStock})`).join(', ');
  // Example: sendEmail(adminEmail, 'Low Stock Alert', `Low stock products: ${productList}`);
  console.info(`Email alert to ${adminEmail}: Low stock products: ${productList}`);
};

module.exports = router;