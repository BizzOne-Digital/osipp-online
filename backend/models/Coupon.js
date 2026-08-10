const mongoose = require('mongoose');
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  // 'free_delivery' waives the delivery + processing/handling fee entirely instead of
  // discounting the product subtotal — `value` is unused for this type.
  type: { type: String, enum: ['percentage', 'fixed', 'free_delivery'], required: true },
  value: { type: Number, required: function () { return this.type !== 'free_delivery'; }, min: 0, default: 0 },
  minOrder: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: null },
  usageLimit: { type: Number, default: null },
  usedCount: { type: Number, default: 0 },
  perUserLimit: { type: Number, default: 1 },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // Tracks redemptions by phone number too, since most orders are placed as a guest
  // (no account) — this is what actually enforces "first order only" for guests.
  usedByPhone: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: null },
  description: { type: String, default: '' }
}, { timestamps: true });
module.exports = mongoose.model('Coupon', couponSchema);
