const express = require('express');
const Alert = require('../models/Alert');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all alerts for user
router.get('/', auth, async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark alert as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const alert = await Alert.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    alert.isRead = true;
    await alert.save();

    res.json(alert);
  } catch (error) {
    console.error('Mark alert as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get alert settings
router.get('/settings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.alertSettings);
  } catch (error) {
    console.error('Get alert settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update alert settings
router.put('/settings', auth, async (req, res) => {
  try {
    const {
      dailyLimit,
      weeklyLimit,
      monthlyLimit,
      largeTransactionThreshold,
      enableEmailNotifications,
    } = req.body;

    const user = await User.findById(req.user._id);
    
    user.alertSettings = {
      dailyLimit: parseFloat(dailyLimit),
      weeklyLimit: parseFloat(weeklyLimit),
      monthlyLimit: parseFloat(monthlyLimit),
      largeTransactionThreshold: parseFloat(largeTransactionThreshold),
      enableEmailNotifications: Boolean(enableEmailNotifications),
    };

    await user.save();
    res.json(user.alertSettings);
  } catch (error) {
    console.error('Update alert settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create alert (internal use)
router.post('/', auth, async (req, res) => {
  try {
    const { type, message, severity, metadata } = req.body;

    const alert = new Alert({
      user: req.user._id,
      type,
      message,
      severity: severity || 'medium',
      metadata: metadata || {},
    });

    await alert.save();
    res.status(201).json(alert);
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;