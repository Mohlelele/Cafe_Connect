const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const connectDB = require('./db');
const { hashPassword, verifyPassword } = require('./auth');

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
  { id: 1, item_name: 'Vanilla Scoop', description: 'Classic vanilla bean scoop with a creamy finish.', price: 18, availability: true, image_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=80' },
  { id: 2, item_name: 'Strawberry Swirl', description: 'Fresh strawberry flavour with a smooth and fruity taste.', price: 17, availability: true, image_url: 'https://images.unsplash.com/photo-1570197788417-0e823ef4b269?auto=format&fit=crop&w=900&q=80' },
  { id: 3, item_name: 'Chocolate Fudge', description: 'Rich chocolate ice cream topped with silky fudge.', price: 20, availability: true, image_url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=80' },
  { id: 4, item_name: 'Mint Delight', description: 'Cool mint ice cream with a refreshing finish.', price: 16, availability: true, image_url: 'https://images.unsplash.com/photo-1576708829420-7dd43d3cff5d?auto=format&fit=crop&w=900&q=80' },
  { id: 5, item_name: 'Coconut Crunch', description: 'Creamy coconut scoop with toasted crunch pieces.', price: 19, availability: true, image_url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=80' },
  { id: 6, item_name: 'Caramel Cone', description: 'Smooth caramel ice cream served in a crisp cone.', price: 18, availability: true, image_url: 'https://images.unsplash.com/photo-1525059696034-4967a729002e?auto=format&fit=crop&w=900&q=80' },
  { id: 7, item_name: 'Berry Blast', description: 'Mixed berry flavour with a sweet, juicy finish.', price: 15, availability: true, image_url: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=900&q=80' },
  { id: 8, item_name: 'Cookie Sundae', description: 'Ice cream layered with cookie pieces and sauce.', price: 20, availability: true, image_url: 'https://images.unsplash.com/photo-1560008581-09826d1de69f?auto=format&fit=crop&w=900&q=80' },
  { id: 9, item_name: 'Peanut Butter Cup', description: 'Creamy peanut butter ice cream with chocolate bites.', price: 19, availability: true, image_url: 'https://images.unsplash.com/photo-1582716401301-b2407dc7563d?auto=format&fit=crop&w=900&q=80' },
  { id: 10, item_name: 'Bubblegum Pop', description: 'Fun, sweet bubblegum flavour for a playful treat.', price: 15, availability: true, image_url: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?auto=format&fit=crop&w=900&q=80' },
  { id: 11, item_name: 'Coffee Cream', description: 'Smooth coffee ice cream with a rich creamy finish.', price: 18, availability: true, image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80' },
  { id: 12, item_name: 'Mango Chill', description: 'Fresh mango ice cream with a tropical, sunny taste.', price: 17, availability: true, image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80' },
];

const demoOrders = [];
const activeSessions = new Map();
const passwordResetCodes = new Map();
let isDbConnected = false;

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

const respondWithMenu = (items = []) => items.map(normalizeMenuItem);

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
    const studentOrders = demoOrders.filter((order) => String(order.studentId) === String(req.session.userId));
    return res.json(studentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName || req.session.name,
      studentId: order.studentId,
      totalAmount: Number(order.totalAmount || 0),
      paymentMethod: order.paymentMethod || 'Cash',
      status: order.status || 'Pending',
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
    return res.json(demoOrders.map((order) => {
      const itemNames = (order.items || []).map((item) => item.name || item.item_name || `${Number(item.quantity || 1)}x item`);
      const firstItem = itemNames[0] || 'Cafe order';
      const customerName = order.customerName || 'Student';
      const student = demoUsers.find((user) => String(user.id) === String(order.studentId));

      return {
        order_id: order.id,
        order_number: order.orderNumber,
        order_status: order.status,
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
    const order = demoOrders.find((entry) => String(entry.id) === String(id));
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    order.status = status;
    return res.json({ message: 'Order status updated.', order });
  } catch (error) {
    console.error('Order status update failed:', error.message);
    return res.status(500).json({ message: 'Order status update failed.' });
  }
});

app.get('/api/admin/menu', requireSession('admin'), async (req, res) => {
  try {
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
    const item = demoMenu.find((entry) => String(entry.id) === String(id));
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }

    item.price = numericPrice;
    return res.json({ message: 'Menu price updated.', item });
  } catch (error) {
    console.error('Menu price update failed:', error.message);
    return res.status(500).json({ message: 'Failed to update menu price.' });
  }
});

const connectDatabase = async () => {
  try {
    await connectDB();
    isDbConnected = true;
    console.log('MongoDB connection successful.');
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

