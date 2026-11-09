import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canChangeStatus } from './order-status.ts';

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
