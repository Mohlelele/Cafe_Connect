const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

const menuItemSchema = new mongoose.Schema({
  item_name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, default: 0 },
  availability: { type: Boolean, default: true },
  image_url: { type: String, default: '' },
}, { timestamps: true });

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  item_name: { type: String },
  quantity: { type: Number, default: 1 },
  price: { type: Number, default: 0 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customerName: { type: String, default: 'Student' },
  studentId: { type: String, required: true },
  totalAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'Cash' },
  status: { type: String, default: 'Pending' },
  items: [orderItemSchema],
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

module.exports = { User, MenuItem, Order };
