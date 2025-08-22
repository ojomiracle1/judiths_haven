const mongoose = require('mongoose');

const salesStatsSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  month: { type: Number, required: true }, // 1-12
  totalSales: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

salesStatsSchema.index({ year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('SalesStats', salesStatsSchema);
