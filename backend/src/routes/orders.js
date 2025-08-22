const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// Create new order
router.post('/', protect, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      shippingPrice,
      taxPrice
    } = req.body;

    if (items && items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      shippingPrice,
      taxPrice
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get order by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name image price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order belongs to the user or if user is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order to paid
router.put('/:id/pay', protect, async (req, res) => {
  try {
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
      email_address: req.body.email_address
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order to delivered
router.put('/:id/deliver', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.trackingNumber = req.body.trackingNumber;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status (admin only)
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const { status, trackingNumber, notes } = req.body;
    if (status) order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (notes) order.notes = notes;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get logged in user orders
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name image price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all orders (admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;

    const count = await Order.countDocuments({});
    const orders = await Order.find({})
      .populate('user', 'id name')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      orders,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Download invoice as PDF
router.get('/:id/invoice', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Only allow the user who placed the order or an admin
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to download this invoice' });
    }
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);
    doc.pipe(res);
    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Order ID: ${order._id}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.text(`Customer: ${order.user.name} (${order.user.email})`);
    doc.text(`Shipping Address: ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.zipCode}, ${order.shippingAddress.country}`);
    doc.moveDown();
    doc.text('Items:');
    order.items.forEach((item, idx) => {
      doc.text(`${idx + 1}. ${item.product} x${item.quantity} - ₦${item.price}`);
    });
    doc.moveDown();
    doc.text(`Total: ₦${order.totalPrice}`);
    doc.text(`Status: ${order.status}`);
    doc.text(`Paid: ${order.isPaid ? 'Yes' : 'No'}`);
    doc.text(`Delivered: ${order.isDelivered ? 'Yes' : 'No'}`);
    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;