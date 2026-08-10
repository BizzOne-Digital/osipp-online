const mongoose = require('mongoose');

// A size/price option for a product (e.g. 1750 mL Bottle for $69.95).
// Image stays on the parent product — variants do not carry their own image.
const variantSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true }, // e.g. "1750 mL Bottle"
  price: { type: Number, required: true, min: 0 },
  // Pre-sale reference price. When higher than `price`, the difference shows as a
  // "Save $X" badge on this size.
  originalPrice: { type: Number, default: 0 },
  stock: { type: Number, default: 100, min: 0 },
  sku: { type: String, default: '' },
  // Optional per-size store override, e.g. a 24-pack that's picked up from the Beer Store
  // specifically while other sizes of the same product come from Liquor Store. Empty = inherit
  // the product's own `store`.
  store: { type: String, default: '', enum: ['', 'Beer Store', 'Liquor Store', 'Convenience Store'] }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  // Pre-sale reference price. When higher than `price`, the difference shows as a
  // "Save $X" badge on the product card and detail page.
  originalPrice: { type: Number, default: 0 },
  category: { type: String, required: true, enum: ['Beer', 'Spirits', 'Wine', 'Convenience', 'Ready To Drink'] },
  subCategory: { type: String, default: '' },
  store: { type: String, required: true, enum: ['Beer Store', 'Liquor Store', 'Convenience Store'] },
  volume: { type: String, default: '' },
  image: { type: String, default: '' },
  badge: { type: String, default: '', enum: ['', 'Popular', 'Premium', 'Sale', 'New'] },
  stock: { type: Number, default: 100, min: 0 },
  isActive: { type: Boolean, default: true },
  sku: { type: String, default: '' },
  // Smoke/tobacco products can't be returned once purchased — orders containing one require
  // advance card payment only, no cash on delivery.
  isTobacco: { type: Boolean, default: false },
  // Admin-curated "Trending" flag — independent of the `badge` field — shown in its own
  // Home page section so admin can hand-pick what's trending without touching badges/sale.
  isTrending: { type: Boolean, default: false },
  // Optional size options. If empty, the base `price` is used (backward compatible).
  variants: { type: [variantSchema], default: [] },
  // Controls display order on the public site. Admin can hit "Shuffle Products" to randomize
  // this for all products, giving less-visible items a turn at the top of the list.
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);