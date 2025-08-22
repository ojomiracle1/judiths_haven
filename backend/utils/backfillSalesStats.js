const Order = require('../models/orderModel');
const SalesStats = require('../models/SalesStats');

async function backfillSalesStats(year) {
  const match = year ? {
    isPaid: true,
    paidAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) }
  } : { isPaid: true };

  const stats = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: { year: { $year: "$paidAt" }, month: { $month: "$paidAt" } },
        totalSales: { $sum: "$totalPrice" },
        totalOrders: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  for (const s of stats) {
    await SalesStats.findOneAndUpdate(
      { year: s._id.year, month: s._id.month },
      {
        $set: { totalSales: s.totalSales, totalOrders: s.totalOrders, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );
  }
  return stats.length;
}

module.exports = { backfillSalesStats };
