const router = require('express').Router();
const ServiceRequest = require('../models/ServiceRequest');
const { protect, adminOnly } = require('../middleware/auth');
const { sendMail } = require('../utils/mailer');

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
    res.status(201).json({ success: true, data: request });

    sendMail(
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
