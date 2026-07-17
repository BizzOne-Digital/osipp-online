const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Settings = require('../models/Settings');
const { protect, adminOnly } = require('../middleware/auth');
const { sendMail } = require('../utils/mailer');

const r2 = (n) => Math.round(n * 100) / 100;

// POST /api/orders - place order with optional coupon, add-ons, tip, stop-based delivery
router.post('/', async (req, res) => {
  try {
    const { customer, items, paymentMethod, notes, couponCode, addOns, tip, driverInstructions } = req.body;
    if (!customer || !items || items.length === 0) return res.status(400).json({ success: false, message: 'Customer info and items required' });

    // Load settings once (used for delivery fees, tip, and add-on pricing)
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});

    let subtotal = 0;
    const orderItems = [];
    const stores = new Set();          // distinct stores => delivery stops
    const stockUpdates = [];           // apply only after all validation passes

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ success: false, message: `Product not found` });

      // Resolve variant (size) if selected — price/label/stock come from the server, not the client.
      let unitPrice = product.price;
      let variantLabel = '';
      let volume = product.volume;
      const vIdx = item.variantIndex;
      if (vIdx !== undefined && vIdx !== null && vIdx !== '' && product.variants && product.variants[vIdx]) {
        const v = product.variants[vIdx];
        unitPrice = v.price;
        variantLabel = v.label;
        volume = v.label || product.volume;
        if (v.stock < item.quantity) return res.status(400).json({ success: false, message: `${product.name} (${v.label}) out of stock` });
        stockUpdates.push({ id: product._id, variantIndex: vIdx, qty: item.quantity });
      } else {
        if (product.stock < item.quantity) return res.status(400).json({ success: false, message: `${product.name} out of stock` });
        stockUpdates.push({ id: product._id, variantIndex: null, qty: item.quantity });
      }

      orderItems.push({ product: product._id, name: product.name, price: unitPrice, quantity: item.quantity, volume, variantLabel, store: product.store });
      subtotal += unitPrice * item.quantity;
      if (product.store) stores.add(product.store);
    }

    // Validate add-ons against admin-configured list (price is taken from settings, not the client)
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

    // Apply coupon
    let discount = 0;
    let couponApplied = '';
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && subtotal >= coupon.minOrder) {
        discount = coupon.type === 'percentage' ? (subtotal * coupon.value / 100) : coupon.value;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
        discount = r2(discount);
        coupon.usedCount += 1;
        if (req.user) coupon.usedBy.push(req.user._id);
        await coupon.save();
        couponApplied = coupon.code;
      }
    }

    // Delivery fee: per-stop (sum of each distinct store's fee) or flat fallback
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

    // Driver tip
    let tipAmount = Math.max(0, parseFloat(tip) || 0);
    tipAmount = r2(tipAmount);

    const total = r2(Math.max(0, subtotal - discount + deliveryFee + tipAmount));

    // All validation passed — commit stock changes
    for (const u of stockUpdates) {
      if (u.variantIndex !== null) {
        await Product.findByIdAndUpdate(u.id, { $inc: { [`variants.${u.variantIndex}.stock`]: -u.qty } });
      } else {
        await Product.findByIdAndUpdate(u.id, { $inc: { stock: -u.qty } });
      }
    }

    const order = await Order.create({
      customer, items: orderItems, addOns: orderAddOns, subtotal, discount, couponCode: couponApplied,
      deliveryFee, deliveryStops, tip: tipAmount, total,
      paymentMethod: paymentMethod || 'cash', notes: notes || '',
      driverInstructions: driverInstructions || '',
      user: req.user ? req.user._id : null
    });

    res.status(201).json({ success: true, data: order });

    const itemsHtml = orderItems.map(i => `<li>${i.quantity} x ${i.name}${i.variantLabel ? ` (${i.variantLabel})` : ''} — $${(i.price * i.quantity).toFixed(2)}</li>`).join('');
    sendMail(
      `New Order ${order.orderId} — $${total.toFixed(2)}`,
      `<h2>New Order Received</h2>
       <p><b>Order ID:</b> ${order.orderId}</p>
       <p><b>Customer:</b> ${customer.name} — ${customer.phone}${customer.email ? ` — ${customer.email}` : ''}</p>
       <p><b>Address:</b> ${customer.address || ''}, ${customer.city || ''} ${customer.postalCode || ''}</p>
       <p><b>Payment:</b> ${paymentMethod || 'cash'}</p>
       <ul>${itemsHtml}</ul>
       <p><b>Subtotal:</b> $${subtotal.toFixed(2)} | <b>Delivery:</b> $${deliveryFee.toFixed(2)} | <b>Tip:</b> $${tipAmount.toFixed(2)} | <b>Total:</b> $${total.toFixed(2)}</p>
       ${notes ? `<p><b>Notes:</b> ${notes}</p>` : ''}
       ${driverInstructions ? `<p><b>Driver instructions:</b> ${driverInstructions}</p>` : ''}`
    );
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/orders - admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const orders = await Order.find(filter).sort(sort).skip(skip).limit(parseInt(limit));
    const total = await Order.countDocuments(filter);
    res.json({ success: true, data: orders, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/orders/track/:orderId
router.get('/track/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId.toUpperCase() });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/orders/:id - admin
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/orders/:id/status
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const update = { status };
    if (status === 'delivered') update.deliveredAt = new Date();
    if (status === 'cancelled') {
      update.cancelledAt = new Date();
      update.cancelReason = req.body.reason || '';
      const order = await Order.findById(req.params.id);
      if (order) for (const item of order.items) {
        if (item.variantLabel) {
          const product = await Product.findById(item.product);
          const idx = product ? (product.variants || []).findIndex(v => v.label === item.variantLabel) : -1;
          if (idx > -1) await Product.findByIdAndUpdate(item.product, { $inc: { [`variants.${idx}.stock`]: item.quantity } });
          else await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        } else {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        }
      }
    }
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, data: order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try { await Order.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
