const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const transferRoutes = require('./routes/transfers');
const alertRoutes = require('./routes/alerts');

const app = express();



app.set('trust proxy', 1);


app.use(helmet());

app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json());


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this IP, please try again later.',
  },
});

app.use(limiter);



mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/fintech'
);

const db = mongoose.connection;

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});


app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/alerts', alertRoutes);



app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});


app.get('/', (req, res) => {
  res.json({
    message: 'FinTech Backend API Running Successfully 🚀',
  });
});


app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
});



app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});