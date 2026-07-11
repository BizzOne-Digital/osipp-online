const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// ── MongoDB connection caching for serverless ──
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = conn.connections[0].readyState === 1;
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB error:', err.message);
    throw err;
  }
};

const app = express();

// Security & Middleware
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Connect to DB before every request (cached)
app.use(async (req, res, next) => {
  try { await connectDB(); next(); }
  catch (err) { res.status(500).json({ success: false, message: 'Database connection failed' }); }
});

// ── Load Models (required before routes) ──
require(path.join(__dirname, '..', 'backend', 'models', 'User'));
require(path.join(__dirname, '..', 'backend', 'models', 'Product'));
require(path.join(__dirname, '..', 'backend', 'models', 'Order'));
require(path.join(__dirname, '..', 'backend', 'models', 'Settings'));
require(path.join(__dirname, '..', 'backend', 'models', 'Promotion'));
require(path.join(__dirname, '..', 'backend', 'models', 'Coupon'));
require(path.join(__dirname, '..', 'backend', 'models', 'Banner'));
require(path.join(__dirname, '..', 'backend', 'models', 'ServiceRequest'));

// ── Routes ──
app.use('/api/auth', require(path.join(__dirname, '..', 'backend', 'routes', 'auth')));
app.use('/api/products', require(path.join(__dirname, '..', 'backend', 'routes', 'products')));
app.use('/api/orders', require(path.join(__dirname, '..', 'backend', 'routes', 'orders')));
app.use('/api/categories', require(path.join(__dirname, '..', 'backend', 'routes', 'categories')));
app.use('/api/dashboard', require(path.join(__dirname, '..', 'backend', 'routes', 'dashboard')));
app.use('/api/customers', require(path.join(__dirname, '..', 'backend', 'routes', 'customers')));
app.use('/api/settings', require(path.join(__dirname, '..', 'backend', 'routes', 'settings')));
app.use('/api/promotions', require(path.join(__dirname, '..', 'backend', 'routes', 'promotions')));
app.use('/api/coupons', require(path.join(__dirname, '..', 'backend', 'routes', 'coupons')));
app.use('/api/banners', require(path.join(__dirname, '..', 'backend', 'routes', 'banners')));
app.use('/api/services', require(path.join(__dirname, '..', 'backend', 'routes', 'services')));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

// Export for Vercel serverless
module.exports = app;