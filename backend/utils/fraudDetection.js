const Alert = require('../models/Alert');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { sendAlertEmail } = require('./emailService');

const checkFraudRules = async (userId, transaction) => {
  try {
    const user = await User.findById(userId);
    const { alertSettings } = user;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const alerts = [];

    // Only check for expense transactions
    if (transaction.type !== 'expense') {
      return;
    }

    // Large transaction rule
    if (transaction.amount >= alertSettings.largeTransactionThreshold) {
      alerts.push({
        type: 'large_transaction',
        message: `Large transaction detected: $${transaction.amount.toFixed(2)} for ${transaction.description}`,
        severity: 'high',
        metadata: {
          transactionId: transaction._id,
          amount: transaction.amount,
          category: transaction.category,
        },
      });
    }

    // Daily spending
    const dailySpending = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          createdAt: { $gte: today },
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    const dailyTotal = dailySpending[0]?.total || 0;
    if (dailyTotal > alertSettings.dailyLimit) {
      alerts.push({
        type: 'spending_limit',
        message: `Daily spending limit exceeded: $${dailyTotal.toFixed(2)} of $${alertSettings.dailyLimit} limit`,
        severity: 'medium',
      });
    }

    // Weekly spending
    const weeklySpending = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          createdAt: { $gte: weekStart },
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    const weeklyTotal = weeklySpending[0]?.total || 0;
    if (weeklyTotal > alertSettings.weeklyLimit) {
      alerts.push({
        type: 'spending_limit',
        message: `Weekly spending limit exceeded: $${weeklyTotal.toFixed(2)} of $${alertSettings.weeklyLimit} limit`,
        severity: 'medium',
      });
    }

    // Monthly spending
    const monthlySpending = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          createdAt: { $gte: monthStart },
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    const monthlyTotal = monthlySpending[0]?.total || 0;
    if (monthlyTotal > alertSettings.monthlyLimit) {
      alerts.push({
        type: 'spending_limit',
        message: `Monthly spending limit exceeded: $${monthlyTotal.toFixed(2)} of $${alertSettings.monthlyLimit} limit`,
        severity: 'high',
      });
    }

    // Unusual activity (too many txns in 30 mins)
    const recentTransactions = await Transaction.find({
      user: userId,
      type: 'expense',
      createdAt: { $gte: new Date(now.getTime() - (30 * 60 * 1000)) },
    });
    if (recentTransactions.length >= 5) {
      alerts.push({
        type: 'unusual_activity',
        message: `Unusual activity detected: ${recentTransactions.length} transactions in the last 30 minutes`,
        severity: 'high',
      });
    }

    // Save alerts + email
    for (const alertData of alerts) {
      const alert = new Alert({
        user: userId,
        ...alertData,
      });
      await alert.save();

      if (alertSettings.enableEmailNotifications) {
        await sendAlertEmail(user.email, user.name, alert);
      }
    }
  } catch (error) {
    console.error('Fraud detection error:', error);
  }
};

const categorizeTransaction = (description) => {
  const categories = {
    food: ['restaurant', 'food', 'grocery', 'cafe', 'pizza', 'burger', 'starbucks', 'mcdonalds'],
    transport: ['uber', 'lyft', 'taxi', 'gas', 'fuel', 'parking', 'metro', 'bus', 'train'],
    shopping: ['amazon', 'walmart', 'target', 'mall', 'store', 'shop', 'purchase'],
    entertainment: ['movie', 'netflix', 'spotify', 'game', 'concert', 'theater'],
    utilities: ['electric', 'water', 'phone', 'internet', 'cable', 'utility'],
    healthcare: ['doctor', 'hospital', 'pharmacy', 'medical', 'dental'],
  };

  const lowerDesc = description.toLowerCase();
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerDesc.includes(keyword))) {
      return category;
    }
  }
  return 'other';
};

module.exports = {
  checkFraudRules,
  categorizeTransaction,
};
