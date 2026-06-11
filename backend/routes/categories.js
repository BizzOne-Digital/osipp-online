const router = require('express').Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, stores: { $addToSet: '$store' } } },
      { $sort: { _id: 1 } }
    ]);
    res.json({ success: true, data: categories.map(c => ({ name: c._id, count: c.count, stores: c.stores })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
