const mongoose = require('mongoose');

// Captures the new non-alcohol services requested by the client:
//  - grocery pickup & delivery (household / seniors, one-time or monthly)
//  - monthly plan membership sign-ups
//  - gift requests (flowers, cards, etc.)
const serviceRequestSchema = new mongoose.Schema({
  requestId: { type: String, unique: true },
  kind: { type: String, enum: ['grocery', 'membership', 'gift'], required: true },

  // grocery-specific
  groceryType: { type: String, enum: ['household', 'seniors', ''], default: '' },
  plan: { type: String, enum: ['one-time', 'monthly', ''], default: '' },
  isMember: { type: Boolean, default: false },
  frequency: { type: String, default: '' }, // weekly / bi-weekly / monthly (for plans)

  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    unitBuzzer: { type: String, default: '' },
    city: { type: String, default: 'Mississauga' },
    postalCode: { type: String, default: '' }
  },

  // Pickup/delivery request details
  orderNumber: { type: String, default: '' },
  storeName: { type: String, default: '' },
  storeAddress: { type: String, default: '' },
  deliveryTiming: { type: String, enum: ['asap', 'scheduled'], default: 'asap' },
  preferredTime: { type: String, default: '' },

  items: { type: String, default: '' },        // grocery / shopping list
  giftDetails: { type: String, default: '' },  // gift request text
  preferredDate: { type: String, default: '' },
  notes: { type: String, default: '' },

  // Seniors monthly plan payment (Resident Essentials/Premium/Concierge, Assisted Ordering add-on)
  planCode: { type: String, default: '', enum: ['', 'essentials', 'premium', 'concierge', 'assisted-addon'] },
  planName: { type: String, default: '' },
  planPrice: { type: Number, default: 0 },
  // 'auto-renew' = Stripe subscription that bills automatically every month.
  // 'manual' = customer pays one month at a time, no auto-renewal.
  billingType: { type: String, default: '', enum: ['', 'auto-renew', 'manual'] },
  paymentStatus: { type: String, default: 'pending', enum: ['pending', 'paid', 'failed', 'cancelled', 'not_required'] },
  stripeCustomerId: { type: String, default: '' },
  stripeSubscriptionId: { type: String, default: '' },
  stripeSessionId: { type: String, default: '' },
  subscriptionStatus: { type: String, default: '', enum: ['', 'active', 'past_due', 'canceled', 'incomplete'] },

  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'], default: 'pending' }
}, { timestamps: true });

// Generates the next id from the highest existing one (not a document count, which
// collides once any request is deleted) — same fix as Order.js, with a retry for races.
serviceRequestSchema.pre('save', async function (next) {
  if (this.requestId) return next();
  const prefix = this.kind === 'gift' ? 'GFT' : this.kind === 'membership' ? 'MEM' : 'GRO';
  const Model = mongoose.model('ServiceRequest');
  for (let attempt = 0; attempt < 5; attempt++) {
    const last = await Model.findOne({ requestId: new RegExp(`^${prefix}-\\d+$`) }).sort({ requestId: -1 }).lean();
    const lastNum = last ? parseInt(last.requestId.split('-')[1], 10) : 1000;
    const candidate = prefix + '-' + String(lastNum + 1).padStart(4, '0');
    const exists = await Model.findOne({ requestId: candidate }).lean();
    if (!exists) { this.requestId = candidate; break; }
  }
  if (!this.requestId) return next(new Error('Could not generate a unique request ID — please try again.'));
  next();
});

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
