const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
let redisClient;
try {
  const redis = require('redis');
  redisClient = redis.createClient();
  redisClient.connect().catch(() => { redisClient = null; });
} catch (e) {
  redisClient = null;
}
const XLSX = require('xlsx');
const createCsvWriter = require('csv-writer').createObjectCsvStringifier;
const fs = require('fs');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  // Redis cache key based on page and keyword
  const cacheKey = `products:page:${page}:keyword:${req.query.keyword || ''}`;
  let cached = null;
  if (redisClient) {
    try {
      cached = await redisClient.get(cacheKey);
    } catch (e) { cached = null; }
  }
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const count = await Product.countDocuments({ ...keyword });
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  const response = { products, page, pages: Math.ceil(count / pageSize) };
  if (redisClient) {
    try {
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(response)); // Cache for 1 hour
    } catch (e) {}
  }
  res.json(response);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: req.body.name || 'Sample name',
    price: req.body.price || 0,
    user: req.user._id,
    images: req.body.images || ['/images/sample.jpg'],
    brand: req.body.brand || 'Sample brand',
    category: req.body.category || null,
    countInStock: req.body.countInStock || 0,
    numReviews: 0,
    description: req.body.description || 'Sample description',
    discount: req.body.discount || 0,
    discountPrice: req.body.discountPrice || null,
    sizes: req.body.sizes || [],
    colors: req.body.colors || [],
    features: req.body.features || [],
    gender: req.body.gender || 'unisex',
    featured: req.body.featured || false,
  });

  const createdProduct = await product.save();
  // Invalidate all product list caches
  if (redisClient) {
    try {
      await redisClient.keys('products:*').then(keys => keys.forEach(key => redisClient.del(key)));
    } catch (e) {}
  }
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    images,
    brand,
    category,
    countInStock,
    discount,
    discountPrice,
    sizes,
    colors,
    features,
    gender,
    featured,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.images = images || product.images;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.countInStock = countInStock || product.countInStock;
    product.discount = discount !== undefined ? discount : product.discount;
    product.discountPrice =
      discountPrice !== undefined ? discountPrice : product.discountPrice;
    product.sizes = sizes || product.sizes;
    product.colors = colors || product.colors;
    product.features = features || product.features;
    product.gender = gender || product.gender;
    product.featured = featured !== undefined ? featured : product.featured;

    const updatedProduct = await product.save();
    // Invalidate all product list caches
    if (redisClient) {
      try {
        await redisClient.keys('products:*').then(keys => keys.forEach(key => redisClient.del(key)));
      } catch (e) {}
    }
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.remove();
    // Invalidate all product list caches
    if (redisClient) {
      try {
        await redisClient.keys('products:*').then(keys => keys.forEach(key => redisClient.del(key)));
      } catch (e) {}
    }
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);

  res.json(products);
});

// @desc    Bulk delete products
// @route   POST /api/products/bulk-delete
// @access  Private/Admin
const bulkDeleteProducts = asyncHandler(async (req, res) => {
  const { productIds } = req.body;
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ message: 'No product IDs provided' });
  }
  const result = await Product.deleteMany({ _id: { $in: productIds } });
  // Invalidate all product list caches
  if (redisClient) {
    try {
      await redisClient.keys('products:*').then(keys => keys.forEach(key => redisClient.del(key)));
    } catch (e) {}
  }
  res.json({ message: `Deleted ${result.deletedCount} products` });
});

// @desc    Bulk update products (category/status/featured)
// @route   PUT /api/products/bulk-update
// @access  Private/Admin
const bulkUpdateProducts = asyncHandler(async (req, res) => {
  const { productIds, update } = req.body;
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ message: 'No product IDs provided' });
  }
  // Only allow safe fields
  const allowedFields = ['category', 'status', 'featured'];
  const updateFields = {};
  for (const key of allowedFields) {
    if (update[key] !== undefined) updateFields[key] = update[key];
  }
  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ message: 'No valid fields to update' });
  }
  const result = await Product.updateMany({ _id: { $in: productIds } }, { $set: updateFields });
  // Invalidate all product list caches
  if (redisClient) {
    try {
      await redisClient.keys('products:*').then(keys => keys.forEach(key => redisClient.del(key)));
    } catch (e) {}
  }
  res.json({ message: `Updated ${result.nModified || result.modifiedCount || 0} products` });
});

// @desc    Export products as CSV or Excel
// @route   GET /api/products/export?format=csv|excel
// @access  Private/Admin
const exportProducts = asyncHandler(async (req, res) => {
  const format = req.query.format || 'csv';
  const products = await Product.find({}).populate('category', 'name').lean();
  const fields = [
    { id: '_id', title: 'ID' },
    { id: 'name', title: 'Name' },
    { id: 'price', title: 'Price' },
    { id: 'category', title: 'Category' },
    { id: 'brand', title: 'Brand' },
    { id: 'countInStock', title: 'Stock' },
    { id: 'featured', title: 'Featured' },
    { id: 'createdAt', title: 'CreatedAt' },
  ];
  const data = products.map(p => ({
    ID: p._id,
    Name: p.name,
    Price: p.price,
    Category: p.category?.name || '',
    Brand: p.brand,
    Stock: p.countInStock,
    Featured: p.featured,
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
    const csvWriter = createCsvWriter({ header: fields });
    const csv = csvWriter.stringifyRecords(products.map(p => ({
      _id: p._id,
      name: p.name,
      price: p.price,
      category: p.category?.name || '',
      brand: p.brand,
      countInStock: p.countInStock,
      featured: p.featured,
      createdAt: p.createdAt,
    })));
    res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
    res.setHeader('Content-Type', 'text/csv');
    return res.end(csv);
  }
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  bulkDeleteProducts,
  bulkUpdateProducts,
  exportProducts,
};