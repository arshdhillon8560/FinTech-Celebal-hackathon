const express = require('express');
const Transfer = require('../models/Transfer');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all transfers for user
router.get('/', auth, async (req, res) => {
  try {
    const transfers = await Transfer.find({
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id }
      ]
    })
    .populate('sender', 'name email')
    .populate('recipient', 'name email')
    .sort({ createdAt: -1 });

    res.json(transfers);
  } catch (error) {
    console.error('Get transfers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send money to another user
router.post('/', auth, async (req, res) => {
  try {
    const { recipientId, amount, description } = req.body;
    const senderId = req.user._id;

    // Check if sender has sufficient balance
    const sender = await User.findById(senderId);
    if (sender.balance < parseFloat(amount)) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Prevent self-transfer
    if (senderId.toString() === recipientId) {
      return res.status(400).json({ message: 'Cannot transfer to yourself' });
    }

    // Create transfer record
    const transfer = new Transfer({
      sender: senderId,
      recipient: recipientId,
      amount: parseFloat(amount),
      description: description || '',
    });

    // Update balances
    sender.balance -= parseFloat(amount);
    recipient.balance += parseFloat(amount);

    // Save all changes
    await Promise.all([
      transfer.save(),
      sender.save(),
      recipient.save(),
    ]);

    // Populate the transfer for response
    await transfer.populate('sender', 'name email');
    await transfer.populate('recipient', 'name email');

    res.status(201).json({
      transfer,
      newBalance: sender.balance,
    });
  } catch (error) {
    console.error('Send transfer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (for transfer recipient selection)
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('name email')
      .sort({ name: 1 });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;