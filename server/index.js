const express = require('express');
const cors = require('cors');
const db = require('./db');
const { hashPassword, verifyPassword } = require('./auth');

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://cafe-connect-51tz.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

const DEFAULT_ADMIN_EMAIL = 'admin@cafeconnect.com';
const DEFAULT_ADMIN_PASSWORD = 'admin123';
const demoUsers = [];
const demoMenu = [
  {
    id: 1,
    item_name: 'Chicken Burger',
    description: 'Grilled chicken burger with lettuce, tomato, and a special sauce.',
    price: 220,
    availability: true,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    item_name: 'Cheese Pizza',
    description: 'Freshly baked pizza topped with cheese and tomato sauce.',
    price: 260,
    availability: true,
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    item_name: 'Rice and Curry',
    description: 'Traditional rice and curry meal served hot and fresh.',
    price: 180,
    availability: true,
    image_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    item_name: 'Fruit Smoothie',
    description: 'A smooth mix of fruits for a healthy and refreshing drink.',
    price: 150,
    availability: true,
    image_url: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=80',
  },
];
const demoOrders = [];
let isDbConnected = false;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

const normalizeMenuItem = (item) => ({
  id: item.menu_item_id || item.id,
  item_name: item.item_name || item.name,
  name: item.item_name || item.name,
  description: item.description || '',
  price: Number(item.price || 0),
  availability: item.availability ?? true,
  image_url: item.image_url || item.image || '',
  image: item.image_url || item.image || '',
});

const normalizeUser = (user) => ({
  id: user.student_id || user.id,
  name: user.name,
  email: user.email,
});

const respondWithMenu = (items = []) => items.map(normalizeMenuItem);

const matchPassword = async (inputPassword, storedPassword) => {
  if (!storedPassword) return false;
  if (typeof storedPassword === 'string' && storedPassword.startsWith('$2')) {
    return verifyPassword(inputPassword, storedPassword);
  }
  return inputPassword === storedPassword;
};

app.get('/', (req, res) => {
  res.json({ message: 'Cafe Connect API is running' });
});

app.get('/api/menu', async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.json(respondWithMenu(demoMenu));
    }
    const [rows] = await db.promise().query('SELECT * FROM menu_items ORDER BY menu_item_id DESC');
    return res.json(respondWithMenu(rows));
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
    if (!isDbConnected) {
      const existing = demoUsers.find((user) => user.email === safeEmail);
      if (existing) {
        return res.status(409).json({ message: 'User already exists.' });
      }

      const passwordHash = await hashPassword(safePassword);
      const user = { id: Date.now(), name: safeName, email: safeEmail, password: passwordHash };
      demoUsers.push(user);
      return res.status(201).json({ message: 'Student registered successfully.', student: normalizeUser(user) });
    }

    const [existing] = await db.promise().query('SELECT * FROM students WHERE email = ?', [safeEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'User already exists.' });
    }

    const passwordHash = await hashPassword(safePassword);
    const [result] = await db.promise().query('INSERT INTO students (name, email, password) VALUES (?, ?, ?)', [safeName, safeEmail, passwordHash]);
    return res.status(201).json({ message: 'Student registered successfully.', student: { id: result.insertId, name: safeName, email: safeEmail } });
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
    if (!isDbConnected) {
      const user = demoUsers.find((entry) => entry.email === safeEmail);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const valid = await matchPassword(safePassword, user.password);
      if (!valid) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      return res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email } });
    }

    const [rows] = await db.promise().query('SELECT * FROM students WHERE email = ?', [safeEmail]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = rows[0];
    const valid = await matchPassword(safePassword, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    return res.json({ message: 'Login successful', user: { id: user.student_id, name: user.name, email: user.email } });
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
    if (!isDbConnected) {
      const admin = {
        id: 1,
        name: 'System Admin',
        email: DEFAULT_ADMIN_EMAIL,
        password: await hashPassword(DEFAULT_ADMIN_PASSWORD),
      };

      if (safeEmail !== admin.email) {
        return res.status(401).json({ message: 'Invalid admin email or password.' });
      }

      const valid = await matchPassword(safePassword, admin.password);
      if (!valid) {
        return res.status(401).json({ message: 'Invalid admin email or password.' });
      }

      return res.json({ message: 'Admin login successful', admin: { id: admin.id, name: admin.name, email: admin.email } });
    }

    const [rows] = await db.promise().query('SELECT * FROM administrators WHERE email = ?', [safeEmail]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid admin email or password.' });
    }

    const admin = rows[0];
    const valid = await matchPassword(safePassword, admin.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid admin email or password.' });
    }

    return res.json({ message: 'Admin login successful', admin: { id: admin.admin_id, name: admin.name, email: admin.email } });
  } catch (error) {
    console.error('Admin login failed:', error.message);
    return res.status(500).json({ message: 'Admin login failed.' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { items, paymentMethod, customerName = 'Student', studentId = null } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Order must contain at least one item.' });
  }

  try {
    const orderNumber = `CC-${Math.floor(1000 + Math.random() * 9000)}`;
    const total = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

    if (!isDbConnected) {
      const order = { id: Date.now(), orderNumber, customerName, totalAmount: total, paymentMethod, status: 'Pending', items };
      demoOrders.push(order);
      return res.status(201).json({ message: 'Order placed successfully.', orderNumber, totalAmount: total, paymentMethod, orderId: order.id });
    }

    const [orderResult] = await db.promise().query('INSERT INTO orders (student_id, total_amount, order_status, order_number) VALUES (?, ?, ?, ?)', [studentId || null, total, 'Pending', orderNumber]);
    const orderId = orderResult.insertId;

    for (const item of items) {
      await db.promise().query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, item_price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.id, Number(item.quantity || 1), Number(item.price || 0), Number(item.price || 0) * Number(item.quantity || 1)]
      );
    }

    await db.promise().query('INSERT INTO payments (order_id, payment_method, payment_amount, payment_status) VALUES (?, ?, ?, ?)', [orderId, paymentMethod || 'Cash', total, 'Pending']);
    return res.status(201).json({ message: 'Order placed successfully.', orderNumber, totalAmount: total, paymentMethod: paymentMethod || 'Cash', orderId });
  } catch (error) {
    console.error('Order creation failed:', error.message);
    return res.status(500).json({ message: 'Order creation failed.' });
  }
});

