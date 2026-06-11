const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/orders - place order with optional coupon
router.post('/', async (req, res) => {
  try {
    const { customer, items, paymentMethod, notes, couponCode } = req.body;
    if (!customer || !items || items.length === 0) return res.status(400).json({ success: false, message: 'Customer info and items required' });

    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ success: false, message: `Product not found` });
      if (product.stock < item.quantity) return res.status(400).json({ success: false, message: `${product.name} out of stock` });
      orderItems.push({ product: product._id, name: product.name, price: product.price, quantity: item.quantity, volume: product.volume });
      subtotal += product.price * item.quantity;
      product.stock -= item.quantity;
      await product.save();
    }

    // Apply coupon
    let discount = 0;
    let couponApplied = '';
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && subtotal >= coupon.minOrder) {
        discount = coupon.type === 'percentage' ? (subtotal * coupon.value / 100) : coupon.value;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
        discount = Math.round(discount * 100) / 100;
        coupon.usedCount += 1;
        if (req.user) coupon.usedBy.push(req.user._id);
        await coupon.save();
        couponApplied = coupon.code;
      }
    }

    const deliveryFee = subtotal > 0 ? 13 : 0;
    const total = Math.max(0, subtotal - discount + deliveryFee);

    const order = await Order.create({
      customer, items: orderItems, subtotal, discount, couponCode: couponApplied,
      deliveryFee, total, paymentMethod: paymentMethod || 'cash', notes: notes || '',
      user: req.user ? req.user._id : null
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/orders - admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const orders = await Order.find(filter).sort(sort).skip(skip).limit(parseInt(limit));
    const total = await Order.countDocuments(filter);
    res.json({ success: true, data: orders, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/orders/track/:orderId
router.get('/track/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId.toUpperCase() });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/orders/:id - admin
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/orders/:id/status
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const update = { status };
    if (status === 'delivered') update.deliveredAt = new Date();
    if (status === 'cancelled') {
      update.cancelledAt = new Date();
      update.cancelReason = req.body.reason || '';
      const order = await Order.findById(req.params.id);
      if (order) for (const item of order.items) await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, data: order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try { await Order.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
