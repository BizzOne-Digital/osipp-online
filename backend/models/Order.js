const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  volume: { type: String, default: '' },
  variantLabel: { type: String, default: '' }, // selected size, if any
  store: { type: String, default: '' }
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  customer: {
    name: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, default: 'Mississauga' },
    postalCode: { type: String, default: '' }
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  items: [orderItemSchema],
  addOns: {
    type: [{
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, default: 1, min: 1 }
    }],
    default: []
  },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  couponCode: { type: String, default: '' },
  deliveryFee: { type: Number, default: 0 },
  // Which tier the flat delivery fee was charged under, e.g. "Multi-Stop or Medium Order"
  deliveryTier: { type: String, default: '' },
  // Stores visited for this order (fee is now a flat tier fee, not per-stop)
  deliveryStops: {
    type: [{ store: String, fee: Number }],
    default: []
  },
  tip: { type: Number, default: 0, min: 0 },
  // Processing & Handling — includes the 3.2% card/tap surcharge when paid by card/stripe
  handlingFee: { type: Number, default: 0 },
  driverInstructions: { type: String, default: '' },
  deliveryTiming: { type: String, enum: ['asap', 'scheduled'], default: 'asap' },
  scheduledDate: { type: String, default: '' },
  scheduledTime: { type: String, default: '' },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['card', 'cash', 'interac', 'stripe'], default: 'cash' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  stripeSessionId: { type: String, default: '' },
  stripePaymentIntentId: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'confirmed', 'picking', 'out_for_delivery', 'delivered', 'cancelled'], default: 'pending' },
  notes: { type: String, default: '' },
  deliveredAt: { type: Date, default: null },
  cancelledAt: { type: Date, default: null },
  cancelReason: { type: String, default: '' }
}, { timestamps: true });

// Generates the next ORD-#### id from the highest existing one (not a document count,
// which collides once any order is deleted — e.g. test orders removed in admin).
// Retries a few times to also cover two orders saving at the same instant.
orderSchema.pre('save', async function(next) {
  if (this.orderId) return next();
  const Order = mongoose.model('Order');
  for (let attempt = 0; attempt < 5; attempt++) {
    const last = await Order.findOne({ orderId: /^ORD-\d+$/ }).sort({ orderId: -1 }).lean();
    const lastNum = last ? parseInt(last.orderId.split('-')[1], 10) : 1000;
    const candidate = 'ORD-' + String(lastNum + 1).padStart(4, '0');
    const exists = await Order.findOne({ orderId: candidate }).lean();
    if (!exists) { this.orderId = candidate; break; }
  }
  if (!this.orderId) return next(new Error('Could not generate a unique order ID — please try again.'));
  next();
});

module.exports = mongoose.model('Order', orderSchema);
