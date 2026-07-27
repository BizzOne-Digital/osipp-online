const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Settings = require('../models/Settings');

const r2 = (n) => Math.round(n * 100) / 100;

// ── Delivery pricing tiers ──
// Regular: 1 store, up to 4 standard 750 mL bottles.
// Multi-Stop/Medium: 2 stores; or 5+ 750 mL bottles / one 24-pack of beer.
// Alcohol+Convenience+Beer: 3-store orders with alcohol + convenience + two 24-packs of beer.
// Large/Heavy: 5+ bottles 1.14L+; or 3+ 24-packs of beer; or 8+ 12-packs of beer.
// Each tier splits into a "Delivery" component and a "Processing & Handling" component,
// shown to the customer as two separate lines (not one flat fee).
const DELIVERY_TIERS = {
  regular: { label: 'Regular Delivery', delivery: 4.99, handling: 7.99 },
  multiStop: { label: 'Multi-Stop or Medium Order', delivery: 6.99, handling: 10.99 },
  alcoholBeer: { label: 'Alcohol, Convenience and Beer-Store Order', delivery: 8.99, handling: 12.99 },
  largeHeavy: { label: 'Large or Heavy Order', delivery: 11.99, handling: 15.99 }
};

// Safety net for smoke/tobacco detection: catches products/add-ons by name even if the
// admin forgot to tick the "Tobacco" checkbox on that specific item.
const TOBACCO_KEYWORDS = /cigarette|cigar\b|tobacco|\bsmoke(s)?\b|vape|vaping|e-?cig/i;
const looksLikeTobacco = (name, category, subCategory) =>
  TOBACCO_KEYWORDS.test(name || '') || TOBACCO_KEYWORDS.test(category || '') || TOBACCO_KEYWORDS.test(subCategory || '');

// Parses a free-text volume/variant label (e.g. "1.75 L Bottle", "24 Pack", "750 mL")
// into approximate liters, so we can bucket items into the delivery-fee tiers above.
function parseLiters(label) {
  if (!label) return 0;
  const m = String(label).match(/([\d.]+)\s*(ml|l)\b/i);
  if (!m) return 0;
  const val = parseFloat(m[1]);
  return m[2].toLowerCase() === 'l' ? val : val / 1000;
}

function classifyDeliveryTier(orderItems, storeCount) {
  let bottle750Count = 0, largeBottleCount = 0, beer24Count = 0, beer12Count = 0;

  for (const item of orderItems) {
    const label = (item.variantLabel || item.volume || '').toLowerCase();
    if (item.category === 'Beer' || /beer/i.test(item.store || '')) {
      if (/24/.test(label)) beer24Count += item.quantity;
      else if (/12/.test(label)) beer12Count += item.quantity;
      continue;
    }
    const liters = parseLiters(label);
    if (liters >= 1.14) largeBottleCount += item.quantity;
    else bottle750Count += item.quantity;
  }

  if (largeBottleCount >= 5 || beer24Count >= 3 || beer12Count >= 8) return 'largeHeavy';
  if (storeCount >= 3) return 'alcoholBeer';
  if (storeCount >= 2 || bottle750Count >= 5 || beer24Count >= 1) return 'multiStop';
  return 'regular';
}

