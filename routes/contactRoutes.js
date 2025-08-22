const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const sendEmail = require('../utils/sendEmail');

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    // Save to DB
    const contact = await ContactMessage.create({ name, email, message });
    // Send email to admin
    await sendEmail({
      to: process.env.CONTACT_EMAIL || 'your@email.com',
      subject: `New Contact Inquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    });
    res.status(201).json({ message: 'Your message has been sent!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
});

module.exports = router;
