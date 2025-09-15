const express = require('express');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { checkFraudRules } = require('../utils/fraudDetection');

const router = express.Router();

// Get all transactions for user
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new transaction
router.post('/', auth, async (req, res) => {
  try {
    const { amount, description, category, type } = req.body;

    const transaction = new Transaction({
      user: req.user._id,
      amount: parseFloat(amount),
      description,
      category,
      type,
    });

    await transaction.save();

    // Update user balance
    const user = await User.findById(req.user._id);
    if (type === 'expense') {
      user.balance -= parseFloat(amount);
    } else {
      user.balance += parseFloat(amount);
    }
    await user.save();

    // Check for fraud and create alerts
    await checkFraudRules(req.user._id, transaction);

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update transaction
router.put('/:id', auth, async (req, res) => {
  try {
    const { amount, description, category, type } = req.body;
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Calculate balance adjustment
    const user = await User.findById(req.user._id);
    const oldAmount = transaction.amount;
    const newAmount = parseFloat(amount);

    // Reverse old transaction
    if (transaction.type === 'expense') {
      user.balance += oldAmount;
    } else {
      user.balance -= oldAmount;
    }

    // Apply new transaction
    if (type === 'expense') {
      user.balance -= newAmount;
    } else {
      user.balance += newAmount;
    }

    // Update transaction
    transaction.amount = newAmount;
    transaction.description = description;
    transaction.category = category;
    transaction.type = type;

    await transaction.save();
    await user.save();

    res.json(transaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Update user balance
    const user = await User.findById(req.user._id);
    if (transaction.type === 'expense') {
      user.balance += transaction.amount;
    } else {
      user.balance -= transaction.amount;
    }
    await user.save();

    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get spending statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const userId = req.user._id;

    // Get current date ranges
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Current month spending
    const thisMonthExpenses = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          createdAt: { $gte: currentMonth, $lte: currentMonthEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Last month spending
    const lastMonthExpenses = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Category breakdown
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          createdAt: { $gte: currentMonth }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Monthly trends (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyTrends = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          amount: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const thisMonth = thisMonthExpenses[0]?.total || 0;
    const lastMonthTotal = lastMonthExpenses[0]?.total || 0;
    const monthlyChange = lastMonthTotal > 0 ? ((thisMonth - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    // Format category breakdown
    const categoryData = {};
    categoryBreakdown.forEach(item => {
      categoryData[item._id] = item.total;
    });

    // Format monthly trends
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendsData = monthlyTrends.map(item => ({
      month: monthNames[item._id.month - 1],
      amount: item.amount
    }));

    res.json({
      thisMonth,
      lastMonth: lastMonthTotal,
      monthlyChange,
      categoryBreakdown: categoryData,
      monthlyTrends: trendsData,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;