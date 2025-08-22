const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const SalesStats = require('../utils/updateSalesStats');
const Coupon = require('../models/Coupon');
const XLSX = require('xlsx');
const createCsvWriter = require('csv-writer').createObjectCsvStringifier;
const fs = require('fs');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    couponCode,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  let coupon = null;
  let couponDiscount = 0;
  let couponType = null;
  let couponValue = null;
  let couponId = null;
  let finalTotal = totalPrice;

  if (couponCode) {
    coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon) {
      return res.status(400).json({ message: 'Invalid coupon code.' });
    }
    if (coupon.isUsed) {
      return res.status(400).json({ message: 'Coupon already used.' });
    }
    if (coupon.expiry && new Date() > coupon.expiry) {
      return res.status(400).json({ message: 'Coupon expired.' });
    }
    couponType = coupon.type;
    couponValue = coupon.value;
    couponId = coupon._id;
    if (coupon.type === 'percent') {
      couponDiscount = (totalPrice * coupon.value) / 100;
    } else if (coupon.type === 'fixed') {
      couponDiscount = coupon.value;
    }
    couponDiscount = Math.min(couponDiscount, totalPrice);
    finalTotal = totalPrice - couponDiscount;
    coupon.isUsed = true;
    await coupon.save();
  }

  const order = new Order({
    orderItems,
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice: finalTotal,
    couponCode: couponCode ? couponCode.toUpperCase() : undefined,
    couponType,
    couponValue,
    couponDiscount,
    couponId,
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  // After order is paid, update sales stats
  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();
    // Update sales stats after payment
    await SalesStats.updateSalesStats(updatedOrder);
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'delivered';

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  const count = await Order.countDocuments({});
  const orders = await Order.find({})
    .populate('user', 'id name')
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ orders, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Bulk delete orders
// @route   POST /api/orders/bulk-delete
// @access  Private/Admin
const bulkDeleteOrders = asyncHandler(async (req, res) => {
  const { orderIds } = req.body;
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return res.status(400).json({ message: 'No order IDs provided' });
  }
  const result = await Order.deleteMany({ _id: { $in: orderIds } });
  res.json({ message: `Deleted ${result.deletedCount} orders` });
});

// @desc    Bulk update orders (status)
// @route   PUT /api/orders/bulk-update
// @access  Private/Admin
const bulkUpdateOrders = asyncHandler(async (req, res) => {
  const { orderIds, update } = req.body;
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return res.status(400).json({ message: 'No order IDs provided' });
  }
  // Only allow safe fields
  const allowedFields = ['status'];
  const updateFields = {};
  for (const key of allowedFields) {
    if (update[key] !== undefined) updateFields[key] = update[key];
  }
  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ message: 'No valid fields to update' });
  }
  const result = await Order.updateMany({ _id: { $in: orderIds } }, { $set: updateFields });
  res.json({ message: `Updated ${result.nModified || result.modifiedCount || 0} orders` });
});

// @desc    Export orders as CSV or Excel
// @route   GET /api/orders/export?format=csv|excel
// @access  Private/Admin
const exportOrders = asyncHandler(async (req, res) => {
  const format = req.query.format || 'csv';
  const orders = await Order.find({}).populate('user', 'name email').lean();
  const fields = [
    { id: '_id', title: 'OrderID' },
    { id: 'user', title: 'User' },
    { id: 'email', title: 'Email' },
    { id: 'totalPrice', title: 'Total' },
    { id: 'status', title: 'Status' },
    { id: 'isPaid', title: 'Paid' },
    { id: 'isDelivered', title: 'Delivered' },
    { id: 'createdAt', title: 'CreatedAt' },
  ];
  const data = orders.map(o => ({
    OrderID: o._id,
    User: o.user?.name || '',
    Email: o.user?.email || '',
    Total: o.totalPrice,
    Status: o.status,
    Paid: o.isPaid,
    Delivered: o.isDelivered,
    CreatedAt: o.createdAt,
  }));
  if (format === 'excel') {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="orders.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.end(buf);
  } else {
    const csvWriter = createCsvWriter({ header: fields });
    const csv = csvWriter.stringifyRecords(orders.map(o => ({
      _id: o._id,
      user: o.user?.name || '',
      email: o.user?.email || '',
      totalPrice: o.totalPrice,
      status: o.status,
      isPaid: o.isPaid,
      isDelivered: o.isDelivered,
      createdAt: o.createdAt,
    })));
    res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
    res.setHeader('Content-Type', 'text/csv');
    return res.end(csv);
  }
});

module.exports = {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  bulkDeleteOrders,
  bulkUpdateOrders,
  exportOrders,
};