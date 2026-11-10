import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildOrderReadyEmail } from './order-email.ts';

const order = {
  orderNumber: 'CC-1A2B3C4D',
  customerName: 'Thandi Mokoena',
  items: [{ name: 'Classic Beef Burger', quantity: 2, unitPrice: 64 }, { name: 'Cappuccino', quantity: 1, unitPrice: 22 }],
  total: 150,
  paid: false,
};

test('the ready email shows the order number, items, total and a link', () => {
  const { subject, html, text } = buildOrderReadyEmail(order, 'https://cafe.example');
  assert.equal(subject, 'Your order CC-1A2B3C4D is ready to collect');
  assert.ok(html.includes('CC-1A2B3C4D') && html.includes('Thandi!'));
  assert.ok(html.includes('2 &times;</strong> Classic Beef Burger'));
  assert.ok(html.includes('R 150.00'));
  assert.ok(html.includes('href="https://cafe.example/orders/CC-1A2B3C4D"'));
  assert.ok(html.includes('https://cafe.example/brand/email-logo.png'));
  assert.ok(text.includes('Order number: CC-1A2B3C4D') && text.includes('Pay R 150.00 in cash'));
});

test('unpaid orders say what to pay; paid orders say nothing is owed', () => {
  assert.ok(buildOrderReadyEmail(order, 'https://x').html.includes('Pay R 150.00 in cash'));
  assert.ok(buildOrderReadyEmail({ ...order, paid: true }, 'https://x').html.includes('Nothing more to pay'));
});

test('names and items cannot inject HTML into the email', () => {
  const { html } = buildOrderReadyEmail({ ...order, customerName: '<script>x</script>', items: [{ name: '<img src=x onerror=alert(1)>', quantity: 1, unitPrice: 5 }] }, 'https://x');
  assert.ok(!html.includes('<script>') && !html.includes('<img src=x'));
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
});
