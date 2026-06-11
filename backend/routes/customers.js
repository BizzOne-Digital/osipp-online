const router = require('express').Router();
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const customers = await Order.aggregate([
      { $group: {
        _id: '$customer.phone',
        name: { $last: '$customer.name' },
        email: { $last: '$customer.email' },
        phone: { $last: '$customer.phone' },
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$total' },
        lastOrder: { $max: '$createdAt' }
      }},
      { $sort: { lastOrder: -1 } }
    ]);
    res.json({ success: true, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
