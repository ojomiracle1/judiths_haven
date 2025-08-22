const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect, admin } = require('../middleware/authMiddleware');
let redisClient;
try {
  const redis = require('redis');
  redisClient = redis.createClient();
  redisClient.connect().catch(() => { redisClient = null; });
} catch (e) {
  redisClient = null;
}

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const cacheKey = 'categories:all';
    let cached = null;
    if (redisClient) {
      try {
        cached = await redisClient.get(cacheKey);
      } catch (e) { cached = null; }
    }
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    const categories = await Category.find({}).sort({ createdAt: -1 });
    if (redisClient) {
      try {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(categories)); // Cache for 1 hour
      } catch (e) {}
    }
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const category = new Category(req.body);
    const createdCategory = await category.save();
    if (redisClient) {
      try {
        await redisClient.del('categories:all'); // Invalidate cache
      } catch (e) {}
    }
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (redisClient) {
      try {
        await redisClient.del('categories:all'); // Invalidate cache
      } catch (e) {}
    }
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.deleteOne();
    if (redisClient) {
      try {
        await redisClient.del('categories:all'); // Invalidate cache
      } catch (e) {}
    }
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 