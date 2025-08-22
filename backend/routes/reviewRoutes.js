const express = require('express');
const router = express.Router({ mergeParams: true });
const { addReview, getReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { validateReview } = require('../middleware/validation');

// POST /api/products/:productId/reviews
router.post('/', protect, validateReview, addReview);
// GET /api/products/:productId/reviews
router.get('/', getReviews);

module.exports = router;
