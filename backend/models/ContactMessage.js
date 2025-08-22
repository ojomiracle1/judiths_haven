const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  reply: { type: String },
  repliedAt: { type: Date }
});

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
