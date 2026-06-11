const mongoose = require('mongoose');
const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  image: { type: String, default: '' },
  link: { type: String, default: '' },
  page: { type: String, enum: ['home', 'products', 'all'], default: 'home' },
  position: { type: String, enum: ['top', 'middle', 'bottom'], default: 'top' },
  bgColor: { type: String, default: '#C4853A' },
  textColor: { type: String, default: '#FFFFFF' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: null }
}, { timestamps: true });
module.exports = mongoose.model('Banner', bannerSchema);
