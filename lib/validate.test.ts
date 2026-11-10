import assert from 'node:assert/strict';
import { test } from 'node:test';
import { asText, isOneOf, isUuid, isValidEmail, isValidImageUrl, isValidPassword, parseIngredients, parsePrice, parseRating, passwordProblem, passwordStrength, pickAllowed, toCents } from './validate.ts';

test('ingredients can be typed one per line or separated by commas', () => {
  assert.deepEqual(parseIngredients('Beef patty\nCheese, Lettuce\n\n Cheese '), ['Beef patty', 'Cheese', 'Lettuce']);
  assert.deepEqual(parseIngredients(''), []);
  assert.deepEqual(parseIngredients(42), []);
  assert.equal(parseIngredients('x'.repeat(61)), null);
  assert.equal(parseIngredients(Array.from({ length: 31 }, (_, i) => `item ${i}`).join('\n')), null);
});

test('only ticked options from the list are kept', () => {
  assert.deepEqual(pickAllowed(['Dairy', 'Gluten', 'Poison'], ['Gluten', 'Dairy', 'Eggs']), ['Gluten', 'Dairy']);
  assert.deepEqual(pickAllowed('Gluten', ['Gluten']), []);
});

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
  assert.equal(isValidPassword('Lunchtime42'), true);
  assert.equal(isValidPassword('short1'), false);
  assert.equal(isValidPassword(`a1${'x'.repeat(71)}`), false);
  assert.equal(isValidPassword(12345678), false);
});

test('weak and easily guessed passwords are refused', () => {
  for (const weak of ['12345678', '1234567890', 'abcdefgh', 'password', 'password1', 'Password123', 'abc12345', 'qwerty123', 'aaaa1111', 'cafeconnect1', 'Richfield2026']) {
    assert.notEqual(passwordProblem(weak), null, weak);
  }
  assert.equal(passwordProblem('12345678'), 'Use both letters and numbers in your password.');
});

test('the strength meter rates passwords as weak, fair or strong', () => {
  assert.equal(passwordStrength('12345678').level, 'weak');
  assert.equal(passwordStrength('lunch42go').level, 'fair');
  assert.equal(passwordStrength('Lunch42go!').level, 'strong');
  assert.equal(passwordStrength('blue kitchen 42 table').level, 'strong');
});

test('ratings must be whole stars from 1 to 5', () => {
  for (const good of [1, 3, 5]) assert.equal(parseRating(good), good);
  for (const bad of [0, 6, 4.5, '5', null, -1]) assert.equal(parseRating(bad), null, String(bad));
});

test('a password may not contain the email name', () => {
  assert.notEqual(passwordProblem('thandi2026', 'thandi@student.ac.za'), null);
  assert.equal(passwordProblem('Kitchen7Blue', 'thandi@student.ac.za'), null);
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
