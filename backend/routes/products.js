const router = require('express').Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

let upload, deleteImage;
try {
  const u = require('../middleware/upload');
  upload = u.upload;
  deleteImage = u.deleteImage;
} catch (e) {
  // Cloudinary not configured - use basic multer
  const multer = require('multer');
  upload = multer({ dest: 'uploads/' });
  deleteImage = async () => {};
}

// GET /api/products - public
router.get('/', async (req, res) => {
  try {
    const { category, store, search, badge, subCategory, page = 1, limit = 100, sort = '-createdAt', minPrice, maxPrice } = req.query;
    const filter = { isActive: true };
    if (category && category !== 'All') filter.category = category;
    if (store) filter.store = store;
    if (badge) filter.badge = badge;
    if (subCategory) filter.subCategory = subCategory;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subCategory: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Product.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: products,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      hasMore: skip + products.length < total
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/all - admin (no limit)
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 50, sort = '-createdAt' } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subCategory: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Product.countDocuments(filter)
    ]);

    res.json({ success: true, data: products, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), hasMore: skip + products.length < total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/products - admin
router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = req.file.path || req.file.location || '';
    const product = await Product.create(data);
    res.status(201).json({ success: true, data: product });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/products/:id - admin
router.put('/:id', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.file) {
      if (existing.image) await deleteImage(existing.image);
      data.image = req.file.path || req.file.location || '';
    }
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    res.json({ success: true, data: product });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/products/:id - admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Not found' });
    if (product.image) await deleteImage(product.image);
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;