app.get('/api/admin/students', async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.json(demoUsers.map((user) => ({ id: user.id, name: user.name, email: user.email })));
    }

    const [rows] = await db.promise().query('SELECT student_id AS id, name, email, registration_date FROM students ORDER BY student_id DESC');
    return res.json(rows);
  } catch (error) {
    console.error('Admin students fetch failed:', error.message);
    return res.status(500).json({ message: 'Could not load students.' });
  }
});

app.post('/api/admin/students', async (req, res) => {
  const { name, email, password } = req.body;
  const safeName = String(name || '').trim();
  const safeEmail = String(email || '').trim().toLowerCase();
  const safePassword = String(password || '').trim();

  if (!safeName || !safeEmail || !safePassword) {
    return res.status(400).json({ message: 'Student name, email and password are required.' });
  }

  try {
    if (!isDbConnected) {
      const existing = demoUsers.find((user) => user.email === safeEmail);
      if (existing) {
        return res.status(409).json({ message: 'Student already exists.' });
      }

      const passwordHash = await hashPassword(safePassword);
      const user = { id: Date.now(), name: safeName, email: safeEmail, password: passwordHash };
      demoUsers.push(user);
      return res.status(201).json({ message: 'Student account created.', student: normalizeUser(user) });
    }

    const [existing] = await db.promise().query('SELECT * FROM students WHERE email = ?', [safeEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Student already exists.' });
    }

    const passwordHash = await hashPassword(safePassword);
    const [result] = await db.promise().query('INSERT INTO students (name, email, password) VALUES (?, ?, ?)', [safeName, safeEmail, passwordHash]);
    return res.status(201).json({ message: 'Student account created.', student: { id: result.insertId, name: safeName, email: safeEmail } });
  } catch (error) {
    console.error('Admin student creation failed:', error.message);
    return res.status(500).json({ message: 'Student creation failed.' });
  }
});

app.patch('/api/admin/students/:id/reset-password', async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  const safePassword = String(newPassword || '').trim();

  if (!safePassword) {
    return res.status(400).json({ message: 'A new password is required.' });
  }

  try {
    if (!isDbConnected) {
      const student = demoUsers.find((user) => String(user.id) === String(id));
      if (!student) {
        return res.status(404).json({ message: 'Student not found.' });
      }
      student.password = await hashPassword(safePassword);
      return res.json({ message: 'Student password reset successfully.' });
    }

    const passwordHash = await hashPassword(safePassword);
    await db.promise().query('UPDATE students SET password = ? WHERE student_id = ?', [passwordHash, id]);
    return res.json({ message: 'Student password reset successfully.' });
  } catch (error) {
    console.error('Password reset failed:', error.message);
    return res.status(500).json({ message: 'Password reset failed.' });
  }
});

