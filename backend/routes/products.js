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

// POST /api/products/shuffle - admin: randomize display order for all products (optionally one category)
router.post('/shuffle', protect, adminOnly, async (req, res) => {
  try {
    const { category } = req.body;
    const filter = category && category !== 'All' ? { category } : {};
    const products = await Product.find(filter).select('_id');
    const ops = products.map(p => ({
      updateOne: { filter: { _id: p._id }, update: { sortOrder: Math.floor(Math.random() * 1000000) } }
    }));
    if (ops.length) await Product.bulkWrite(ops);
    res.json({ success: true, message: `Shuffled ${ops.length} products` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/subcategories - public - all subcategories for a category (not just the current page)
router.get('/subcategories', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    if (category && category !== 'All') filter.category = category;
    const subs = await Product.distinct('subCategory', filter);
    res.json({ success: true, data: subs.filter(Boolean).sort() });
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

// variants may arrive as a JSON string when sent via multipart/form-data
const parseVariants = (data) => {
  if (typeof data.variants === 'string') {
    try { data.variants = JSON.parse(data.variants); } catch { data.variants = []; }
  }
  if (Array.isArray(data.variants)) {
    data.variants = data.variants
      .filter(v => v && v.label && v.price !== '' && v.price != null)
      .map(v => ({ label: String(v.label).trim(), price: parseFloat(v.price) || 0, originalPrice: parseFloat(v.originalPrice) || 0, stock: parseInt(v.stock) || 0, sku: v.sku || '', store: v.store || '' }));
  }
  return data;
};

// POST /api/products/upload - admin: upload one image, return its URL
router.post('/upload', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image provided' });
    res.json({ success: true, url: req.file.path || req.file.location || '' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/products/:id/image - admin: set an image URL on a product
router.put('/:id/image', protect, adminOnly, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ success: false, message: 'image URL required' });
    const product = await Product.findByIdAndUpdate(req.params.id, { image }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: product });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/products - admin
router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const data = parseVariants({ ...req.body });
    if (req.file) data.image = req.file.path || req.file.location || '';
    const product = await Product.create(data);
    res.status(201).json({ success: true, data: product });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/products/:id - admin
router.put('/:id', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const data = parseVariants({ ...req.body });
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