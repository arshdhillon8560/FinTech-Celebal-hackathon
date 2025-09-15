const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed',
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true,
  },
}, {
  timestamps: true,
});


transferSchema.index({ sender: 1, createdAt: -1 });
transferSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Transfer', transferSchema);