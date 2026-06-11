const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  postalCode: { type: String, default: '' },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  savedCart: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, qty: { type: Number, default: 1 } }],
  lastCartUpdated: { type: Date, default: null },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
userSchema.pre('save', async function(next) { if (!this.isModified('password')) return next(); this.password = await bcrypt.hash(this.password, 12); next(); });
userSchema.methods.matchPassword = async function(p) { return bcrypt.compare(p, this.password); };
userSchema.methods.getSignedJwtToken = function() { return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET || 'osipp_secret', { expiresIn: '30d' }); };
module.exports = mongoose.model('User', userSchema);
