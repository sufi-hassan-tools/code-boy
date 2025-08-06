const crypto = require('crypto');

const store = new Map();

function hash(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function save(token, userId, expiresAt) {
  store.set(hash(token), { userId, expiresAt });
}

function consume(token) {
  const key = hash(token);
  const data = store.get(key);
  if (!data) return null;
  if (data.expiresAt < Date.now()) {
    store.delete(key);
    return null;
  }
  store.delete(key);
  return data;
}

function remove(token) {
  store.delete(hash(token));
}

function isValid(token) {
  const key = hash(token);
  const data = store.get(key);
  if (!data) return false;
  if (data.expiresAt < Date.now()) {
    store.delete(key);
    return false;
  }
  return true;
}

function clear() {
  store.clear();
}

module.exports = { save, consume, remove, isValid, clear };