// Shared pricing/validation logic used by both the direct order route (cash/interac/card)
// and the Stripe checkout route — keeps stock checks and price resolution in one place.
async function buildOrderPayload({ customer, items, addOns, tip, couponCode, paymentMethod }) {
  if (!customer || !items || items.length === 0) {
    const e = new Error('Customer info and items required'); e.status = 400; throw e;
  }

  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});

  let subtotal = 0;
  const orderItems = [];
  const stores = new Set();
  const stockUpdates = [];
  let hasTobacco = false;

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) { const e = new Error('Product not found'); e.status = 404; throw e; }
    if (product.isTobacco || looksLikeTobacco(product.name, product.category, product.subCategory)) hasTobacco = true;

    let unitPrice = product.price;
    let variantLabel = '';
    let volume = product.volume;
    let itemStore = product.store;
    const vIdx = item.variantIndex;
    if (vIdx !== undefined && vIdx !== null && vIdx !== '' && product.variants && product.variants[vIdx]) {
      const v = product.variants[vIdx];
      unitPrice = v.price;
      variantLabel = v.label;
      volume = v.label || product.volume;
      // A size can be picked up from a different store than the product's default
      // (e.g. a 24-pack sourced from the Beer Store while other sizes ship from Liquor Store).
      if (v.store) itemStore = v.store;
      if (v.stock < item.quantity) { const e = new Error(`${product.name} (${v.label}) out of stock`); e.status = 400; throw e; }
      stockUpdates.push({ id: product._id, variantIndex: vIdx, qty: item.quantity });
    } else {
      if (product.stock < item.quantity) { const e = new Error(`${product.name} out of stock`); e.status = 400; throw e; }
      stockUpdates.push({ id: product._id, variantIndex: null, qty: item.quantity });
    }

    orderItems.push({ product: product._id, name: product.name, price: unitPrice, quantity: item.quantity, volume, variantLabel, store: itemStore, category: product.category });
    subtotal += unitPrice * item.quantity;
    if (itemStore) stores.add(itemStore);
  }

  const orderAddOns = [];
  let addOnsTotal = 0;
  if (Array.isArray(addOns)) {
    for (const a of addOns) {
      const match = (settings.addOns || []).find(s => s.name === a.name && s.isActive);
      if (!match) continue;
      const qty = Math.max(1, parseInt(a.quantity) || 1);
      orderAddOns.push({ name: match.name, price: match.price, quantity: qty });
      addOnsTotal += match.price * qty;
      if (match.isTobacco || looksLikeTobacco(match.name)) hasTobacco = true;
    }
  }

  // Smoke/tobacco items can't be returned once purchased — no cash on delivery.
  // Customer must pay in advance (card/online payment).
  if (hasTobacco && paymentMethod && !['card', 'stripe'].includes(paymentMethod)) {
    const e = new Error('Tobacco/smoke orders require advance payment by card — cash is not accepted for these orders'); e.status = 400; throw e;
  }

  subtotal = r2(subtotal + addOnsTotal);

  let discount = 0;
  let couponApplied = '';
  let couponDoc = null;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (coupon && subtotal >= coupon.minOrder) {
      discount = coupon.type === 'percentage' ? (subtotal * coupon.value / 100) : coupon.value;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
      discount = r2(discount);
      couponApplied = coupon.code;
      couponDoc = coupon;
    }
  }

  let deliveryFee = 0;
  let handlingFee = 0;
  let deliveryTier = null;
  if (subtotal > 0) {
    deliveryTier = classifyDeliveryTier(orderItems, stores.size);
    deliveryFee = DELIVERY_TIERS[deliveryTier].delivery;
    handlingFee = DELIVERY_TIERS[deliveryTier].handling;
  }
  deliveryFee = r2(deliveryFee);
  const deliveryStops = [...stores].map(store => ({ store, fee: null }));

  let tipAmount = Math.max(0, parseFloat(tip) || 0);
  tipAmount = r2(tipAmount);

  // 3.2% processing surcharge on card/online/tap payments only — folded directly into
  // the "Processing & Handling" number shown to the customer (no separate line).
  // No fee on cash or e-transfer.
  if (paymentMethod && ['card', 'stripe'].includes(paymentMethod)) {
    const preFeeSubtotal = r2(Math.max(0, subtotal - discount + deliveryFee + handlingFee + tipAmount));
    const cardFee = r2(preFeeSubtotal * (settings.cardProcessingFeePercent || 0) / 100);
    handlingFee = r2(handlingFee + cardFee);
  }

  const total = r2(Math.max(0, subtotal - discount + deliveryFee + handlingFee + tipAmount));

  return { orderItems, orderAddOns, subtotal, discount, couponApplied, couponDoc, deliveryStops, deliveryFee, handlingFee, deliveryTier: deliveryTier ? DELIVERY_TIERS[deliveryTier].label : '', tipAmount, total, stockUpdates };
}

async function commitStock(stockUpdates) {
  for (const u of stockUpdates) {
    if (u.variantIndex !== null) {
      await Product.findByIdAndUpdate(u.id, { $inc: { [`variants.${u.variantIndex}.stock`]: -u.qty } });
    } else {
      await Product.findByIdAndUpdate(u.id, { $inc: { stock: -u.qty } });
    }
  }
}

module.exports = { buildOrderPayload, commitStock, r2, DELIVERY_TIERS, classifyDeliveryTier };
