const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  balance: {
    type: Number,
    default: 1000.00, 
  },
  alertSettings: {
    dailyLimit: {
      type: Number,
      default: 100,
    },
    weeklyLimit: {
      type: Number,
      default: 500,
    },
    monthlyLimit: {
      type: Number,
      default: 2000,
    },
    largeTransactionThreshold: {
      type: Number,
      default: 200,
    },
    enableEmailNotifications: {
      type: Boolean,
      default: true,
    },
  },
}, {
  timestamps: true,
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});


userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};


userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);