const isLocalOrPrivateNetworkHost = (hostname) => {
  if (!hostname) return false;

  return /localhost|127\.0\.0\.1/i.test(hostname)
    || /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/i.test(hostname)
    || /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
};

export const API_URL = (() => {
  const configuredUrl = import.meta.env.VITE_API_URL;

  if (configuredUrl && String(configuredUrl).trim()) {
    return String(configuredUrl).trim().replace(/\/$/, '');
  }

  if (typeof window === 'undefined') {
    return 'http://localhost:5000';
  }

  const { protocol, hostname } = window.location;

  if (isLocalOrPrivateNetworkHost(hostname)) {
    return `${protocol}//${hostname}:5000`;
  }

  return '';
})();

const shouldUseDemoMode = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const hasConfiguredApi = !!import.meta.env.VITE_API_URL && String(import.meta.env.VITE_API_URL).trim() !== '';
  const isLocalOrPrivate = isLocalOrPrivateNetworkHost(window.location.hostname);
  const isLiveVercelHost = /vercel\.app$/i.test(window.location.hostname) && !/localhost/i.test(window.location.hostname);

  if (hasConfiguredApi || isLocalOrPrivate) {
    return false;
  }

  return isLiveVercelHost;
};

const DEMO_USERS = {
  student: {
    id: 1,
    name: 'Mathapelo Mokoena',
    email: 'mathapelo@cafeconnect.com',
    password: 'student123',
  },
  admin: {
    id: 99,
    name: 'Cafe Connect Admin',
    email: 'admin@cafeconnect.com',
    password: 'admin123',
  },
};

