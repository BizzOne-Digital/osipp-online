const router = require('express').Router();
const Stripe = require('stripe');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');
const { sendMail } = require('../utils/mailer');
const { buildOrderPayload, commitStock } = require('../utils/orderBuilder');

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// POST /api/orders - place order with optional coupon, add-ons, tip, stop-based delivery
router.post('/', async (req, res) => {
  try {
    const { customer, items, paymentMethod, notes, couponCode, addOns, tip, driverInstructions, deliveryTiming, scheduledDate, scheduledTime } = req.body;

    const payload = await buildOrderPayload({ customer, items, addOns, tip, couponCode, paymentMethod: paymentMethod || 'cash' });
    const { orderItems, orderAddOns, subtotal, discount, couponApplied, couponDoc, deliveryFee, deliveryTier, deliveryStops, tipAmount, handlingFee, total, stockUpdates } = payload;

    if (couponDoc) {
      couponDoc.usedCount += 1;
      if (req.user) couponDoc.usedBy.push(req.user._id);
      await couponDoc.save();
    }

    // All validation passed — commit stock changes
    await commitStock(stockUpdates);

    const order = await Order.create({
      customer, items: orderItems, addOns: orderAddOns, subtotal, discount, couponCode: couponApplied,
      deliveryFee, deliveryTier, deliveryStops, tip: tipAmount, handlingFee, total,
      paymentMethod: paymentMethod || 'cash', notes: notes || '',
      driverInstructions: driverInstructions || '',
      deliveryTiming: deliveryTiming === 'scheduled' ? 'scheduled' : 'asap',
      scheduledDate: scheduledDate || '', scheduledTime: scheduledTime || '',
      user: req.user ? req.user._id : null
    });

    // Awaited BEFORE responding — on Vercel/serverless, the function can be frozen the
    // instant the response is sent, which was killing the mailer's retry logic mid-flight
    // and silently dropping some notification emails.
    const itemsHtml = orderItems.map(i => `<li>${i.quantity} x ${i.name}${i.variantLabel ? ` (${i.variantLabel})` : ''} — $${(i.price * i.quantity).toFixed(2)}</li>`).join('');
    await sendMail(
      `New Order ${order.orderId} — $${total.toFixed(2)}`,
      `<h2>New Order Received</h2>
       <p><b>Order ID:</b> ${order.orderId}</p>
       <p><b>Customer:</b> ${customer.name} — ${customer.phone}${customer.email ? ` — ${customer.email}` : ''}</p>
       <p><b>Address:</b> ${customer.address || ''}, ${customer.city || ''} ${customer.postalCode || ''}</p>
       <p><b>Payment:</b> ${paymentMethod || 'cash'}</p>
       <p><b>Delivery timing:</b> ${deliveryTiming === 'scheduled' ? `Scheduled — ${scheduledDate || ''} ${scheduledTime || ''}` : 'ASAP'}</p>
       <ul>${itemsHtml}</ul>
       <p><b>Subtotal:</b> $${subtotal.toFixed(2)} | <b>Delivery (${deliveryTier}):</b> $${deliveryFee.toFixed(2)} | <b>Processing &amp; Handling:</b> $${handlingFee.toFixed(2)} | <b>Tip:</b> $${tipAmount.toFixed(2)} | <b>Total:</b> $${total.toFixed(2)}</p>
       ${notes ? `<p><b>Notes:</b> ${notes}</p>` : ''}
       ${driverInstructions ? `<p><b>Driver instructions:</b> ${driverInstructions}</p>` : ''}`
    );

    res.status(201).json({ success: true, data: order });
  } catch (err) { console.error('[ORDERS] POST / failed:', err.message, err.stack); res.status(err.status || 500).json({ success: false, message: err.message }); }
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
  } catch (err) { console.error('[ORDERS] request failed:', err.message, err.stack); res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/orders/track/:orderId - self-heals if the Stripe webhook hasn't landed yet by
// checking Stripe directly and sending the "Payment Confirmed" email right here if needed.
router.get('/track/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId.toUpperCase() });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.paymentMethod === 'stripe' && order.paymentStatus === 'pending' && order.stripeSessionId && stripe) {
      try {
        const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
        if (session.payment_status === 'paid' || session.status === 'complete') {
          order.paymentStatus = 'paid';
          order.stripePaymentIntentId = session.payment_intent || '';
          await order.save();
          console.log(`[ORDERS] Order ${order.orderId} marked paid (self-heal via track)`);
          await sendMail(
            `Payment Received — Order ${order.orderId}`,
            `<h2>Stripe Payment Confirmed</h2><p><b>Order ID:</b> ${order.orderId}</p><p><b>Total:</b> $${order.total.toFixed(2)}</p>`
          );
        }
      } catch (stripeErr) {
        console.error(`[ORDERS] Stripe session check failed for ${order.orderId}:`, stripeErr.message);
      }
    }

    res.json({ success: true, data: order });
  } catch (err) { console.error('[ORDERS] request failed:', err.message, err.stack); res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/orders/:id - admin
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: order });
  } catch (err) { console.error('[ORDERS] request failed:', err.message, err.stack); res.status(500).json({ success: false, message: err.message }); }
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
  } catch (err) { console.error('[ORDERS] request failed:', err.message, err.stack); res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try { await Order.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { console.error('[ORDERS] request failed:', err.message, err.stack); res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
