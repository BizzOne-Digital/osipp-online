const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// ── MongoDB connection (cached for serverless) ──
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  mongoose.set('bufferCommands', false);
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
  isConnected = conn.connections[0].readyState === 1;
};

// ── MUST connect BEFORE any route runs ──
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection failed:', err.message);
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/promotions', require('./routes/promotions'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/banners', require('./routes/banners'));
app.use('/api/services', require('./routes/services'));
app.get('/api/health', (req, res) => res.json({ status: 'ok', db: isConnected }));

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ success: false, message: err.message });
});

// Local dev only
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => { console.log('MongoDB Connected'); app.listen(PORT, () => console.log(`Server on port ${PORT}`)); })
    .catch(err => { console.error(err); process.exit(1); });
}

module.exports = app;