const Product = require('../models/Product');

// Add a review to a product
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed' });
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
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all reviews for a product
exports.getReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product.reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
