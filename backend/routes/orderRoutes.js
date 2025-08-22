const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/authMiddleware');
const sendEmail = require('../utils/sendEmail');
const AuditLog = require('../models/AuditLog');
const { bulkDeleteOrders, bulkUpdateOrders, exportOrders } = require('../controllers/orderController');

// Import enhanced validation middleware
const {
  validateOrder,
  handleValidationErrors
} = require('../middleware/security');

// Centralized error handler for async routes
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post(
  '/',
  protect,
  validateOrder,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      estimatedDelivery,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      estimatedDelivery: req.body.estimatedDelivery || null,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  })
);

// @desc    Create order after payment verification
// @route   POST /api/orders/verify-payment
// @access  Private
router.post(
  '/verify-payment',
  protect,
  validateOrder,
  asyncHandler(async (req, res) => {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      estimatedDelivery,
      paymentResult, // { id, status, update_time, email_address }
    } = req.body;

    // Here you should verify paymentResult with your payment provider API
    // For now, assume paymentResult.status === 'success' is valid
    if (!paymentResult || paymentResult.status !== 'success') {
      return res.status(400).json({ message: 'Payment not verified' });
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      estimatedDelivery: estimatedDelivery || null,
      paymentResult,
      isPaid: true,
      paidAt: Date.now(),
    });

    const createdOrder = await order.save();

    // Decrement product stock for each item
    for (const item of orderItems) {
      const product = await require('../models/Product').findById(item.product);
      if (!product) {
        await AuditLog.create({
          user: req.user._id,
          action: 'order_create_fail_product_not_found',
          details: { productId: item.product },
        });
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
      if (product.countInStock < item.qty) {
        await AuditLog.create({
          user: req.user._id,
          action: 'order_create_fail_insufficient_stock',
          details: {
            productId: item.product,
            requested: item.qty,
            inStock: product.countInStock,
          },
        });
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      product.countInStock -= item.qty;
      await product.save();
    }

    await AuditLog.create({ user: req.user._id, action: 'order_created', details: { orderId: createdOrder._id } });
    res.status(201).json(createdOrder);
  })
);

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(order);
  })
);

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
router.put(
  '/:id/pay',
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  })
);

// @desc    Mark order as delivered
// @route   PUT /api/orders/:id/deliver
// @access  Admin
router.put(
  '/:id/deliver',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    await order.save();
    res.json({ message: 'Order marked as delivered', order });
  })
);

// @desc    Unmark order as delivered
// @route   PUT /api/orders/:id/unmark-delivered
// @access  Admin
router.put(
  '/:id/unmark-delivered',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.isDelivered = false;
    order.deliveredAt = null;
    order.status = 'processing';
    await order.save();
    res.json({ message: 'Order unmarked as delivered', order });
  })
);

// @desc    Mark order as cancelled
// @route   PUT /api/orders/:id/cancel
// @access  Admin
router.put(
  '/:id/cancel',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.cancelRequested = true;
    await order.save();
    res.json({ message: 'Order marked as cancelled', order });
  })
);

// @desc    User requests order cancellation
// @route   PUT /api/orders/:id/request-cancel
// @access  Private
router.put(
  '/:id/request-cancel',
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    order.cancelRequested = true;
    await order.save();
    res.json({ message: 'Order cancellation requested', order });
  })
);

// @desc    User requests order return
// @route   PUT /api/orders/:id/request-return
// @access  Private
router.put(
  '/:id/request-return',
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    order.returnRequested = true;
    await order.save();
    res.json({ message: 'Order return requested', order });
  })
);

// Bulk operations (admin only)
router.post('/bulk-delete', protect, admin, bulkDeleteOrders);
router.put('/bulk-update', protect, admin, bulkUpdateOrders);

// Export orders (admin only)
router.get('/export', protect, admin, exportOrders);

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get(
  '/myorders',
  protect,
  asyncHandler(async (req, res) => {
    try {
      // Defensive: validate user ID
      if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const orders = await Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .select('orderItems totalPrice status createdAt updatedAt isPaid isDelivered trackingInfo');
      // Optionally, add tracking info for each order
      res.json(orders);
    } catch (error) {
      console.error('Error fetching user order history:', error);
      res.status(500).json({ message: 'Server error fetching order history', error: error.message });
    }
  })
);

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
router.get(
  '/',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({})
      .populate('user', 'id name')
      .sort({ createdAt: -1 });
    res.json(orders);
  })
);

// At the end of the file, ensure you have a global error handler:
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

module.exports = router;