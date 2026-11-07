const test = require('node:test');
const assert = require('node:assert/strict');
const { app, demoMenu, demoUsers, demoOrders, passwordResetCodes, createSession } = require('./index.js');
const { hashPassword, verifyPassword } = require('./auth');

function makeRequest(path, { method = 'GET', body, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const port = server.address().port;
      const http = require('node:http');
      const payload = body ? Buffer.from(body, 'utf8') : undefined;

      const request = http.request({
        host: '127.0.0.1',
        port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        },
      }, (response) => {
        let responseBody = '';
        response.on('data', (chunk) => {
          responseBody += chunk;
        });
        response.on('end', () => {
          server.close();
          resolve({
            statusCode: response.statusCode,
            body: responseBody,
            json: (() => {
              try {
                return JSON.parse(responseBody);
              } catch {
                return null;
              }
            })(),
          });
        });
      });

      request.on('error', (error) => {
        server.close();
        reject(error);
      });

      if (payload) {
        request.write(payload);
      }
      request.end();
    });
  });
}

test('student can fetch their own orders from the authenticated session', async () => {
  const user = {
    id: Date.now(),
    name: 'Test Student',
    email: `teststudent${Date.now()}@example.com`,
    password: await hashPassword('Password123!'),
  };

  demoUsers.push(user);
  const token = createSession('student', user);
  const order = {
    id: Date.now(),
    orderNumber: 'CC-1234',
    customerName: user.name,
    studentId: user.id,
    totalAmount: 140,
    paymentMethod: 'Cash',
    status: 'Pending',
    items: [{ name: 'Chicken Burger', price: 70, quantity: 2 }],
  };
  demoOrders.push(order);

  const response = await makeRequest('/api/orders', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(Array.isArray(response.json), true);
  assert.equal(response.json.some((entry) => entry.id === order.id), true);
});

test('forgot password can reset directly without an otp code', async () => {
  const email = `resetstudent${Date.now()}@example.com`;
  const user = {
    id: Date.now(),
    name: 'Reset Student',
    email,
    password: await hashPassword('OldPassword123!'),
  };

  demoUsers.push(user);

  const requestResponse = await makeRequest('/api/forgot-password/request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

  assert.equal(requestResponse.statusCode, 200);
  assert.equal(requestResponse.json.message.includes('You can now set a new password') || requestResponse.json.message.includes('Reset your password'), true);

  const resetResponse = await makeRequest('/api/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email, newPassword: 'NewPassword456!' }),
  });

  const updatedUser = demoUsers.find((entry) => entry.email === email);

  assert.equal(resetResponse.statusCode, 200);
  assert.ok(updatedUser);
  assert.equal(await verifyPassword('NewPassword456!', updatedUser.password), true);
  assert.equal(await verifyPassword('OldPassword123!', updatedUser.password), false);
});

test('admin sees a newly placed student order in the queue', async () => {
  const user = {
    id: Date.now(),
    name: 'Queue Student',
    email: `queue${Date.now()}@example.com`,
    password: await hashPassword('QueuePass123!'),
  };

  demoUsers.push(user);
  const token = createSession('student', user);
  const order = {
    id: Date.now(),
    orderNumber: 'CC-8888',
    customerName: user.name,
    studentId: user.id,
    totalAmount: 999,
    paymentMethod: 'Card',
    status: 'Pending',
    items: [{ name: 'Chicken Burger', price: 999, quantity: 1 }],
  };
  demoOrders.push(order);

  const adminToken = createSession('admin', demoUsers.find((entry) => entry.email === 'admin@cafeconnect.com'));
  const response = await makeRequest('/api/admin/orders', {
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(Array.isArray(response.json), true);
  assert.equal(response.json.some((entry) => entry.customer_name === user.name && entry.order_number === 'CC-8888'), true);
});

test('status updates from admin are reflected in the student order list', async () => {
  const user = {
    id: Date.now(),
    name: 'Status Sync Student',
    email: `statussync${Date.now()}@example.com`,
    password: await hashPassword('Status123!'),
  };

  demoUsers.push(user);
  const studentToken = createSession('student', user);
  const order = {
    id: Date.now(),
    orderNumber: 'CC-5522',
    customerName: user.name,
    studentId: user.id,
    totalAmount: 210,
    paymentMethod: 'Cash',
    status: 'Pending',
    items: [{ name: 'Loaded Chicken Wrap', price: 210, quantity: 1 }],
  };
  demoOrders.push(order);

  const adminToken = createSession('admin', demoUsers.find((entry) => entry.email === 'admin@cafeconnect.com'));
  const updateResponse = await makeRequest(`/api/admin/orders/${order.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'Ready' }),
  });

  assert.equal(updateResponse.statusCode, 200);

  const studentResponse = await makeRequest('/api/orders', {
    method: 'GET',
    headers: { Authorization: `Bearer ${studentToken}` },
  });

  assert.equal(studentResponse.statusCode, 200);
  assert.equal(studentResponse.json.some((entry) => entry.id === order.id && entry.status === 'Ready'), true);
});

test('admin status updates are normalized to the canonical pending and ready states', async () => {
  const user = {
    id: Date.now(),
    name: 'Canonical Status Student',
    email: `canonical${Date.now()}@example.com`,
    password: await hashPassword('Status123!'),
  };

  demoUsers.push(user);
  const studentToken = createSession('student', user);
  const order = {
    id: Date.now(),
    orderNumber: 'CC-9988',
    customerName: user.name,
    studentId: user.id,
    totalAmount: 180,
    paymentMethod: 'Card',
    status: 'Pending',
    items: [{ name: 'Loaded Chicken Wrap', price: 180, quantity: 1 }],
  };
  demoOrders.push(order);

  const adminToken = createSession('admin', demoUsers.find((entry) => entry.email === 'admin@cafeconnect.com'));
  const updateResponse = await makeRequest(`/api/admin/orders/${order.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'pending' }),
  });

  assert.equal(updateResponse.statusCode, 200);
  assert.equal(updateResponse.json.order.status, 'Pending');

  const studentResponse = await makeRequest('/api/orders', {
    method: 'GET',
    headers: { Authorization: `Bearer ${studentToken}` },
  });

  assert.equal(studentResponse.statusCode, 200);
  assert.equal(studentResponse.json.some((entry) => entry.id === order.id && entry.status === 'Pending'), true);
});

test('admin menu price changes are reflected in the student menu payload', async () => {
  const menuItem = demoMenu[0];
  const originalPrice = Number(menuItem.price || 0);
  const updatedPrice = originalPrice + 10;

  const adminToken = createSession('admin', demoUsers.find((entry) => entry.email === 'admin@cafeconnect.com'));
  const adminResponse = await makeRequest(`/api/admin/menu/${menuItem.id}/price`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ price: updatedPrice }),
  });

  assert.equal(adminResponse.statusCode, 200);

  const studentToken = createSession('student', demoUsers.find((entry) => entry.email === 'mathapelo@cafeconnect.com'));
  const studentResponse = await makeRequest('/api/menu', {
    method: 'GET',
    headers: { Authorization: `Bearer ${studentToken}` },
  });

  assert.equal(studentResponse.statusCode, 200);
  const studentItem = studentResponse.json.find((entry) => entry.id === menuItem.id);
  assert.ok(studentItem);
  assert.equal(Number(studentItem.price), updatedPrice);

  menuItem.price = originalPrice;
});
