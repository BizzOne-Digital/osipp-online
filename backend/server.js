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
app.use(cors());
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

// Production: serve React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/build', 'index.html')));
}

app.use((err, req, res, next) => { console.error(err.stack); res.status(500).json({ success: false, message: err.message }); });

// Only listen when running directly (not on Vercel)
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/osipp_delivery';
  mongoose.connect(MONGO_URI)
    .then(() => { console.log('MongoDB Connected'); app.listen(PORT, () => console.log(`Server on port ${PORT}`)); })
    .catch(err => { console.error(err); process.exit(1); });
}

module.exports = app;