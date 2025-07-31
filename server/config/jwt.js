const fs = require('fs');

function getPrivateKey() {
  if (!process.env.JWT_PRIVATE_KEY_BASE64) {
    throw new Error('JWT_PRIVATE_KEY_BASE64 missing');
  }
  return Buffer.from(process.env.JWT_PRIVATE_KEY_BASE64, 'base64').toString('utf-8');
}

function getPublicKey() {
  if (!process.env.JWT_PUBLIC_KEY_BASE64) {
    throw new Error('JWT_PUBLIC_KEY_BASE64 missing');
  }
  return Buffer.from(process.env.JWT_PUBLIC_KEY_BASE64, 'base64').toString('utf-8');
}

module.exports = { getPrivateKey, getPublicKey };