const DEMO_MENU = [
  { id: 1, item_name: 'Chicken Burger', description: 'Grilled chicken burger with lettuce, tomato, and special sauce.', price: 48, availability: true, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80' },
  { id: 2, item_name: 'Cheese Pizza', description: 'Freshly baked pizza topped with cheese and tomato sauce.', price: 55, availability: true, image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80' },
  { id: 3, item_name: 'Rice and Curry', description: 'Traditional rice and curry meal served hot and fresh.', price: 42, availability: true, image_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80' },
  { id: 4, item_name: 'Fruit Smoothie', description: 'Fresh fruit smoothie for a light and energising boost.', price: 24, availability: true, image_url: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=80' },
  { id: 5, item_name: 'Cappuccino', description: 'Creamy espresso-based cappuccino topped with velvety foam.', price: 22, availability: true, image_url: 'https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=900&q=80' },
  { id: 6, item_name: 'Iced Latte', description: 'Smooth iced latte with a hint of vanilla sweetness.', price: 24, availability: true, image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80' },
  { id: 7, item_name: 'Mango Juice', description: 'Cold mango juice bursting with tropical flavour.', price: 18, availability: true, image_url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=900&q=80' },
  { id: 9, item_name: 'Veggie Pasta', description: 'Creamy veggie pasta with roasted vegetables and herbs.', price: 46, availability: true, image_url: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=900&q=80' },
  { id: 10, item_name: 'Choc Chip Muffin', description: 'Warm muffin packed with rich chocolate chips.', price: 16, availability: true, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80' },
  { id: 11, item_name: 'Masala Tea', description: 'A fragrant, comforting masala tea served hot.', price: 14, availability: true, image_url: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=900&q=80' },
  { id: 12, item_name: 'Breakfast Combo', description: 'Eggs, toast, grilled tomato, and a fresh side salad.', price: 40, availability: true, image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80' },
];

const getStoredDemoUsers = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const saved = window.localStorage.getItem('cafe-connect-demo-users');
    if (!saved) {
      return [];
    }
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

const saveDemoUsers = (users) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('cafe-connect-demo-users', JSON.stringify(users));
  }
};

const getAllDemoUsers = () => {
  const savedUsers = getStoredDemoUsers();
  const merged = [...savedUsers];
  const ids = new Set(merged.map((user) => user.email));

  ['student', 'admin'].forEach((role) => {
    if (!ids.has(DEMO_USERS[role].email)) {
      merged.push(DEMO_USERS[role]);
    }
  });

  saveDemoUsers(merged);
  return merged;
};

const getStoredDemoOrders = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const saved = window.localStorage.getItem('cafe-connect-demo-orders');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const getCurrentStudent = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const saved = window.localStorage.getItem('cafe-connect-student');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const saveDemoOrders = (orders) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('cafe-connect-demo-orders', JSON.stringify(orders));
  }
};

const parseJsonBody = (body) => {
  if (!body) {
    return {};
  }

  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }

  return body;
};

const demoResponseFor = (endpoint, options = {}) => {
  const data = parseJsonBody(options.body);

  if (endpoint === '/api/menu') {
    return DEMO_MENU;
  }

  if (endpoint === '/api/login') {
    const user = getAllDemoUsers().find((entry) => entry.email === String(data.email || '').trim().toLowerCase() && entry.password === String(data.password || ''));

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    return {
      message: 'Login successful',
      token: `demo-student-token-${user.id}`,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }

  if (endpoint === '/api/admin/login') {
    const user = getAllDemoUsers().find((entry) => entry.email === String(data.email || '').trim().toLowerCase() && entry.password === String(data.password || ''));

    if (!user || user.email !== DEMO_USERS.admin.email) {
      throw new Error('Invalid admin email or password.');
    }

    return {
      message: 'Admin login successful',
      token: `demo-admin-token-${user.id}`,
      admin: { id: user.id, name: user.name, email: user.email },
    };
  }

  if (endpoint === '/api/register') {
    const name = String(data.name || '').trim();
    const email = String(data.email || '').trim().toLowerCase();
    const password = String(data.password || '').trim();

    if (!name || !email || !password) {
      throw new Error('All fields are required.');
    }

    const users = getAllDemoUsers();
    const exists = users.some((entry) => entry.email === email);

    if (exists) {
      throw new Error('User already exists.');
    }

    const newUser = { id: Date.now(), name, email, password };
    users.push(newUser);
    saveDemoUsers(users);

    return {
      message: 'Student registered successfully.',
      student: { id: newUser.id, name: newUser.name, email: newUser.email },
    };
  }

  if (endpoint === '/api/orders') {
    if (options.method === 'POST') {
      const totalAmount = Number((data.items || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0));
      const order = {
        id: Date.now(),
        orderNumber: `CC-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: data.customerName || 'Student',
        studentId: data.studentId || getCurrentStudent()?.id || 1,
        totalAmount,
        paymentMethod: data.paymentMethod || 'Cash',
        status: 'Pending',
        items: data.items || [],
        createdAt: new Date().toISOString(),
      };

      const orders = getStoredDemoOrders();
      orders.unshift(order);
      saveDemoOrders(orders);

      return {
        message: 'Order placed successfully.',
        orderNumber: order.orderNumber,
        totalAmount,
        paymentMethod: order.paymentMethod,
        orderId: order.id,
      };
    }

    const currentStudent = getCurrentStudent();
    const orders = getStoredDemoOrders();
    if (!currentStudent) {
      return orders;
    }

    return orders.filter((order) => String(order.studentId) === String(currentStudent.id));
  }

  if (endpoint === '/api/admin/menu') {
    if (options.method === 'POST') {
      const newItem = {
        id: Date.now(),
        item_name: data.item_name,
        description: data.description,
        price: Number(data.price || 0),
        availability: true,
        image_url: data.image_url || DEMO_MENU[0].image_url,
      };
      DEMO_MENU.unshift(newItem);
      return { message: 'Menu item created.', item: newItem };
    }

    return DEMO_MENU;
  }

  if (endpoint.startsWith('/api/admin/menu/')) {
    if (endpoint.includes('/availability')) {
      const itemId = Number(endpoint.split('/')[4]);
      const item = DEMO_MENU.find((entry) => Number(entry.id) === itemId);
      if (!item) {
        throw new Error('Menu item not found.');
      }
      item.availability = !!(data.availability ?? item.availability);
      return { message: 'Menu availability updated.', item };
    }

    if (endpoint.includes('/price')) {
      const itemId = Number(endpoint.split('/')[4]);
      const item = DEMO_MENU.find((entry) => Number(entry.id) === itemId);
      if (!item) {
        throw new Error('Menu item not found.');
      }
      const previousPrice = Number(item.price || 0);
      const nextPrice = Number(data.price ?? previousPrice);
      item.price = nextPrice;
      const difference = nextPrice - previousPrice;
      return {
        message: 'Menu price updated.',
        item,
        previousPrice,
        newPrice: nextPrice,
        change: difference,
      };
    }

    return { message: 'Demo action completed.' };
  }

  if (endpoint === '/api/admin/orders') {
    const liveOrders = getStoredDemoOrders();
    if (liveOrders.length > 0) {
      return liveOrders.map((order) => ({
        order_id: order.id,
        order_number: order.orderNumber,
        orderNumber: order.orderNumber,
        customer_name: order.customerName || 'Student',
        item_name: (order.items || []).map((entry) => entry.name || entry.item_name || 'item').join(', ') || 'Cafe order',
        total_amount: Number(order.totalAmount || 0),
        order_status: order.status || 'Pending',
        items: order.items || [],
        created_at: order.createdAt,
      }));
    }

    return [
      { order_id: 101, order_number: 'CC-1001', orderNumber: 'CC-1001', customer_name: 'Mathapelo Mokoena', item_name: 'Chicken Burger', total_amount: 220, order_status: 'Pending' },
      { order_id: 102, order_number: 'CC-1002', orderNumber: 'CC-1002', customer_name: 'Lerato Ndlovu', item_name: 'Cappuccino', total_amount: 90, order_status: 'Prep' },
      { order_id: 103, order_number: 'CC-1003', orderNumber: 'CC-1003', customer_name: 'Sipho Khumalo', item_name: 'Rice and Curry', total_amount: 180, order_status: 'Ready' },
    ];
  }

  if (endpoint.startsWith('/api/admin/orders/')) {
    if (endpoint.includes('/status')) {
      const orderId = endpoint.split('/')[4];
      const orders = getStoredDemoOrders();
      const order = orders.find((entry) => String(entry.id) === String(orderId));
      if (order) {
        order.status = data.status || order.status;
        saveDemoOrders(orders);
        return { message: 'Order status updated.', order };
      }
      return { message: 'Order status updated.' };
    }

    return { message: 'Demo action completed.' };
  }

  if (endpoint === '/api/admin/students') {
    if (options.method === 'POST') {
      const users = getAllDemoUsers();
      const newUser = {
        id: Date.now(),
        name: data.name,
        email: String(data.email || '').trim().toLowerCase(),
        password: String(data.password || ''),
      };
      users.push(newUser);
      saveDemoUsers(users);
      return { message: 'Student account created.', student: { id: newUser.id, name: newUser.name, email: newUser.email } };
    }

    return getAllDemoUsers().filter((user) => user.email !== DEMO_USERS.admin.email).map((user) => ({ id: user.id, name: user.name, email: user.email }));
  }

  if (endpoint === '/api/forgot-password/request') {
    const email = String(data.email || '').trim().toLowerCase();
    if (!email) {
      throw new Error('Email is required.');
    }

    const users = getAllDemoUsers();
    const user = users.find((entry) => entry.email === email);
    if (!user) {
      throw new Error('No account found for that email.');
    }

    return {
      message: 'You can now set a new password for this account.',
      resetReady: true,
    };
  }

  if (endpoint === '/api/forgot-password') {
    const email = String(data.email || '').trim().toLowerCase();
    const password = String(data.newPassword || data.password || '').trim();

    if (!email || !password) {
      throw new Error('Email and a new password are required.');
    }

    const users = getAllDemoUsers();
    const user = users.find((entry) => entry.email === email);
    if (!user) {
      throw new Error('No account found for that email.');
    }

    user.password = password;
    saveDemoUsers(users);
    return { message: 'Password reset successful. Please log in with your new password.' };
  }

  if (endpoint.includes('/reset-password')) {
    return { message: 'Student password reset successfully.' };
  }

  return null;
};

export async function apiRequest(endpoint, options = {}) {
  const demoPayload = shouldUseDemoMode() ? demoResponseFor(endpoint, options) : null;
  if (demoPayload !== null) {
    return demoPayload;
  }

  const authToken = localStorage.getItem('cafe-connect-auth-token');
  const baseUrl = API_URL || '';

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(options.headers || {}),
      },
      credentials: 'include',
      ...options,
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      const demoPayload = demoResponseFor(endpoint, options);
      if (demoPayload !== null) {
        return demoPayload;
      }
      throw new Error(payload.message || 'Something went wrong.');
    }

    return payload;
  } catch (error) {
    const demoPayload = demoResponseFor(endpoint, options);
    if (demoPayload !== null) {
      return demoPayload;
    }

    throw error;
  }
}
