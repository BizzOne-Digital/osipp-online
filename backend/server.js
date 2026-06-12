const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
require('dotenv').config();

let apiLimiter, authLimiter;
try {
  const sec = require('./middleware/security');
  apiLimiter = sec.apiLimiter;
  authLimiter = sec.authLimiter;
} catch (e) {
  const rateLimit = require('express-rate-limit');
  apiLimiter = rateLimit({ windowMs: 15*60*1000, max: 200 });
  authLimiter = rateLimit({ windowMs: 15*60*1000, max: 10 });
}

const app = express();

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

// CORS - allow frontend domain
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

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
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ success: false, message: err.message });
});

// ── MongoDB connection (cached for serverless) ──
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  const conn = await mongoose.connect(process.env.MONGO_URI);
  isConnected = conn.connections[0].readyState === 1;
};

// Local dev: listen on port
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => { console.log('MongoDB Connected'); app.listen(PORT, () => console.log(`Server on port ${PORT}`)); })
    .catch(err => { console.error(err); process.exit(1); });
} else {
  // Vercel: connect on each request
  app.use(async (req, res, next) => {
    try { await connectDB(); next(); } catch (err) { res.status(500).json({ success: false, message: 'DB error' }); }
  });
}

module.exports = app;