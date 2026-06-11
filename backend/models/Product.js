const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, enum: ['Beer', 'Spirits', 'Wine', 'Convenience', 'Ready To Drink'] },
  subCategory: { type: String, default: '' },
  store: { type: String, required: true, enum: ['Beer Store', 'Liquor Store', 'Convenience Store'] },
  volume: { type: String, default: '' },
  image: { type: String, default: '' },
  badge: { type: String, default: '', enum: ['', 'Popular', 'Premium', 'Sale', 'New'] },
  stock: { type: Number, default: 100, min: 0 },
  isActive: { type: Boolean, default: true },
  sku: { type: String, default: '' }
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);