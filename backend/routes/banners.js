const router = require('express').Router();
const Banner = require('../models/Banner');
const { protect, adminOnly } = require('../middleware/auth');
const { upload, deleteImage } = require('../middleware/upload');

// GET /api/banners - public (active) or admin (all)
router.get('/', async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: true, $or: [{ endDate: null }, { endDate: { $gte: new Date() } }] };
    if (req.query.page) filter.page = { $in: [req.query.page, 'all'] };
    const banners = await Banner.find(filter).sort('order');
    res.json({ success: true, data: banners });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = req.file.path;
    const b = await Banner.create(data);
    res.status(201).json({ success: true, data: b });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      const old = await Banner.findById(req.params.id);
      if (old && old.image) await deleteImage(old.image);
      data.image = req.file.path;
    }
    const b = await Banner.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json({ success: true, data: b });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const b = await Banner.findById(req.params.id);
    if (b && b.image) await deleteImage(b.image);
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
