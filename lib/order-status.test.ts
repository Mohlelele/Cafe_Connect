import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canChangeStatus, orderNumberMatches } from './order-status.ts';

test('the order number typed at collection must match', () => {
  for (const typed of ['CC-7F3A91C2', 'cc-7f3a91c2', '7F3A91C2', '7f3a 91c2', ' CC 7F3A-91C2 ']) {
    assert.equal(orderNumberMatches(typed, 'CC-7F3A91C2'), true, typed);
  }
  for (const typed of ['CC-7F3A91C3', '7F3A91C', '', 'CC-', 42, null]) {
    assert.equal(orderNumberMatches(typed, 'CC-7F3A91C2'), false, String(typed));
  }
});

test('an order moves forward one step at a time', () => {
  assert.equal(canChangeStatus('Pending', 'Preparing'), true);
  assert.equal(canChangeStatus('Preparing', 'Ready'), true);
  assert.equal(canChangeStatus('Ready', 'Collected'), true);
});

test('staff can go one step back to fix a mistake', () => {
  assert.equal(canChangeStatus('Ready', 'Preparing'), true);
  assert.equal(canChangeStatus('Preparing', 'Pending'), true);
});

test('steps cannot be skipped', () => {
  assert.equal(canChangeStatus('Pending', 'Ready'), false);
  assert.equal(canChangeStatus('Pending', 'Collected'), false);
});

test('a collected order cannot change', () => {
  assert.equal(canChangeStatus('Collected', 'Ready'), false);
  assert.equal(canChangeStatus('Collected', 'Pending'), false);
});

test('an order cannot change to the status it already has', () => {
  assert.equal(canChangeStatus('Ready', 'Ready'), false);
});
