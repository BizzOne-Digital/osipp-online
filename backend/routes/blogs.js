const router = require('express').Router();
const BlogPost = require('../models/BlogPost');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const slugify = (s) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

// Appends -2, -3... so two posts with the same title never collide on the unique slug.
const uniqueSlug = async (base, excludeId) => {
  const root = slugify(base) || 'post';
  let slug = root, n = 1;
  while (await BlogPost.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) slug = `${root}-${++n}`;
  return slug;
};

const buildData = (body) => {
  const data = {};
  ['title', 'excerpt', 'content', 'metaDescription', 'status'].forEach(k => { if (body[k] !== undefined) data[k] = body[k]; });
  return data;
};

// GET /api/blogs - public (published) or admin (all with ?all=true)
router.get('/', async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { status: 'published' };
    const posts = await BlogPost.find(filter).select('-content').sort({ publishedAt: -1, createdAt: -1 });
    res.json({ success: true, data: posts });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/blogs/admin/:id - full post for editing
router.get('/admin/:id', protect, adminOnly, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/blogs/:slug - public single post
router.get('/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, status: 'published' });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const data = buildData(req.body);
    if (!data.title) return res.status(400).json({ success: false, message: 'Title is required' });
    data.slug = await uniqueSlug(req.body.slug || data.title);
    if (req.file) data.image = req.file.path;
    if (data.status === 'published') data.publishedAt = new Date();
    const post = await BlogPost.create(data);
    res.status(201).json({ success: true, data: post });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const existing = await BlogPost.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Post not found' });
    const data = buildData(req.body);
    if (req.body.slug !== undefined && req.body.slug !== existing.slug) data.slug = await uniqueSlug(req.body.slug || data.title || existing.title, existing._id);
    if (req.file) data.image = req.file.path;
    if (data.status === 'published' && !existing.publishedAt) data.publishedAt = new Date();
    const post = await BlogPost.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json({ success: true, data: post });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await BlogPost.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
