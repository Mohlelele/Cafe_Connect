const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const port = process.env.PORT || 5000;

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

app.use(cors());
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
  password: user.password,
});

const respondWithMenu = (items) => items.map(normalizeMenuItem);

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

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    if (!isDbConnected) {
      const existing = demoUsers.find((user) => user.email === email);
      if (existing) {
        return res.status(409).json({ message: 'User already exists.' });
      }

      const user = { id: Date.now(), name, email, password };
      demoUsers.push(user);
      return res.status(201).json({
        message: 'Student registered successfully.',
        student: normalizeUser(user),
      });
    }

    const [existing] = await db.promise().query('SELECT * FROM students WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'User already exists.' });
    }

    const [result] = await db.promise().query(
      'INSERT INTO students (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );

    return res.status(201).json({
      message: 'Student registered successfully.',
      student: { id: result.insertId, name, email },
    });
  } catch (error) {
    console.error('Register failed:', error.message);
    return res.status(500).json({ message: 'Registration failed.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    if (!isDbConnected) {
      const user = demoUsers.find((entry) => entry.email === email && entry.password === password);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      return res.json({
        message: 'Login successful',
        user: { id: user.id, name: user.name, email: user.email },
      });
    }

    const [rows] = await db.promise().query('SELECT * FROM students WHERE email = ? AND password = ?', [email, password]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = rows[0];
    return res.json({
      message: 'Login successful',
      user: { id: user.student_id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Login failed:', error.message);
    return res.status(500).json({ message: 'Login failed.' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { items, paymentMethod, customerName = 'Student' } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Order must contain at least one item.' });
  }

  try {
    const orderNumber = `CC-${Math.floor(1000 + Math.random() * 9000)}`;
    const total = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

    if (!isDbConnected) {
      const order = {
        id: Date.now(),
        orderNumber,
        customerName,
        totalAmount: total,
        paymentMethod,
        status: 'Pending',
        items,
      };
      demoOrders.push(order);
      return res.status(201).json({
        message: 'Order placed successfully.',
        orderNumber,
        totalAmount: total,
        paymentMethod,
        orderId: order.id,
      });
    }

    const [orderResult] = await db.promise().query(
      'INSERT INTO orders (student_id, total_amount, order_status, order_number) VALUES (?, ?, ?, ?)',
      [null, total, 'Pending', orderNumber]
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      await db.promise().query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, item_price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.id, Number(item.quantity || 1), Number(item.price || 0), Number(item.price || 0) * Number(item.quantity || 1)]
      );
    }

    await db.promise().query(
      'INSERT INTO payments (order_id, payment_method, payment_amount, payment_status) VALUES (?, ?, ?, ?)',
      [orderId, paymentMethod || 'Cash', total, 'Pending']
    );

    return res.status(201).json({
      message: 'Order placed successfully.',
      orderNumber,
      totalAmount: total,
      paymentMethod: paymentMethod || 'Cash',
      orderId,
    });
  } catch (error) {
    console.error('Order creation failed:', error.message);
    return res.status(500).json({ message: 'Order creation failed.' });
  }
});

app.get('/api/admin/orders', async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.json(demoOrders);
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

app.post('/api/admin/menu', async (req, res) => {
  const { item_name, description, price, image_url } = req.body;

  if (!item_name || !description || !price) {
    return res.status(400).json({ message: 'Item name, description and price are required.' });
  }

  try {
    if (!isDbConnected) {
      const item = {
        id: Date.now(),
        item_name,
        description,
        price: Number(price),
        availability: true,
        image_url: image_url || demoMenu[0].image_url,
      };
      demoMenu.unshift(item);
      return res.status(201).json({ message: 'Menu item created.', item });
    }

    const [result] = await db.promise().query(
      'INSERT INTO menu_items (item_name, description, price, availability, image_url) VALUES (?, ?, ?, ?, ?)',
      [item_name, description, Number(price), true, image_url || '']
    );

    return res.status(201).json({
      message: 'Menu item created.',
      item: { id: result.insertId, item_name, description, price: Number(price), availability: true },
    });
  } catch (error) {
    console.error('Admin menu create failed:', error.message);
    return res.status(500).json({ message: 'Menu item creation failed.' });
  }
});

const connectDatabase = () => {
  db.connect((err) => {
    if (err) {
      isDbConnected = false;
      console.log('MySQL connection failed. The app will continue in demo mode:', err.message);
      return;
    }

    isDbConnected = true;
    console.log('Connected to MySQL database.');
  });
};

connectDatabase();

app.listen(port, () => {
  console.log(`Cafe Connect server running on port ${port}`);
});
