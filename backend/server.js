const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Safety net — without these, an unhandled promise rejection or thrown error outside a
// route's try/catch would crash silently (or crash the whole process) with nothing in the logs.
process.on('unhandledRejection', (err) => console.error('[UNHANDLED REJECTION]', err));
process.on('uncaughtException', (err) => console.error('[UNCAUGHT EXCEPTION]', err));

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  credentials: true
}));
// Stripe webhook needs the raw body for signature verification, so it must skip the global JSON parser below.
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use((req, res, next) => {
  if (req.path === '/api/payments/webhook') return next();
  express.json({ limit: '10mb' })(req, res, next);
});

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
app.use('/api/payments', require('./routes/payments'));
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
  console.error(`[SERVER] ${req.method} ${req.path} failed:`, err.message, err.stack);
  res.status(500).json({ success: false, message: err.message });
});

// Local dev only
if (!process.env.VERCEL) {
  const { verifyMailer } = require('./utils/mailer');
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => { console.log('MongoDB Connected'); verifyMailer(); app.listen(PORT, () => console.log(`Server on port ${PORT}`)); })
    .catch(err => { console.error(err); process.exit(1); });
}

module.exports = app;