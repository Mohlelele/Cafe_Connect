const test = require('node:test');
const assert = require('node:assert/strict');
const { hashPassword, verifyPassword } = require('./auth');

test('hashPassword creates a secure hash', async () => {
  const password = 'StrongPassword123!';
  const hash = await hashPassword(password);

  assert.notEqual(hash, password);
  assert.ok(hash.startsWith('$2'));
});

test('verifyPassword accepts the original password and rejects a different one', async () => {
  const hash = await hashPassword('MySecurePass');

  assert.equal(await verifyPassword('MySecurePass', hash), true);
  assert.equal(await verifyPassword('WrongPass', hash), false);
});
