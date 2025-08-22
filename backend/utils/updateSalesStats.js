const SalesStats = require('../models/SalesStats');

// Update or create monthly sales stats
async function updateSalesStats(order) {
  const year = order.orderYear || (order.createdAt ? order.createdAt.getFullYear() : new Date().getFullYear());
  const month = order.orderMonth || (order.createdAt ? order.createdAt.getMonth() + 1 : new Date().getMonth() + 1);
  const total = order.totalPrice;

  await SalesStats.findOneAndUpdate(
    { year, month },
    {
      $inc: { totalSales: total, totalOrders: 1 },
      $set: { updatedAt: new Date() }
    },
    { upsert: true, new: true }
  );
}

module.exports = { updateSalesStats };
