const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { success: false, message: 'Too many requests, please try again later' } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { success: false, message: 'Too many login attempts' } });

module.exports = { apiLimiter, authLimiter };
