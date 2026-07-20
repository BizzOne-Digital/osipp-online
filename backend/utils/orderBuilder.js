const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Settings = require('../models/Settings');

const r2 = (n) => Math.round(n * 100) / 100;

// Shared pricing/validation logic used by both the direct order route (cash/interac/card)
// and the Stripe checkout route — keeps stock checks and price resolution in one place.
async function buildOrderPayload({ customer, items, addOns, tip, couponCode }) {
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

    orderItems.push({ product: product._id, name: product.name, price: unitPrice, quantity: item.quantity, volume, variantLabel, store: product.store });
    subtotal += unitPrice * item.quantity;
    if (product.store) stores.add(product.store);
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
    }
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

  const deliveryStops = [];
  let deliveryFee = 0;
  if (subtotal > 0) {
    const feeMap = settings.storeDeliveryFees || {};
    if (settings.useStopBasedDelivery) {
      for (const store of stores) {
        const fee = feeMap[store] != null ? feeMap[store] : settings.deliveryFee;
        deliveryStops.push({ store, fee });
        deliveryFee += fee;
      }
    } else {
      deliveryFee = settings.deliveryFee;
    }
  }
  deliveryFee = r2(deliveryFee);

  let tipAmount = Math.max(0, parseFloat(tip) || 0);
  tipAmount = r2(tipAmount);

  const total = r2(Math.max(0, subtotal - discount + deliveryFee + tipAmount));

  return { orderItems, orderAddOns, subtotal, discount, couponApplied, couponDoc, deliveryStops, deliveryFee, tipAmount, total, stockUpdates };
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

module.exports = { buildOrderPayload, commitStock, r2 };
