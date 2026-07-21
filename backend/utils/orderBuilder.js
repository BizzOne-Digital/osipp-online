const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Settings = require('../models/Settings');

const r2 = (n) => Math.round(n * 100) / 100;

// ── Delivery pricing tiers ──
// Regular: 1 store, up to 4 standard 750 mL bottles.
// Multi-Stop/Medium: 2 stores; or 5+ 750 mL bottles / one 24-pack of beer.
// Alcohol+Convenience+Beer: 3-store orders with alcohol + convenience + two 24-packs of beer.
// Large/Heavy: 5+ bottles 1.14L+; or 3+ 24-packs of beer; or 8+ 12-packs of beer.
const DELIVERY_TIERS = {
  regular: { label: 'Regular Delivery', fee: 13 },
  multiStop: { label: 'Multi-Stop or Medium Order', fee: 18 },
  alcoholBeer: { label: 'Alcohol, Convenience and Beer-Store Order', fee: 22 },
  largeHeavy: { label: 'Large or Heavy Order', fee: 28 }
};

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

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) { const e = new Error('Product not found'); e.status = 404; throw e; }

    let unitPrice = product.price;
    let variantLabel = '';
    let volume = product.volume;
    const vIdx = item.variantIndex;
    if (vIdx !== undefined && vIdx !== null && vIdx !== '' && product.variants && product.variants[vIdx]) {
      const v = product.variants[vIdx];
      unitPrice = v.price;
      variantLabel = v.label;
      volume = v.label || product.volume;
      if (v.stock < item.quantity) { const e = new Error(`${product.name} (${v.label}) out of stock`); e.status = 400; throw e; }
      stockUpdates.push({ id: product._id, variantIndex: vIdx, qty: item.quantity });
    } else {
      if (product.stock < item.quantity) { const e = new Error(`${product.name} out of stock`); e.status = 400; throw e; }
      stockUpdates.push({ id: product._id, variantIndex: null, qty: item.quantity });
    }

    orderItems.push({ product: product._id, name: product.name, price: unitPrice, quantity: item.quantity, volume, variantLabel, store: product.store, category: product.category });
    subtotal += unitPrice * item.quantity;
    if (product.store) stores.add(product.store);
  }

  const orderAddOns = [];
  let addOnsTotal = 0;
  let hasTobacco = false;
  if (Array.isArray(addOns)) {
    for (const a of addOns) {
      const match = (settings.addOns || []).find(s => s.name === a.name && s.isActive);
      if (!match) continue;
      const qty = Math.max(1, parseInt(a.quantity) || 1);
      orderAddOns.push({ name: match.name, price: match.price, quantity: qty });
      addOnsTotal += match.price * qty;
      if (match.isTobacco) hasTobacco = true;
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
  let deliveryTier = null;
  if (subtotal > 0) {
    deliveryTier = classifyDeliveryTier(orderItems, stores.size);
    deliveryFee = DELIVERY_TIERS[deliveryTier].fee;
  }
  deliveryFee = r2(deliveryFee);
  const deliveryStops = [...stores].map(store => ({ store, fee: null }));

  let tipAmount = Math.max(0, parseFloat(tip) || 0);
  tipAmount = r2(tipAmount);

  const preFeeTotal = r2(Math.max(0, subtotal - discount + deliveryFee + tipAmount));

  // 3.2% processing surcharge on card/online payments only — folded into the
  // "Processing & Handling" total shown to the customer, not a separate line.
  let cardProcessingFee = 0;
  if (paymentMethod && ['card', 'stripe'].includes(paymentMethod)) {
    cardProcessingFee = r2(preFeeTotal * (settings.cardProcessingFeePercent || 0) / 100);
  }

  const total = r2(preFeeTotal + cardProcessingFee);

  return { orderItems, orderAddOns, subtotal, discount, couponApplied, couponDoc, deliveryStops, deliveryFee, deliveryTier: deliveryTier ? DELIVERY_TIERS[deliveryTier].label : '', tipAmount, cardProcessingFee, total, stockUpdates };
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
