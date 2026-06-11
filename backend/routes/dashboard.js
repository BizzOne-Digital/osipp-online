const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const todayEnd = new Date(today); todayEnd.setHours(23,59,59,999);
    const thirtyDaysAgo = new Date(Date.now() - 30*24*60*60*1000);

    const [todayOrders, allOrders, totalProducts, totalCustomers, recentOrders, revenueAgg,
           pendingOrders, lowStock, todayRevAgg, monthlyRevenue, topProducts, categoryBreakdown,
           abandonedCarts, activeCoupons] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: today, $lte: todayEnd } }),
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'customer' }),
      Order.find().sort('-createdAt').limit(10),
      Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, totalRevenue: { $sum: '$total' }, avgOrder: { $avg: '$total' } } }]),
      Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'picking'] } }),
      Product.countDocuments({ stock: { $lt: 10 }, isActive: true }),
      Order.aggregate([{ $match: { createdAt: { $gte: today, $lte: todayEnd }, status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: thirtyDaysAgo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $unwind: '$items' }, { $group: { _id: '$items.name', totalQty: { $sum: '$items.quantity' }, totalRev: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }, { $sort: { totalRev: -1 } }, { $limit: 10 }]),
      Product.aggregate([{ $match: { isActive: true } }, { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } }, { $sort: { count: -1 } }]),
      User.countDocuments({ lastCartUpdated: { $gte: thirtyDaysAgo }, 'savedCart.0': { $exists: true } }),
      Coupon.countDocuments({ isActive: true })
    ]);

    const revenue = revenueAgg[0] || { totalRevenue: 0, avgOrder: 0 };

    res.json({ success: true, data: {
      todayOrders, todayRevenue: todayRevAgg[0]?.total || 0,
      totalOrders: allOrders, totalRevenue: revenue.totalRevenue, avgOrderValue: revenue.avgOrder,
      totalProducts, totalCustomers, pendingOrders, lowStock,
      recentOrders, monthlyRevenue, topProducts, categoryBreakdown,
      abandonedCarts, activeCoupons
    }});
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/dashboard/analytics - detailed analytics
router.get('/analytics', protect, adminOnly, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date(Date.now() - parseInt(period)*24*60*60*1000);

    const [dailyRevenue, ordersByStatus, topCustomers, revenueByCategory, hourlyDistribution] = await Promise.all([
      Order.aggregate([{ $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: daysAgo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 }, avgOrder: { $avg: '$total' } } }, { $sort: { _id: 1 } }]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: '$customer.phone', name: { $last: '$customer.name' }, orders: { $sum: 1 }, spent: { $sum: '$total' } } }, { $sort: { spent: -1 } }, { $limit: 10 }]),
      Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $unwind: '$items' }, { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'prod' } }, { $unwind: { path: '$prod', preserveNullAndEmptyArrays: true } }, { $group: { _id: '$prod.category', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, qty: { $sum: '$items.quantity' } } }, { $sort: { revenue: -1 } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: daysAgo } } }, { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }])
    ]);

    res.json({ success: true, data: { dailyRevenue, ordersByStatus, topCustomers, revenueByCategory, hourlyDistribution } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
