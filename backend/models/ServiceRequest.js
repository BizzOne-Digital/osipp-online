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

  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'], default: 'pending' }
}, { timestamps: true });

serviceRequestSchema.pre('save', async function (next) {
  if (!this.requestId) {
    const prefix = this.kind === 'gift' ? 'GFT' : this.kind === 'membership' ? 'MEM' : 'GRO';
    const count = await mongoose.model('ServiceRequest').countDocuments({ kind: this.kind });
    this.requestId = prefix + '-' + String(1000 + count + 1).padStart(4, '0');
  }
  next();
});

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
