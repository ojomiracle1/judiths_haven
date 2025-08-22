const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const sendEmail = require('../utils/sendEmail');
const { protect, admin } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public
router.post('/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('message').notEmpty().withMessage('Message is required'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ],
  async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    // Save to DB
    const contact = await ContactMessage.create({ name, email, message });
    // Log all messages for debugging
    const allMessages = await ContactMessage.find();
    console.log('All contact messages:', allMessages);
    // Send email to admin
    await sendEmail({
      email: process.env.CONTACT_EMAIL || 'ojomiracle20@gmail.com',
      subject: `New Contact Inquiry from ${name}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong><br/>${message}</p>`
    });
    res.status(201).json({ message: 'Your message has been sent!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
});

// Get all contact messages (admin only)
router.get('/', protect, admin, async (req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  res.json(messages);
});

// Admin reply to a contact message
router.post('/:id/reply', protect, admin, async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply) {
      return res.status(400).json({ message: 'Reply message is required.' });
    }
    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Contact message not found.' });
    }
    // Send reply email to user
    await sendEmail({
      email: message.email,
      subject: `Reply to your inquiry` ,
      html: `<p>Hi ${message.name},</p><p>${reply}</p>`
    });
    // Save reply in DB
    message.reply = reply;
    message.repliedAt = new Date();
    await message.save();
    res.json({ message: 'Reply sent and saved.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send reply', error: error.message });
  }
});

module.exports = router;
