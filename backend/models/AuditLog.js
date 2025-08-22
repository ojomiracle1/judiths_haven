const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // allow null for system actions
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: Object,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
