const router = require('express').Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email, and password required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, phone, password, role: 'customer' });
    const token = user.getSignedJwtToken();
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Provide email and password' });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = user.getSignedJwtToken();
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res.json({ success: true, user });
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, address, city, postalCode } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, address, city, postalCode }, { new: true });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/auth/orders - customer order history
router.get('/orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ 'customer.email': req.user.email }).sort('-createdAt').limit(50);
    res.json({ success: true, data: orders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/auth/wishlist/:productId
router.post('/wishlist/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const pid = req.params.productId;
    const idx = user.wishlist.indexOf(pid);
    if (idx > -1) user.wishlist.splice(idx, 1); else user.wishlist.push(pid);
    await user.save();
    const populated = await User.findById(user._id).populate('wishlist');
    res.json({ success: true, wishlist: populated.wishlist });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/auth/wishlist
router.get('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({ success: true, data: user.wishlist });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/auth/save-cart - abandoned cart recovery
router.post('/save-cart', protect, async (req, res) => {
  try {
    const { items } = req.body;
    await User.findByIdAndUpdate(req.user._id, { savedCart: items, lastCartUpdated: new Date() });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/auth/saved-cart
router.get('/saved-cart', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedCart.product');
    res.json({ success: true, data: user.savedCart, lastUpdated: user.lastCartUpdated });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
