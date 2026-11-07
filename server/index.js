const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const connectDB = require('./db');
const { hashPassword, verifyPassword } = require('./auth');
const { User, MenuItem, Order } = require('./models');

const sendgridApiKey = process.env.SENDGRID_API_KEY;
const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL || 'no-reply@cafeconnect.com';

if (sendgridApiKey) {
  sgMail.setApiKey(sendgridApiKey);
}

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://cafe-connect-liard.vercel.app',
  'https://cafe-connect-awy2jfx9v-mathapelo.vercel.app',
  'https://cafe-connect-51tz.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const normalizedOrigin = origin.toLowerCase();
  if (allowedOrigins.some((allowed) => allowed && allowed.toLowerCase() === normalizedOrigin)) {
    return true;
  }

  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
    || /^https?:\/\/.*\.vercel\.app$/i.test(origin)
    || /^https?:\/\/.*\.vercel\.app\/.*$/i.test(origin);
};

const DEFAULT_ADMIN_EMAIL = 'admin@cafeconnect.com';
const DEFAULT_ADMIN_PASSWORD = 'admin123';
const DEFAULT_STUDENT_EMAIL = 'mathapelo@cafeconnect.com';
const DEFAULT_STUDENT_PASSWORD = 'student123';

const demoUsers = [
  {
    id: 1,
    name: 'Mathapelo Mokoena',
    email: DEFAULT_STUDENT_EMAIL,
    password: DEFAULT_STUDENT_PASSWORD,
  },
  {
    id: 99,
    name: 'Cafe Connect Admin',
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
  },
];

