const router = require('express').Router();
const Stripe = require('stripe');
const ServiceRequest = require('../models/ServiceRequest');
const { protect, adminOnly } = require('../middleware/auth');
const { sendMail } = require('../utils/mailer');
const { markServicePlanPaid } = require('../utils/servicePlanFulfillment');

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Server-side source of truth for plan pricing — never trust a price sent from the client.
const SENIORS_PLANS = {
  essentials: { name: 'Resident Essentials', price: 99 },
  premium: { name: 'Resident Premium', price: 139 },
  concierge: { name: 'Retirement Concierge', price: 249 },
  'assisted-addon': { name: 'Assisted Ordering Add-On', price: 49 }
};

// Server-side source of truth for one-time service fees.
const ONE_TIME_FEES = {
  'grocery-one-time': { name: 'One-Time Grocery Pickup & Delivery', price: 19.99, kind: 'grocery' },
  'gift': { name: 'Gift Delivery', price: 13.99, kind: 'gift' }
};

// POST /api/services/checkout - public: pay for a one-time grocery pickup or a gift delivery.
router.post('/checkout', async (req, res) => {
  if (!stripe) return res.status(500).json({ success: false, message: 'Stripe is not configured on the server' });
  try {
    const { serviceType, customer, groceryType, items, giftDetails, orderNumber, storeName, storeAddress, deliveryTiming, preferredDate, preferredTime, notes } = req.body;
    const fee = ONE_TIME_FEES[serviceType];
    if (!fee) return res.status(400).json({ success: false, message: 'Invalid service type' });
    if (!customer || !customer.name || !customer.phone) return res.status(400).json({ success: false, message: 'Name and phone are required' });

    const request = await ServiceRequest.create({
      kind: fee.kind,
      groceryType: groceryType || '', plan: fee.kind === 'grocery' ? 'one-time' : '',
      planName: fee.name, planPrice: fee.price, paymentStatus: 'pending',
      customer, orderNumber: orderNumber || '', storeName: storeName || '', storeAddress: storeAddress || '',
      items: items || '', giftDetails: giftDetails || '',
      deliveryTiming: deliveryTiming || 'asap', preferredDate: preferredDate || '', preferredTime: preferredTime || '',
      notes: notes || '',
      user: req.user ? req.user._id : null
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: customer.email || undefined,
      line_items: [{
        price_data: {
          currency: 'cad',
          product_data: { name: `O'SIPP — ${fee.name}` },
          unit_amount: Math.round(fee.price * 100)
        },
        quantity: 1
      }],
      success_url: `${FRONTEND_URL}/order-success?requestId=${request.requestId}`,
      cancel_url: `${FRONTEND_URL}/${fee.kind === 'gift' ? 'gifts' : 'grocery'}?cancelled=1`,
      metadata: { type: 'service-plan', requestId: request._id.toString() }
    });

    request.stripeSessionId = session.id;
    await request.save();

    await sendMail(
      `New ${fee.name} Request — ${customer.name} (awaiting payment)`,
      `<h2>New ${fee.name} Request</h2>
       <p><b>Request ID:</b> ${request.requestId}</p>
       <p><b>Fee:</b> $${fee.price}</p>
       <p><b>Name:</b> ${customer.name} — ${customer.phone}${customer.email ? ` — ${customer.email}` : ''}</p>
       ${customer.address ? `<p><b>Address:</b> ${customer.address}${customer.unitBuzzer ? ` (Unit/Buzzer: ${customer.unitBuzzer})` : ''}, ${customer.city || ''} ${customer.postalCode || ''}</p>` : ''}
       ${items ? `<p><b>List:</b> ${items}</p>` : ''}
       ${giftDetails ? `<p><b>Gift:</b> ${giftDetails}</p>` : ''}
       ${notes ? `<p><b>Notes:</b> ${notes}</p>` : ''}
       <p><i>Payment confirmation will follow once checkout is completed.</i></p>`
    );

    res.json({ success: true, url: session.url });
  } catch (err) {
    console.error('[SERVICES] checkout failed:', err.message, err.stack);
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// POST /api/services - public: submit a grocery / membership / gift request
router.post('/', async (req, res) => {
  try {
    const { kind, customer } = req.body;
    if (!kind || !customer || !customer.name || !customer.phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required' });
    }
    const data = { ...req.body };
    if (req.user) data.user = req.user._id;
    const request = await ServiceRequest.create(data);

    // Awaited BEFORE responding — on serverless (Vercel), the function can be frozen the
    // instant the response is sent, silently dropping a fire-and-forget email mid-flight.
    await sendMail(
      `New ${kind} Request — ${customer.name}`,
      `<h2>New ${kind} Request</h2>
       <p><b>Request ID:</b> ${request.requestId || request._id}</p>
       <p><b>Name:</b> ${customer.name}</p>
       <p><b>Phone:</b> ${customer.phone}</p>
       ${customer.email ? `<p><b>Email:</b> ${customer.email}</p>` : ''}
       ${customer.address ? `<p><b>Address:</b> ${customer.address}${customer.unitBuzzer ? ` (Unit/Buzzer: ${customer.unitBuzzer})` : ''}, ${customer.city || ''} ${customer.postalCode || ''}</p>` : ''}
       ${req.body.groceryType ? `<p><b>Type:</b> ${req.body.groceryType}</p>` : ''}
       ${req.body.plan ? `<p><b>Plan:</b> ${req.body.plan}</p>` : ''}
       ${req.body.orderNumber ? `<p><b>Order #:</b> ${req.body.orderNumber}</p>` : ''}
       ${req.body.storeName ? `<p><b>Store:</b> ${req.body.storeName}${req.body.storeAddress ? `, ${req.body.storeAddress}` : ''}</p>` : ''}
       ${req.body.deliveryTiming ? `<p><b>Delivery timing:</b> ${req.body.deliveryTiming === 'scheduled' ? `Scheduled — ${req.body.preferredDate || ''} ${req.body.preferredTime || ''}` : 'ASAP'}</p>` : ''}
       ${req.body.items ? `<p><b>List:</b> ${req.body.items}</p>` : ''}
       ${req.body.giftDetails ? `<p><b>Gift:</b> ${req.body.giftDetails}</p>` : ''}
       ${req.body.notes ? `<p><b>Notes:</b> ${req.body.notes}</p>` : ''}`
    );

    res.status(201).json({ success: true, data: request });
  } catch (err) { console.error('[SERVICES] POST / failed:', err.message, err.stack); res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/services/plan-checkout - public: sign up for a Seniors monthly plan and pay via Stripe.
// billingType 'auto-renew' creates a real recurring Stripe subscription (auto-billed every
// month); 'manual' is a one-time charge for the current month only, no auto-renewal.
router.post('/plan-checkout', async (req, res) => {
  if (!stripe) return res.status(500).json({ success: false, message: 'Stripe is not configured on the server' });
  try {
    const { planCode, billingType, customer, groceryType, frequency, notes } = req.body;
    const plan = SENIORS_PLANS[planCode];
    if (!plan) return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    if (!['auto-renew', 'manual'].includes(billingType)) return res.status(400).json({ success: false, message: 'Invalid billing type' });
    if (!customer || !customer.name || !customer.phone) return res.status(400).json({ success: false, message: 'Name and phone are required' });

    const request = await ServiceRequest.create({
      kind: 'membership',
      groceryType: groceryType || 'seniors',
      plan: 'monthly',
      frequency: frequency || '',
      planCode, planName: plan.name, planPrice: plan.price, billingType,
      customer, notes: notes || '',
      paymentStatus: 'pending',
      user: req.user ? req.user._id : null
    });

    const session = await stripe.checkout.sessions.create({
      mode: billingType === 'auto-renew' ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      customer_email: customer.email || undefined,
      line_items: [{
        price_data: {
          currency: 'cad',
          product_data: { name: `O'SIPP Seniors Plan — ${plan.name}` },
          unit_amount: Math.round(plan.price * 100),
          ...(billingType === 'auto-renew' ? { recurring: { interval: 'month' } } : {})
        },
        quantity: 1
      }],
      success_url: `${FRONTEND_URL}/order-success?requestId=${request.requestId}`,
      cancel_url: `${FRONTEND_URL}/grocery?cancelled=1`,
      metadata: { type: 'service-plan', requestId: request._id.toString() }
    });

    request.stripeSessionId = session.id;
    await request.save();

    await sendMail(
      `New Seniors Plan Sign-Up — ${plan.name} (${billingType === 'auto-renew' ? 'Auto-Renew' : 'Manual — awaiting payment'})`,
      `<h2>New Seniors Monthly Plan Sign-Up</h2>
       <p><b>Request ID:</b> ${request.requestId}</p>
       <p><b>Plan:</b> ${plan.name} — $${plan.price}/month (${billingType === 'auto-renew' ? 'Auto-Renew' : 'Pay Monthly (manual)'})</p>
       <p><b>Name:</b> ${customer.name} — ${customer.phone}${customer.email ? ` — ${customer.email}` : ''}</p>
       ${customer.address ? `<p><b>Address:</b> ${customer.address}${customer.unitBuzzer ? ` (Unit/Buzzer: ${customer.unitBuzzer})` : ''}, ${customer.city || ''} ${customer.postalCode || ''}</p>` : ''}
       ${notes ? `<p><b>Notes:</b> ${notes}</p>` : ''}
       <p><i>Payment confirmation will follow once checkout is completed.</i></p>`
    );

    res.json({ success: true, url: session.url });
  } catch (err) {
    console.error('[SERVICES] plan-checkout failed:', err.message, err.stack);
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// PUT /api/services/:id/cancel-subscription - admin: cancel an auto-renew Seniors plan in Stripe
router.put('/:id/cancel-subscription', protect, adminOnly, async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Not found' });
    if (!request.stripeSubscriptionId) return res.status(400).json({ success: false, message: 'This request has no active subscription' });
    if (!stripe) return res.status(500).json({ success: false, message: 'Stripe is not configured on the server' });

    await stripe.subscriptions.cancel(request.stripeSubscriptionId);
    request.subscriptionStatus = 'canceled';
    await request.save();
    res.json({ success: true, data: request });
  } catch (err) {
    console.error('[SERVICES] cancel-subscription failed:', err.message, err.stack);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/services/track/:requestId - public: check payment/request status after Stripe redirect.
// Self-heals if the Stripe webhook hasn't landed yet (or never lands, e.g. it isn't registered
// for this event type) — checks Stripe directly and fires the confirmation emails right here
// so the customer isn't left without them just because the webhook was late/missing.
router.get('/track/:requestId', async (req, res) => {
  try {
    const request = await ServiceRequest.findOne({ requestId: req.params.requestId.toUpperCase() });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    if (request.paymentStatus === 'pending' && request.stripeSessionId && stripe) {
      try {
        const session = await stripe.checkout.sessions.retrieve(request.stripeSessionId);
        if (session.payment_status === 'paid' || session.status === 'complete') {
          await markServicePlanPaid(request, { customerId: session.customer, subscriptionId: session.subscription });
        }
      } catch (stripeErr) {
        console.error(`[SERVICES] Stripe session check failed for ${request.requestId}:`, stripeErr.message);
      }
    }

    res.json({ success: true, data: request });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/services - admin: list requests (optional ?kind= & ?status=)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { kind, status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (kind && kind !== 'all') filter.kind = kind;
    if (status && status !== 'all') filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      ServiceRequest.find(filter).sort('-createdAt').skip(skip).limit(parseInt(limit)),
      ServiceRequest.countDocuments(filter)
    ]);
    res.json({ success: true, data, total });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/services/:id/status - admin
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const request = await ServiceRequest.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ success: true, data: request });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/services/:id - admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try { await ServiceRequest.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
