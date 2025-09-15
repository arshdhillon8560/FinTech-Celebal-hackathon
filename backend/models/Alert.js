const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['spending_limit', 'large_transaction', 'unusual_activity', 'account_security'],
  },
  message: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  metadata: {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    amount: Number,
    category: String,
  },
}, {
  timestamps: true,
});


alertSchema.index({ user: 1, createdAt: -1 });
alertSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model('Alert', alertSchema);