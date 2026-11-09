import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BasketError, MAX_ITEM_QUANTITY, parseBasket, priceBasket } from './order-pricing.ts';

const burger = { id: '11111111-1111-4111-8111-111111111111', name: 'Burger', price: 64.1, available: true };
const juice = { id: '22222222-2222-4222-8222-222222222222', name: 'Juice', price: 18.2, available: true };

test('totals in whole cents, using menu prices', () => {
  const quantities = parseBasket([{ id: burger.id, quantity: 3 }, { id: juice.id, quantity: 1 }]);
  const { lines, total } = priceBasket(quantities, [burger, juice]);
  assert.equal(total, 210.5);
  assert.deepEqual(lines[0], { menuItemId: burger.id, name: 'Burger', quantity: 3, unitPrice: 64.1 });
});

test('ignores any price or name sent by the browser', () => {
  const quantities = parseBasket([{ id: burger.id, quantity: 1, price: 0.01, name: 'Free' }]);
  const { lines, total } = priceBasket(quantities, [burger]);
  assert.equal(total, 64.1);
  assert.equal(lines[0].name, 'Burger');
});

test('merges repeated items before applying the quantity limit', () => {
  const half = Math.ceil(MAX_ITEM_QUANTITY / 2) + 1;
  const quantities = parseBasket([{ id: burger.id, quantity: half }, { id: burger.id.toUpperCase(), quantity: half }]);
  assert.equal(quantities.size, 1);
  assert.throws(() => priceBasket(quantities, [burger]), /up to 20 of Burger/);
});

test('rejects empty, malformed and fractional baskets', () => {
  assert.throws(() => parseBasket([]), BasketError);
  assert.throws(() => parseBasket('nope'), BasketError);
  assert.throws(() => parseBasket([{ id: 'not-a-uuid', quantity: 1 }]), BasketError);
  assert.throws(() => parseBasket([{ id: burger.id, quantity: 1.5 }]), BasketError);
  assert.throws(() => parseBasket([{ id: burger.id, quantity: 0 }]), BasketError);
});

test('rejects items that were hidden or removed', () => {
  const quantities = parseBasket([{ id: burger.id, quantity: 1 }]);
  assert.throws(() => priceBasket(quantities, [{ ...burger, available: false }]), /Burger is no longer available/);
  assert.throws(() => priceBasket(quantities, []), /no longer available/);
});
