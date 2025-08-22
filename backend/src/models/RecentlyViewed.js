const mongoose = require('mongoose');

const recentlyViewedSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RecentlyViewed', recentlyViewedSchema);
