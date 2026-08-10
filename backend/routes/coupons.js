const router = require('express').Router();
const Coupon = require('../models/Coupon');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/coupons/validate - public
router.post('/validate', async (req, res) => {
  try {
    const { code, subtotal, userId, deliveryFee, handlingFee } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    if (coupon.endDate && new Date() > coupon.endDate) return res.status(400).json({ success: false, message: 'Coupon expired' });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    if (subtotal < coupon.minOrder) return res.status(400).json({ success: false, message: `Minimum order $${coupon.minOrder} required` });
    if (userId && coupon.perUserLimit) {
      const userUses = coupon.usedBy.filter(u => u.toString() === userId).length;
      if (userUses >= coupon.perUserLimit) return res.status(400).json({ success: false, message: 'You already used this coupon' });
    }
    let discount;
    if (coupon.type === 'free_delivery') {
      discount = (parseFloat(deliveryFee) || 0) + (parseFloat(handlingFee) || 0);
    } else {
      discount = coupon.type === 'percentage' ? (subtotal * coupon.value / 100) : coupon.value;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
    }
    res.json({ success: true, data: { code: coupon.code, type: coupon.type, value: coupon.value, discount: Math.round(discount * 100) / 100, description: coupon.description } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/coupons - admin
router.get('/', protect, adminOnly, async (req, res) => {
  try { const coupons = await Coupon.find().sort('-createdAt'); res.json({ success: true, data: coupons }); }
  catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/coupons - admin create
router.post('/', protect, adminOnly, async (req, res) => {
  try { const c = await Coupon.create(req.body); res.status(201).json({ success: true, data: c }); }
  catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/coupons/:id - admin update
router.put('/:id', protect, adminOnly, async (req, res) => {
  try { const c = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ success: true, data: c }); }
  catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/coupons/:id - admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try { await Coupon.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