const demoMenu = [
  { id: 1, item_name: 'Classic Beef Burger', description: 'Beef patty, cheddar, lettuce, tomato and house sauce.', price: 64, availability: true, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80' },
  { id: 2, item_name: 'Chicken Burger Deluxe', description: 'Crispy chicken fillet with cheese, slaw and special sauce.', price: 68, availability: true, image_url: 'https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=900&q=80' },
  { id: 3, item_name: 'Veggie Burger', description: 'Plant-based patty with grilled veg, lettuce and aioli.', price: 60, availability: true, image_url: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=900&q=80' },
  { id: 4, item_name: 'Margherita Pizza', description: 'Classic mozzarella, tomato sauce and basil on a thin crust.', price: 72, availability: true, image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80' },
  { id: 7, item_name: 'Beef Pie', description: 'Golden pastry filled with savoury beef and rich gravy.', price: 39, availability: true, image_url: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=900&q=80' },
  { id: 8, item_name: 'Chicken Pie', description: 'Tender chicken pie with creamy filling and flaky crust.', price: 42, availability: true, image_url: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=900&q=80' },
  { id: 9, item_name: 'Hot Fried Chicken', description: 'Golden fried chicken pieces with a spicy crunch and dip.', price: 75, availability: true, image_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80' },
  { id: 10, item_name: 'Chicken Wrap', description: 'Grilled chicken wrap with salad, relish and creamy dressing.', price: 52, availability: true, image_url: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=900&q=80' },
  { id: 11, item_name: 'Chicken Bucket Meal', description: 'Crispy chicken bucket with fries and coleslaw.', price: 96, availability: true, image_url: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=900&q=80' },
  { id: 13, item_name: 'Chicken Curry Bowl', description: 'Traditional curry with chicken, rice and a rich sauce.', price: 78, availability: true, image_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80' },
  { id: 14, item_name: 'Cappuccino', description: 'Creamy espresso-based cappuccino with silky foam.', price: 22, availability: true, image_url: 'https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=900&q=80' },
  { id: 15, item_name: 'Iced Latte', description: 'Smooth iced coffee with a clean, mellow finish.', price: 24, availability: true, image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80' },
  { id: 16, item_name: 'Mango Juice', description: 'Cold mango juice with a fresh tropical taste.', price: 18, availability: true, image_url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=900&q=80' },
];

const demoOrders = [];
const activeSessions = new Map();
const passwordResetCodes = new Map();
let isDbConnected = false;

const seedDatabaseDefaults = async () => {
  if (!isDbConnected) {
    return;
  }

  const adminExisting = await User.findOne({ email: DEFAULT_ADMIN_EMAIL }).lean();
  if (!adminExisting) {
    await User.create({
      name: 'Cafe Connect Admin',
      email: DEFAULT_ADMIN_EMAIL,
      password: await hashPassword(DEFAULT_ADMIN_PASSWORD),
    });
  }

  const studentExisting = await User.findOne({ email: DEFAULT_STUDENT_EMAIL }).lean();
  if (!studentExisting) {
    await User.create({
      name: 'Mathapelo Mokoena',
      email: DEFAULT_STUDENT_EMAIL,
      password: await hashPassword(DEFAULT_STUDENT_PASSWORD),
    });
  }

  const menuCount = await MenuItem.countDocuments();
  if (menuCount === 0) {
    await MenuItem.insertMany(demoMenu.map((item) => ({
      item_name: item.item_name,
      description: item.description,
      price: Number(item.price || 0),
      availability: item.availability ?? true,
      image_url: item.image_url || '',
    })));
  }
};

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, origin || true);
      return;
    }
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

const normalizeMenuItem = (item) => ({
  id: item.id,
  item_name: item.item_name || item.name,
  name: item.item_name || item.name,
  description: item.description || '',
  price: Number(item.price || 0),
  availability: item.availability ?? true,
  image_url: item.image_url || item.image || '',
  image: item.image_url || item.image || '',
});

const normalizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

const normalizeOrderStatus = (status) => {
  const value = String(status ?? 'Pending').trim();
  const normalized = value || 'Pending';
  const lowered = normalized.toLowerCase();

  if (['prep', 'preparing', 'pending', 'in progress', 'in-progress', 'queued'].includes(lowered)) {
    return 'Pending';
  }

  if (['ready', 'completed', 'done'].includes(lowered)) {
    return 'Ready';
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
};

const respondWithMenu = (items = []) => items.map(normalizeMenuItem);

const serializeOrder = (order = {}) => ({
  id: order.id || order._id?.toString?.() || order.order_id,
  orderNumber: order.orderNumber || order.order_number || `CC-${order._id || order.id || Date.now()}`,
  customerName: order.customerName || order.customer_name || 'Student',
  studentId: order.studentId || order.student_id || order.studentId,
  totalAmount: Number(order.totalAmount || order.total_amount || 0),
  paymentMethod: order.paymentMethod || order.payment_method || 'Cash',
  status: normalizeOrderStatus(order.status || order.order_status || 'Pending'),
  items: Array.isArray(order.items) ? order.items.map((item) => ({
    name: item.name || item.item_name || 'Item',
    item_name: item.item_name || item.name || 'Item',
    quantity: Number(item.quantity || 1),
    price: Number(item.price || item.item_price || 0),
  })) : [],
  createdAt: order.createdAt || order.created_at || new Date().toISOString(),
});

const normalizeMenuItemFromDb = (item = {}) => ({
  id: item.menu_item_id ?? item.id,
  item_name: item.item_name || item.name,
  name: item.item_name || item.name,
  description: item.description || '',
  price: Number(item.price || 0),
  availability: item.availability ?? true,
  image_url: item.image_url || item.image || '',
  image: item.image_url || item.image || '',
});

const normalizeDbOrderRows = (rows = []) => {
  const grouped = new Map();

  for (const row of rows) {
    const key = row.id ?? row.order_id;
    if (!key) continue;

    if (!grouped.has(key)) {
      grouped.set(key, {
        id: row.id ?? row.order_id,
        orderNumber: row.orderNumber || row.order_number || `CC-${row.id ?? row.order_id}`,
        customerName: row.customerName || row.customer_name || 'Student',
        studentId: row.studentId ?? row.student_id,
        totalAmount: Number(row.totalAmount || row.total_amount || 0),
        paymentMethod: row.paymentMethod || row.payment_method || 'Cash',
        status: normalizeOrderStatus(row.status || row.order_status || 'Pending'),
        items: [],
        createdAt: row.createdAt || row.created_at || new Date().toISOString(),
      });
    }

    const current = grouped.get(key);
    if (row.item_name || row.name) {
      current.items.push({
        name: row.item_name || row.name || 'Item',
        item_name: row.item_name || row.name || 'Item',
        quantity: Number(row.quantity || 1),
        price: Number(row.item_price || row.price || row.totalAmount || 0),
      });
    }
  }

  return [...grouped.values()].map((order) => ({
    ...order,
    totalAmount: Number(order.totalAmount || order.items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0)),
    items: order.items.length ? order.items : [],
  }));
};

const createSession = (role, user) => {
  const token = crypto.randomBytes(24).toString('hex');
  activeSessions.set(token, { role, userId: user.id, email: user.email, name: user.name });
  return token;
};

const requireSession = (requiredRole) => (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const session = token ? activeSessions.get(token) : null;

  if (!session || session.role !== requiredRole) {
    return res.status(401).json({ message: 'Unauthorized. Please log in again.' });
  }

  req.session = session;
  return next();
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const sendPasswordResetOtpEmail = async (email, otp) => {
  if (!sendgridApiKey) {
    return {
      delivered: false,
      configured: false,
      message: 'Email delivery is not configured. Showing the OTP in-app for this demo setup.',
      otp,
    };
  }

  try {
    await sgMail.send({
      to: email,
      from: sendgridFromEmail,
      subject: 'Cafe Connect password reset code',
      text: `Your Cafe Connect password reset code is ${otp}. It expires in 10 minutes.`,
      html: `<p>Your Cafe Connect password reset code is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
    });

    return { delivered: true, configured: true, message: 'Password reset code sent successfully.', otp };
  } catch (error) {
    console.error('SendGrid email failed:', error.message);
    return {
      delivered: false,
      configured: true,
      message: 'The email provider could not deliver the reset code. Showing the OTP in-app for this demo setup.',
      otp,
    };
  }
};

const matchPassword = async (inputPassword, storedPassword) => {
  if (!storedPassword) return false;
  if (typeof storedPassword === 'string' && storedPassword.startsWith('$2')) {
    return verifyPassword(inputPassword, storedPassword);
  }
  return String(inputPassword) === String(storedPassword);
};

app.get('/', (req, res) => {
  res.json({ message: 'Cafe Connect API is running' });
});

app.get('/api/menu', requireSession('student'), async (req, res) => {
  try {
    if (isDbConnected) {
      const items = await MenuItem.find({}).sort({ createdAt: -1 }).lean();
      return res.json(items.map(normalizeMenuItemFromDb));
    }
    return res.json(respondWithMenu(demoMenu));
  } catch (error) {
    console.error('Menu fetch failed:', error.message);
    return res.json(respondWithMenu(demoMenu));
  }
});

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  const safeName = String(name || '').trim();
  const safeEmail = String(email || '').trim().toLowerCase();
  const safePassword = String(password || '').trim();

  if (!safeName || !safeEmail || !safePassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    if (isDbConnected) {
      const existing = await User.findOne({ email: safeEmail }).lean();
      if (existing) {
        return res.status(409).json({ message: 'User already exists.' });
      }

      const passwordHash = await hashPassword(safePassword);
      const user = await User.create({ name: safeName, email: safeEmail, password: passwordHash });
      return res.status(201).json({ message: 'Student registered successfully.', student: normalizeUser({ id: user._id.toString(), name: user.name, email: user.email }) });
    }

    const existing = demoUsers.find((user) => user.email === safeEmail);
    if (existing) {
      return res.status(409).json({ message: 'User already exists.' });
    }

    const passwordHash = await hashPassword(safePassword);
    const user = { id: Date.now(), name: safeName, email: safeEmail, password: passwordHash };
    demoUsers.push(user);
    return res.status(201).json({ message: 'Student registered successfully.', student: normalizeUser(user) });
  } catch (error) {
    console.error('Register failed:', error.message);
    return res.status(500).json({ message: 'Registration failed.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const safeEmail = String(email || '').trim().toLowerCase();
  const safePassword = String(password || '').trim();

  if (!safeEmail || !safePassword) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    if (isDbConnected) {
      const user = await User.findOne({ email: safeEmail });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const valid = await matchPassword(safePassword, user.password);
      if (!valid) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const token = createSession('student', { id: user._id.toString(), name: user.name, email: user.email, password: user.password });
      return res.json({ message: 'Login successful', token, user: { id: user._id.toString(), name: user.name, email: user.email } });
    }

    const user = demoUsers.find((entry) => entry.email === safeEmail);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const valid = await matchPassword(safePassword, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = createSession('student', user);
    return res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Login failed:', error.message);
    return res.status(500).json({ message: 'Login failed.' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  const safeEmail = String(email || '').trim().toLowerCase();
  const safePassword = String(password || '').trim();

  if (!safeEmail || !safePassword) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    if (isDbConnected) {
      const admin = await User.findOne({ email: safeEmail });
      if (!admin || admin.email !== DEFAULT_ADMIN_EMAIL) {
        return res.status(401).json({ message: 'Invalid admin email or password.' });
      }

      const valid = await matchPassword(safePassword, admin.password);
      if (!valid) {
        return res.status(401).json({ message: 'Invalid admin email or password.' });
      }

      const token = createSession('admin', { id: admin._id.toString(), name: admin.name, email: admin.email, password: admin.password });
      return res.json({ message: 'Admin login successful', token, admin: { id: admin._id.toString(), name: admin.name, email: admin.email } });
    }

    const admin = demoUsers.find((entry) => entry.email === safeEmail && entry.email === DEFAULT_ADMIN_EMAIL);
    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin email or password.' });
    }

    const valid = await matchPassword(safePassword, admin.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid admin email or password.' });
    }

    const token = createSession('admin', admin);
    return res.json({ message: 'Admin login successful', token, admin: { id: admin.id, name: admin.name, email: admin.email } });
  } catch (error) {
    console.error('Admin login failed:', error.message);
    return res.status(500).json({ message: 'Admin login failed.' });
  }
});

app.get('/api/orders', requireSession('student'), async (req, res) => {
  try {
    if (isDbConnected) {
      const orders = await Order.find({ studentId: String(req.session.userId) }).sort({ createdAt: -1 }).lean();
      return res.json(orders.map((order) => ({
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        customerName: order.customerName || req.session.name,
        studentId: order.studentId,
        totalAmount: Number(order.totalAmount || 0),
        paymentMethod: order.paymentMethod || 'Cash',
        status: normalizeOrderStatus(order.status || 'Pending'),
        items: Array.isArray(order.items) ? order.items.map((item) => ({
          name: item.name || item.item_name || 'Item',
          item_name: item.item_name || item.name || 'Item',
          quantity: Number(item.quantity || 1),
          price: Number(item.price || 0),
        })) : [],
        createdAt: order.createdAt || new Date(order._id.toString()).toISOString(),
      })));
    }

    const studentOrders = demoOrders.filter((order) => String(order.studentId) === String(req.session.userId));
    return res.json(studentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName || req.session.name,
      studentId: order.studentId,
      totalAmount: Number(order.totalAmount || 0),
      paymentMethod: order.paymentMethod || 'Cash',
      status: normalizeOrderStatus(order.status || 'Pending'),
      items: order.items || [],
      createdAt: order.createdAt || new Date(order.id).toISOString(),
    })));
  } catch (error) {
    console.error('Student orders fetch failed:', error.message);
    return res.status(500).json({ message: 'Could not load your orders.' });
  }
});

app.post('/api/orders', requireSession('student'), async (req, res) => {
  const { items, paymentMethod } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Order must contain at least one item.' });
  }

  try {
    if (isDbConnected) {
      const student = await User.findById(req.session.userId).lean();
      const orderNumber = `CC-${Math.floor(1000 + Math.random() * 9000)}`;
      const totalAmount = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
      const order = await Order.create({
        orderNumber,
        customerName: student?.name || req.session.name || 'Student',
        studentId: String(req.session.userId),
        totalAmount,
        paymentMethod: paymentMethod || 'Cash',
        status: 'Pending',
        items: items.map((item) => ({
          name: item.name || item.item_name || 'Item',
          item_name: item.item_name || item.name || 'Item',
          quantity: Number(item.quantity || 1),
          price: Number(item.price || 0),
        })),
        createdAt: new Date(),
      });

      return res.status(201).json({ message: 'Order placed successfully.', orderNumber, totalAmount, paymentMethod: paymentMethod || 'Cash', orderId: order._id.toString() });
    }

    const student = demoUsers.find((entry) => String(entry.id) === String(req.session.userId));
    const orderNumber = `CC-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalAmount = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
    const order = {
      id: Date.now(),
      orderNumber,
      customerName: student?.name || req.session.name || 'Student',
      studentId: Number(req.session.userId),
      totalAmount,
      paymentMethod: paymentMethod || 'Cash',
      status: 'Pending',
      items,
      createdAt: new Date().toISOString(),
    };
    demoOrders.push(order);

    return res.status(201).json({ message: 'Order placed successfully.', orderNumber, totalAmount, paymentMethod: order.paymentMethod, orderId: order.id });
  } catch (error) {
    console.error('Order creation failed:', error.message);
    return res.status(500).json({ message: 'Order creation failed.' });
  }
});

app.get('/api/admin/students', requireSession('admin'), async (req, res) => {
  try {
    if (isDbConnected) {
      const users = await User.find({ email: { $ne: DEFAULT_ADMIN_EMAIL } }).sort({ createdAt: -1 }).lean();
      return res.json(users.map((user) => ({ id: user._id.toString(), name: user.name, email: user.email })));
    }

    const students = demoUsers.filter((user) => user.email !== DEFAULT_ADMIN_EMAIL);
    return res.json(students.map((user) => ({ id: user.id, name: user.name, email: user.email })));
  } catch (error) {
    console.error('Admin students fetch failed:', error.message);
    return res.status(500).json({ message: 'Could not load students.' });
  }
});

app.post('/api/admin/students', requireSession('admin'), async (req, res) => {
  const { name, email, password } = req.body;
  const safeName = String(name || '').trim();
  const safeEmail = String(email || '').trim().toLowerCase();
  const safePassword = String(password || '').trim();

  if (!safeName || !safeEmail || !safePassword) {
    return res.status(400).json({ message: 'Student name, email and password are required.' });
  }

  try {
    if (isDbConnected) {
      const existing = await User.findOne({ email: safeEmail }).lean();
      if (existing) {
        return res.status(409).json({ message: 'Student already exists.' });
      }

      const passwordHash = await hashPassword(safePassword);
      const user = await User.create({ name: safeName, email: safeEmail, password: passwordHash });
      return res.status(201).json({ message: 'Student account created.', student: normalizeUser({ id: user._id.toString(), name: user.name, email: user.email }) });
    }

    const existing = demoUsers.find((user) => user.email === safeEmail);
    if (existing) {
      return res.status(409).json({ message: 'Student already exists.' });
    }

    const passwordHash = await hashPassword(safePassword);
    const user = { id: Date.now(), name: safeName, email: safeEmail, password: passwordHash };
    demoUsers.push(user);
    return res.status(201).json({ message: 'Student account created.', student: normalizeUser(user) });
  } catch (error) {
    console.error('Admin student creation failed:', error.message);
    return res.status(500).json({ message: 'Student creation failed.' });
  }
});

app.post('/api/forgot-password/request', async (req, res) => {
  const { email } = req.body;
  const safeEmail = String(email || '').trim().toLowerCase();

  if (!safeEmail) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const student = demoUsers.find((user) => user.email === safeEmail);
    if (!student) {
      return res.status(404).json({ message: 'No account found for that email.' });
    }

    return res.json({
      message: 'You can now set a new password for this account.',
      resetReady: true,
    });
  } catch (error) {
    console.error('Password reset request failed:', error.message);
    return res.status(500).json({ message: 'Unable to continue with password reset.' });
  }
});

app.post('/api/forgot-password', async (req, res) => {
  const { email, newPassword, password } = req.body;
  const safeEmail = String(email || '').trim().toLowerCase();
  const safePassword = String(newPassword || password || '').trim();

  if (!safeEmail || !safePassword) {
    return res.status(400).json({ message: 'Email and a new password are required.' });
  }

  try {
    const student = demoUsers.find((user) => user.email === safeEmail);
    if (!student) {
      return res.status(404).json({ message: 'No account found for that email.' });
    }

    student.password = await hashPassword(safePassword);
    return res.json({ message: 'Password reset successful. Please log in with your new password.' });
  } catch (error) {
    console.error('Forgot password failed:', error.message);
    return res.status(500).json({ message: 'Password reset failed.' });
  }
});

app.patch('/api/admin/students/:id/reset-password', requireSession('admin'), async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  const safePassword = String(newPassword || '').trim();

  if (!safePassword) {
    return res.status(400).json({ message: 'A new password is required.' });
  }

  try {
    const student = demoUsers.find((user) => String(user.id) === String(id));
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    student.password = await hashPassword(safePassword);
    return res.json({ message: 'Student password reset successfully.' });
  } catch (error) {
    console.error('Password reset failed:', error.message);
    return res.status(500).json({ message: 'Password reset failed.' });
  }
});

app.get('/api/admin/orders', requireSession('admin'), async (req, res) => {
  try {
    if (isDbConnected) {
      const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
      return res.json(orders.map((order) => ({
        order_id: order._id.toString(),
        order_number: order.orderNumber,
        order_status: normalizeOrderStatus(order.status || 'Pending'),
        total_amount: Number(order.totalAmount || 0),
        customer_name: order.customerName || 'Student',
        customer_email: null,
        item_name: (Array.isArray(order.items) ? order.items : []).map((item) => item.name || item.item_name || 'Item').join(', ') || 'Cafe order',
        items: Array.isArray(order.items) ? order.items.map((item) => ({
          name: item.name || item.item_name || 'Item',
          item_name: item.item_name || item.name || 'Item',
          quantity: Number(item.quantity || 1),
          price: Number(item.price || 0),
        })) : [],
        created_at: order.createdAt || new Date(order._id.toString()).toISOString(),
      })));
    }

    return res.json(demoOrders.map((order) => {
      const itemNames = (order.items || []).map((item) => item.name || item.item_name || `${Number(item.quantity || 1)}x item`);
      const firstItem = itemNames[0] || 'Cafe order';
      const customerName = order.customerName || 'Student';
      const student = demoUsers.find((user) => String(user.id) === String(order.studentId));

      return {
        order_id: order.id,
        order_number: order.orderNumber,
        order_status: normalizeOrderStatus(order.status),
        total_amount: order.totalAmount,
        customer_name: customerName,
        customer_email: student?.email || null,
        item_name: firstItem,
        items: order.items || [],
        created_at: order.createdAt || new Date(order.id).toISOString(),
      };
    }));
  } catch (error) {
    console.error('Admin orders fetch failed:', error.message);
    return res.json(demoOrders);
  }
});

app.patch('/api/admin/orders/:id/status', requireSession('admin'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required.' });
  }

  try {
    const normalizedStatus = normalizeOrderStatus(status);

    if (isDbConnected) {
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
      }

      order.status = normalizedStatus;
      await order.save();
      return res.json({ message: 'Order status updated.', order: serializeOrder(order.toObject()) });
    }

    const order = demoOrders.find((entry) => String(entry.id) === String(id));
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    order.status = normalizedStatus;
    return res.json({ message: 'Order status updated.', order: { ...order, status: order.status } });
  } catch (error) {
    console.error('Order status update failed:', error.message);
    return res.status(500).json({ message: 'Order status update failed.' });
  }
});

app.get('/api/admin/menu', requireSession('admin'), async (req, res) => {
  try {
    if (isDbConnected) {
      const items = await MenuItem.find({}).sort({ createdAt: -1 }).lean();
      return res.json(items.map(normalizeMenuItemFromDb));
    }
    return res.json(respondWithMenu(demoMenu));
  } catch (error) {
    console.error('Admin menu load failed:', error.message);
    return res.status(500).json({ message: 'Could not load menu items.' });
  }
});

app.post('/api/admin/menu', requireSession('admin'), async (req, res) => {
  const { item_name, description, price, image_url } = req.body;

  if (!item_name || !description || !price) {
    return res.status(400).json({ message: 'Item name, description and price are required.' });
  }

  try {
    if (isDbConnected) {
      const item = await MenuItem.create({
        item_name,
        description,
        price: Number(price),
        availability: true,
        image_url: image_url || '',
      });
      return res.status(201).json({ message: 'Menu item created.', item: normalizeMenuItemFromDb(item.toObject()) });
    }

    const item = { id: Date.now(), item_name, description, price: Number(price), availability: true, image_url: image_url || demoMenu[0].image_url };
    demoMenu.unshift(item);
    return res.status(201).json({ message: 'Menu item created.', item });
  } catch (error) {
    console.error('Admin menu create failed:', error.message);
    return res.status(500).json({ message: 'Menu item creation failed.' });
  }
});

app.patch('/api/admin/menu/:id/availability', requireSession('admin'), async (req, res) => {
  const { id } = req.params;
  const { availability } = req.body;

  if (availability === undefined || availability === null) {
    return res.status(400).json({ message: 'Availability is required.' });
  }

  try {
    if (isDbConnected) {
      const item = await MenuItem.findById(id);
      if (!item) {
        return res.status(404).json({ message: 'Menu item not found.' });
      }

      item.availability = Boolean(availability);
      await item.save();
      return res.json({ message: 'Menu availability updated.', item: normalizeMenuItemFromDb(item.toObject()) });
    }

    const item = demoMenu.find((entry) => String(entry.id) === String(id));
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }

    item.availability = Boolean(availability);
    return res.json({ message: 'Menu availability updated.', item });
  } catch (error) {
    console.error('Menu availability update failed:', error.message);
    return res.status(500).json({ message: 'Failed to update menu availability.' });
  }
});

app.patch('/api/admin/menu/:id/price', requireSession('admin'), async (req, res) => {
  const { id } = req.params;
  const { price } = req.body;
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return res.status(400).json({ message: 'Please enter a valid price greater than zero.' });
  }

  try {
    if (isDbConnected) {
      const item = await MenuItem.findById(id);
      if (!item) {
        return res.status(404).json({ message: 'Menu item not found.' });
      }

      const previousPrice = Number(item.price || 0);
      item.price = numericPrice;
      await item.save();
      return res.json({
        message: 'Menu price updated.',
        item: normalizeMenuItemFromDb(item.toObject()),
        previousPrice,
        newPrice: numericPrice,
        change: numericPrice - previousPrice,
      });
    }

    const item = demoMenu.find((entry) => String(entry.id) === String(id));
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }

    const previousPrice = Number(item.price || 0);
    item.price = numericPrice;
    return res.json({
      message: 'Menu price updated.',
      item,
      previousPrice,
      newPrice: numericPrice,
      change: numericPrice - previousPrice,
    });
  } catch (error) {
    console.error('Menu price update failed:', error.message);
    return res.status(500).json({ message: 'Failed to update menu price.' });
  }
});

const connectDatabase = async () => {
  try {
    isDbConnected = await connectDB();
    if (isDbConnected) {
      await seedDatabaseDefaults();
      console.log('MongoDB connection successful.');
    } else {
      console.log('MongoDB unavailable. Continuing in demo mode.');
    }
  } catch (error) {
    isDbConnected = false;
    console.log('MongoDB unavailable. Continuing in demo mode:', error.message);
  }
};

if (require.main === module) {
  connectDatabase();
  app.listen(port, () => {
    console.log(`Cafe Connect server running on port ${port}`);
  });
}

module.exports = {
  app,
  demoMenu,
  demoUsers,
  demoOrders,
  activeSessions,
  passwordResetCodes,
  createSession,
  requireSession,
};

