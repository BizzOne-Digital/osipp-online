const router = require('express').Router();
const Promotion = require('../models/Promotion');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/promotions - public (active only) or admin (all)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.active === 'true') {
      filter.isActive = true;
      filter.$or = [
        { endDate: null },
        { endDate: { $gte: new Date() } }
      ];
    }
    const promos = await Promotion.find(filter).sort('-createdAt');
    res.json({ success: true, data: promos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/promotions - admin
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const promo = await Promotion.create(req.body);
    res.status(201).json({ success: true, data: promo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/promotions/:id - admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const promo = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!promo) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: promo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/promotions/:id - admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Promotion.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