app.get('/api/admin/orders', async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.json(demoOrders.map((order) => ({ order_id: order.id, order_number: order.orderNumber, order_status: order.status, total_amount: order.totalAmount, customer_name: order.customerName })));
    }

    const [rows] = await db.promise().query(
      `SELECT o.order_id, o.order_number, o.order_status, o.total_amount, s.name AS customer_name
       FROM orders o
       LEFT JOIN students s ON s.student_id = o.student_id
       ORDER BY o.order_date DESC`
    );
    return res.json(rows);
  } catch (error) {
    console.error('Admin orders fetch failed:', error.message);
    return res.json(demoOrders);
  }
});

app.patch('/api/admin/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required.' });
  }

  try {
    if (!isDbConnected) {
      const order = demoOrders.find((entry) => String(entry.id) === String(id));
      if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
      }
      order.status = status;
      return res.json({ message: 'Order status updated.', order });
    }

    await db.promise().query('UPDATE orders SET order_status = ? WHERE order_id = ?', [status, id]);
    return res.json({ message: 'Order status updated.' });
  } catch (error) {
    console.error('Order status update failed:', error.message);
    return res.status(500).json({ message: 'Order status update failed.' });
  }
});

app.get('/api/admin/menu', async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.json(respondWithMenu(demoMenu));
    }

    const [rows] = await db.promise().query('SELECT * FROM menu_items ORDER BY menu_item_id DESC');
    return res.json(respondWithMenu(rows));
  } catch (error) {
    console.error('Admin menu load failed:', error.message);
    return res.status(500).json({ message: 'Could not load menu items.' });
  }
});

app.post('/api/admin/menu', async (req, res) => {
  const { item_name, description, price, image_url } = req.body;

  if (!item_name || !description || !price) {
    return res.status(400).json({ message: 'Item name, description and price are required.' });
  }

  try {
    if (!isDbConnected) {
      const item = { id: Date.now(), item_name, description, price: Number(price), availability: true, image_url: image_url || demoMenu[0].image_url };
      demoMenu.unshift(item);
      return res.status(201).json({ message: 'Menu item created.', item });
    }

    const [result] = await db.promise().query('INSERT INTO menu_items (item_name, description, price, availability, image_url) VALUES (?, ?, ?, ?, ?)', [item_name, description, Number(price), true, image_url || '']);
    return res.status(201).json({ message: 'Menu item created.', item: { id: result.insertId, item_name, description, price: Number(price), availability: true, image_url: image_url || '' } });
  } catch (error) {
    console.error('Admin menu create failed:', error.message);
    return res.status(500).json({ message: 'Menu item creation failed.' });
  }
});

app.patch('/api/admin/menu/:id/availability', async (req, res) => {
  const { id } = req.params;
  const { availability } = req.body;

  if (availability === undefined || availability === null) {
    return res.status(400).json({ message: 'Availability is required.' });
  }

  try {
    if (!isDbConnected) {
      const item = demoMenu.find((entry) => String(entry.id) === String(id));
      if (!item) {
        return res.status(404).json({ message: 'Menu item not found.' });
      }
      item.availability = Boolean(availability);
      return res.json({ message: 'Menu availability updated.', item });
    }

    const [rows] = await db.promise().query('SELECT * FROM menu_items WHERE menu_item_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }

    await db.promise().query('UPDATE menu_items SET availability = ? WHERE menu_item_id = ?', [Boolean(availability), id]);
    return res.json({ message: 'Menu availability updated.', item: normalizeMenuItem(rows[0]) });
  } catch (error) {
    console.error('Menu availability update failed:', error.message);
    return res.status(500).json({ message: 'Failed to update menu availability.' });
  }
});

const ensureDefaultAdmin = async () => {
  try {
    const [rows] = await db.promise().query('SELECT admin_id FROM administrators WHERE email = ?', [DEFAULT_ADMIN_EMAIL]);
    if (rows.length > 0) {
      return;
    }

    const passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);
    await db.promise().query('INSERT INTO administrators (name, email, password) VALUES (?, ?, ?)', ['System Admin', DEFAULT_ADMIN_EMAIL, passwordHash]);
    console.log(`Created default admin account: ${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASSWORD}`);
  } catch (error) {
    console.error('Default admin account setup failed:', error.message);
  }
};

const connectDatabase = () => {
  db.connect((err) => {
    if (err) {
      isDbConnected = false;
      console.log('MySQL connection failed. The app will continue in demo mode:', err.message);
      return;
    }

    isDbConnected = true;
    console.log('Connected to MySQL database.');
    ensureDefaultAdmin();
  });
};

connectDatabase();

app.listen(port, () => {
  console.log(`Cafe Connect server running on port ${port}`);
});
