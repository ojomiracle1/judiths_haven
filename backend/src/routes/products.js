const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Review = require('../models/Review');
const { protect, admin } = require('../middleware/auth');
const XLSX = require('xlsx');
const createCsvWriter = require('csv-writer').createObjectCsvStringifier;

// Get low stock products - MUST BE FIRST to avoid route conflicts
router.get('/low-stock', protect, admin, async (req, res) => {
  try {
    const threshold = Number(req.query.threshold) || 5;
    if (isNaN(threshold)) {
      return res.status(400).json({ message: 'Invalid threshold value' });
    }
    const lowStockProducts = await Product.find({ countInStock: { $lt: threshold } })
      .populate('category', 'name')
      .sort({ countInStock: 1 });
    res.json({ products: lowStockProducts });
  } catch (error) {
    res.status(500).json({
      message: 'Server error fetching low stock products',
      error: error.message,
      stack: error.stack,
    });
  }
});

// Export products (admin only) - MUST BE BEFORE /:id routes
router.get('/export', protect, admin, async (req, res) => {
  try {
    const format = req.query.format || 'csv';
    const products = await Product.find({}).populate('category', 'name').lean();
    
    const data = products.map(p => ({
      ID: p._id,
      Name: p.name,
      Price: p.price,
      Category: p.category?.name || '',
      Brand: p.brand || '',
      Stock: p.countInStock || 0,
      Featured: p.featured || false,
      CreatedAt: p.createdAt,
    }));

    if (format === 'excel') {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Products');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Disposition', 'attachment; filename="products.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      return res.end(buf);
    } else {
      const fields = [
        { id: 'ID', title: 'ID' },
        { id: 'Name', title: 'Name' },
        { id: 'Price', title: 'Price' },
        { id: 'Category', title: 'Category' },
        { id: 'Brand', title: 'Brand' },
        { id: 'Stock', title: 'Stock' },
        { id: 'Featured', title: 'Featured' },
        { id: 'CreatedAt', title: 'CreatedAt' },
      ];
      const csvWriter = createCsvWriter({ header: fields });
      const csv = csvWriter.stringifyRecords(data);
      res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
      res.setHeader('Content-Type', 'text/csv');
      return res.end(csv);
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Export failed', error: error.message });
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i'
          }
        }
      : {};

    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword })
      .populate('category', 'name')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get products by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.categoryId })
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create product (admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const product = new Product(req.body);
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update product (admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
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

// Delete product (admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.remove();
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add a review to a product
router.post('/:id/reviews', protect, async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  // Prevent duplicate reviews by the same user
  const alreadyReviewed = await Review.findOne({ product: product._id, user: req.user._id });
  if (alreadyReviewed) return res.status(400).json({ message: 'Product already reviewed' });

  const review = new Review({
    user: req.user._id,
    product: product._id,
    rating,
    comment
  });
  await review.save();

  // Update product's average rating and review count
  const reviews = await Review.find({ product: product._id });
  product.numReviews = reviews.length;
  product.rating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  await product.save();

  res.status(201).json({ message: 'Review added', review });
});

// Get reviews for a product
router.get('/:id/reviews', async (req, res) => {
  const reviews = await Review.find({ product: req.params.id }).populate('user', 'name');
  res.json(reviews);
});

// Get top rated products
router.get('/top/rated', async (req, res) => {
  try {
    const products = await Product.find({})
      .sort({ averageRating: -1 })
      .limit(5);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Advanced search and filter endpoint
router.get('/search/advanced', async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice, rating, sort, brand, size, color, page = 1, pageSize = 10 } = req.query;
    let filter = {};
    if (keyword) {
      filter.name = { $regex: keyword, $options: 'i' };
    }
    if (category) {
      filter.category = category;
    }
    if (brand) {
      filter.brand = brand;
    }
    if (size) {
      filter.sizes = size;
    }
    if (color) {
      filter.colors = color;
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (rating) {
      filter.rating = { $gte: Number(rating) };
    }
    let query = Product.find(filter).populate('category', 'name');
    if (sort) {
      const sortObj = {};
      if (sort === 'price_asc') sortObj.price = 1;
      else if (sort === 'price_desc') sortObj.price = -1;
      else if (sort === 'rating') sortObj.rating = -1;
      else sortObj.createdAt = -1;
      query = query.sort(sortObj);
    }
    const total = await Product.countDocuments(filter);
    const products = await query
      .limit(Number(pageSize))
      .skip((Number(page) - 1) * Number(pageSize));
    res.json({ products, page: Number(page), pages: Math.ceil(total / pageSize), total });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get related products
router.get('/:id/related', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    // Find products in the same category, excluding the current product
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    }).limit(8);
    res.json(related);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;