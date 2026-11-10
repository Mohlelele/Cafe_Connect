import assert from 'node:assert/strict';
import { test } from 'node:test';
import { asText, isOneOf, isUuid, isValidEmail, isValidImageUrl, isValidPassword, parsePrice, toCents } from './validate.ts';

test('text that is not a string becomes empty', () => {
  assert.equal(asText('  burger '), 'burger');
  assert.equal(asText(42), '');
  assert.equal(asText(null), '');
  assert.equal(asText({ toString: () => 'x' }), '');
});

test('ids must be real UUIDs', () => {
  assert.equal(isUuid('11111111-1111-4111-8111-111111111111'), true);
  assert.equal(isUuid('1 or 1=1'), false);
  assert.equal(isUuid(7), false);
});

test('only listed values are accepted', () => {
  assert.equal(isOneOf('Cash', ['Cash', 'Card']), true);
  assert.equal(isOneOf('Crypto', ['Cash', 'Card']), false);
  assert.equal(isOneOf(['Cash'], ['Cash', 'Card']), false);
});

test('prices must be positive numbers within the limit', () => {
  assert.equal(parsePrice('64.5'), 64.5);
  assert.equal(parsePrice('19.999'), 20);
  for (const bad of ['', '0', '-1', 'abc', '100001', 5, null]) assert.equal(parsePrice(bad), null);
});

test('passwords must be 8 to 72 bytes', () => {
  assert.equal(isValidPassword('password1'), true);
  assert.equal(isValidPassword('short'), false);
  assert.equal(isValidPassword('x'.repeat(73)), false);
  assert.equal(isValidPassword(12345678), false);
});

test('emails and image addresses are checked', () => {
  assert.equal(isValidEmail('student@example.com'), true);
  assert.equal(isValidEmail('not an email'), false);
  assert.equal(isValidImageUrl('https://example.com/a.jpg'), true);
  assert.equal(isValidImageUrl('javascript:alert(1)'), false);
});

test('cents avoid decimal rounding errors', () => {
  assert.equal(toCents(64.1), 6410);
  assert.equal(toCents(0.1 + 0.2), 30);
});
