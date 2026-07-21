const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  businessName: { type: String, default: "O'SIPP Delivery" },
  phone: { type: String, default: '905-462-2160' },
  email: { type: String, default: 'osippdelivery741@gmail.com' },
  whatsapp: { type: String, default: '+1 905 462 2160' },
  instagram: { type: String, default: 'https://www.instagram.com/osipp_delivery' },
  address: { type: String, default: 'Mississauga, ON' },
  deliveryLocations: {
    type: [String],
    default: ['Mississauga', 'Brampton', 'Oakville', 'Burlington', 'Milton', 'Toronto (GTA)']
  },
  deliveryRadius: { type: String, default: 'Mississauga & GTA' },
  minOrder: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 13 }, // legacy flat fee / fallback
  // Per-store delivery fee. Total delivery = sum of the fees for every distinct
  // store the customer orders from (multiple stops = higher fee).
  storeDeliveryFees: {
    'Liquor Store': { type: Number, default: 13 },
    'Beer Store': { type: Number, default: 8 },
    'Convenience Store': { type: Number, default: 6 }
  },
  // When true, delivery is charged per-stop using storeDeliveryFees.
  // When false, the flat deliveryFee is used.
  useStopBasedDelivery: { type: Boolean, default: true },
  // Extra add-on items the customer can add at checkout (e.g. pack of smokes).
  addOns: {
    type: [{
      name: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
      isActive: { type: Boolean, default: true },
      // Tobacco/smoke items can't be returned once purchased — these require advance
      // (card/online) payment only; cash on delivery is blocked for these.
      isTobacco: { type: Boolean, default: false }
    }],
    default: [
      { name: 'Pack of Cigarettes', price: 20, isActive: true, isTobacco: true },
      { name: 'Lighter', price: 3, isActive: true, isTobacco: false },
      { name: 'Bag of Ice', price: 5, isActive: true, isTobacco: false }
    ]
  },
  // Card/tap processing surcharge — folded into "Processing & Handling" display,
  // not shown as a separate line. Not charged on cash or e-transfer orders.
  cardProcessingFeePercent: { type: Number, default: 3.2 },
  // Driver tip settings.
  tipEnabled: { type: Boolean, default: true },
  tipPresets: { type: [Number], default: [3, 5, 10] },
  deliveryFeeNote: { type: String, default: 'Taxes included' },
  deliveryTime: { type: String, default: '1 hour' },
  ageRequirement: { type: String, default: '19+ ID required at delivery' },
  deliveryHours: {
    monThu: { type: String, default: '11am – 11pm' },
    friSat: { type: String, default: '11am – 1am' },
    sunday: { type: String, default: '12pm – 10pm' }
  },
  isOpen: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
