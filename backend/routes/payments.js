const router = require('express').Router();
const Stripe = require('stripe');
const Order = require('../models/Order');
const { buildOrderPayload, commitStock } = require('../utils/orderBuilder');
const { sendMail } = require('../utils/mailer');

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// POST /api/payments/create-checkout-session
// Builds the order the same way /api/orders does, saves it as pending, then hands off to Stripe Checkout.
router.post('/create-checkout-session', async (req, res) => {
  if (!stripe) return res.status(500).json({ success: false, message: 'Stripe is not configured on the server' });
  try {
    const { customer, items, notes, couponCode, addOns, tip, driverInstructions, deliveryTiming, scheduledDate, scheduledTime } = req.body;
    const payload = await buildOrderPayload({ customer, items, addOns, tip, couponCode, paymentMethod: 'stripe' });
    const { orderItems, orderAddOns, subtotal, discount, couponApplied, couponDoc, deliveryFee, deliveryTier, deliveryStops, tipAmount, handlingFee, total, stockUpdates } = payload;

    if (couponDoc) {
      couponDoc.usedCount += 1;
      if (req.user) couponDoc.usedBy.push(req.user._id);
      await couponDoc.save();
    }
    await commitStock(stockUpdates);

    const order = await Order.create({
      customer, items: orderItems, addOns: orderAddOns, subtotal, discount, couponCode: couponApplied,
      deliveryFee, deliveryTier, deliveryStops, tip: tipAmount, handlingFee, total,
      paymentMethod: 'stripe', paymentStatus: 'pending',
      notes: notes || '', driverInstructions: driverInstructions || '',
      deliveryTiming: deliveryTiming === 'scheduled' ? 'scheduled' : 'asap',
      scheduledDate: scheduledDate || '', scheduledTime: scheduledTime || '',
      user: req.user ? req.user._id : null
    });

    // Notify the team as soon as the order is placed — don't rely solely on the Stripe
    // webhook (which can silently fail to arrive if it isn't registered/reachable).
    // The webhook below sends a second "Payment Confirmed" email once payment clears.
    const itemsHtml = orderItems.map(i => `<li>${i.quantity} x ${i.name}${i.variantLabel ? ` (${i.variantLabel})` : ''} — $${(i.price * i.quantity).toFixed(2)}</li>`).join('');
    sendMail(
      `New Order ${order.orderId} — $${total.toFixed(2)} (Stripe — awaiting payment)`,
      `<h2>New Order Received (Stripe Checkout)</h2>
       <p><b>Order ID:</b> ${order.orderId}</p>
       <p><b>Customer:</b> ${customer.name} — ${customer.phone}${customer.email ? ` — ${customer.email}` : ''}</p>
       <p><b>Address:</b> ${customer.address || ''}, ${customer.city || ''} ${customer.postalCode || ''}</p>
       <ul>${itemsHtml}</ul>
       <p><b>Subtotal:</b> $${subtotal.toFixed(2)} | <b>Delivery (${deliveryTier}):</b> $${deliveryFee.toFixed(2)} | <b>Processing &amp; Handling:</b> $${handlingFee.toFixed(2)} | <b>Tip:</b> $${tipAmount.toFixed(2)} | <b>Total:</b> $${total.toFixed(2)}</p>
       ${notes ? `<p><b>Notes:</b> ${notes}</p>` : ''}
       ${driverInstructions ? `<p><b>Driver instructions:</b> ${driverInstructions}</p>` : ''}
       <p><i>Payment confirmation will follow once the customer completes Stripe Checkout.</i></p>`
    );

    // Single line item for the full total — avoids per-item rounding/negative-discount issues with Stripe.
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: customer.email || undefined,
      line_items: [{
        price_data: {
          currency: 'cad',
          product_data: {
            name: `O'SIPP Order ${order.orderId}`,
            description: orderItems.map(i => `${i.quantity}x ${i.name}`).join(', ').slice(0, 500)
          },
          unit_amount: Math.round(total * 100)
        },
        quantity: 1
      }],
      success_url: `${FRONTEND_URL}/order-success?orderId=${order.orderId}`,
      cancel_url: `${FRONTEND_URL}/?cancelled=1`,
      metadata: { orderId: order._id.toString() }
    });

    order.stripeSessionId = session.id;
    await order.save();

    res.json({ success: true, url: session.url });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// POST /api/payments/webhook — mounted with express.raw() in server.js so the signature can be verified.
router.post('/webhook', async (req, res) => {
  if (!stripe) return res.status(500).send('Stripe is not configured');
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[STRIPE] Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const session = event.data.object;

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const order = await Order.findOne({ stripeSessionId: session.id });
    if (order && order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      order.stripePaymentIntentId = session.payment_intent || '';
      await order.save();
      sendMail(
        `Payment Received — Order ${order.orderId}`,
        `<h2>Stripe Payment Confirmed</h2><p><b>Order ID:</b> ${order.orderId}</p><p><b>Total:</b> $${order.total.toFixed(2)}</p>`
      );
    }
  } else if (event.type === 'checkout.session.async_payment_failed' || event.type === 'checkout.session.expired') {
    await Order.findOneAndUpdate({ stripeSessionId: session.id }, { paymentStatus: 'failed' });
  }

  res.json({ received: true });
});

module.exports = router;
