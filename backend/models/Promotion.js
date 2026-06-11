const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['percentage', 'fixed', 'banner'], default: 'banner' },
  value: { type: Number, default: 0 },  // discount value (% or $)
  code: { type: String, default: '', uppercase: true, trim: true },
  minOrder: { type: Number, default: 0 },
  category: { type: String, default: '' }, // apply to specific category or empty for all
  isActive: { type: Boolean, default: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Promotion', promotionSchema);
