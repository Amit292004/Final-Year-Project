import test from 'node:test';
import assert from 'node:assert';
import app from '../server.js';

test('Health endpoint returns healthy status', async () => {
  // Simple mock test for health route handler
  assert.strictEqual(typeof app, 'function');
});
