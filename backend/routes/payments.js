const router = require('express').Router();
const Stripe = require('stripe');
const Order = require('../models/Order');
const ServiceRequest = require('../models/ServiceRequest');
const { buildOrderPayload, commitStock } = require('../utils/orderBuilder');
const { sendMail } = require('../utils/mailer');
const { markServicePlanPaid } = require('../utils/servicePlanFulfillment');

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
      const phone = String(customer.phone || '').replace(/\D/g, '');
      if (phone) couponDoc.usedByPhone.push(phone);
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
    await sendMail(
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
    console.error('[PAYMENTS] create-checkout-session failed:', err.message, err.stack);
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

  console.log(`[STRIPE] Webhook received: ${event.type}`);

  try {
    const obj = event.data.object;

    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const isServicePlan = obj.metadata && obj.metadata.type === 'service-plan';

      if (isServicePlan) {
        const request = await ServiceRequest.findOne({ stripeSessionId: obj.id });
        if (!request) {
          console.error(`[STRIPE] Webhook ${event.type}: no service request found for session ${obj.id}`);
        } else {
          await markServicePlanPaid(request, { customerId: obj.customer, subscriptionId: obj.subscription });
        }
      } else {
        const order = await Order.findOne({ stripeSessionId: obj.id });
        if (!order) {
          console.error(`[STRIPE] Webhook ${event.type}: no order found for session ${obj.id}`);
        } else if (order.paymentStatus !== 'paid') {
          order.paymentStatus = 'paid';
          order.stripePaymentIntentId = obj.payment_intent || '';
          await order.save();
          console.log(`[STRIPE] Order ${order.orderId} marked paid`);
          await sendMail(
            `Payment Received — Order ${order.orderId}`,
            `<h2>Stripe Payment Confirmed</h2><p><b>Order ID:</b> ${order.orderId}</p><p><b>Total:</b> $${order.total.toFixed(2)}</p>`
          );
        }
      }
    } else if (event.type === 'checkout.session.async_payment_failed' || event.type === 'checkout.session.expired') {
      await Order.findOneAndUpdate({ stripeSessionId: obj.id }, { paymentStatus: 'failed' });
      await ServiceRequest.findOneAndUpdate({ stripeSessionId: obj.id }, { paymentStatus: 'failed' });
      console.log(`[STRIPE] Session ${obj.id} marked failed (${event.type})`);
    } else if (event.type === 'invoice.paid' && obj.subscription) {
      // A recurring monthly charge succeeded for an auto-renew plan.
      const request = await ServiceRequest.findOne({ stripeSubscriptionId: obj.subscription });
      if (request) {
        request.subscriptionStatus = 'active';
        request.paymentStatus = 'paid';
        await request.save();
        console.log(`[STRIPE] Subscription renewal paid for ${request.requestId}`);
        await sendMail(
          `Monthly Plan Renewed — ${request.requestId}`,
          `<h2>Auto-Renew Payment Received</h2><p><b>Request ID:</b> ${request.requestId}</p><p><b>Plan:</b> ${request.planName} — $${request.planPrice}/month</p>`
        );
      }
    } else if (event.type === 'invoice.payment_failed' && obj.subscription) {
      await ServiceRequest.findOneAndUpdate({ stripeSubscriptionId: obj.subscription }, { subscriptionStatus: 'past_due' });
      console.log(`[STRIPE] Subscription payment failed: ${obj.subscription}`);
    } else if (event.type === 'customer.subscription.deleted') {
      await ServiceRequest.findOneAndUpdate({ stripeSubscriptionId: obj.id }, { subscriptionStatus: 'canceled' });
      console.log(`[STRIPE] Subscription canceled: ${obj.id}`);
    } else if (event.type === 'customer.subscription.updated') {
      await ServiceRequest.findOneAndUpdate({ stripeSubscriptionId: obj.id }, { subscriptionStatus: obj.status });
    }

    res.json({ received: true });
  } catch (err) {
    console.error('[STRIPE] Webhook processing failed:', err.message, err.stack);
    res.status(500).json({ received: false, error: err.message });
  }
});

module.exports = router;
