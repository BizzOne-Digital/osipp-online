const router = require('express').Router();
const ServiceRequest = require('../models/ServiceRequest');
const { protect, adminOnly } = require('../middleware/auth');

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
