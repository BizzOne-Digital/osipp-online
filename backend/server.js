const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
require('dotenv').config();

const { apiLimiter, authLimiter } = require('./middleware/security');
const app = express();

// Security
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
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

// Production: serve React
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/build', 'index.html')));
}

app.use((err, req, res, next) => { console.error(err.stack); res.status(500).json({ success: false, message: err.message || 'Server Error' }); });

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/osipp_delivery')
  .then(() => { console.log('MongoDB Connected'); app.listen(PORT, () => console.log(`Server on port ${PORT}`)); })
  .catch(err => { console.error(err); process.exit(1); });
