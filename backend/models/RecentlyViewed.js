const mongoose = require('mongoose');

const recentlyViewedSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

const RecentlyViewed = mongoose.models.RecentlyViewed || mongoose.model('RecentlyViewed', recentlyViewedSchema);

module.exports = RecentlyViewed;
