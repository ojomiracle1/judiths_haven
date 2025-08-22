const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  type: {
    type: String,
    enum: ['percent', 'fixed'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  expiry: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Coupon', couponSchema); 