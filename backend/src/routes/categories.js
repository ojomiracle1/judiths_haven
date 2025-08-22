const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect, admin } = require('../middleware/auth');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({})
      .populate('parent', 'name')
      .sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('parent', 'name');
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create category (admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const category = new Category(req.body);
    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update category (admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    Object.assign(category, req.body);
    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete category (admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has subcategories
    const hasSubcategories = await Category.exists({ parent: category._id });
    if (hasSubcategories) {
      return res.status(400).json({ message: 'Cannot delete category with subcategories' });
    }

    await category.remove();
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get featured categories
router.get('/featured', async (req, res) => {
  try {
    const categories = await Category.find({ featured: true })
      .populate('parent', 'name')
      .sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 