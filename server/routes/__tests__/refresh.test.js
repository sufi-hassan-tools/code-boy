const request = require('supertest');
const jwt = require('jsonwebtoken');
const { generateKeyPairSync } = require('crypto');
const app = require('../../server');
const tokenStore = require('../../config/tokenStore');

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
process.env.JWT_PRIVATE_KEY_BASE64 = Buffer.from(privateKey.export({ type: 'pkcs1', format: 'pem' })).toString('base64');
process.env.JWT_PUBLIC_KEY_BASE64 = Buffer.from(publicKey.export({ type: 'pkcs1', format: 'pem' })).toString('base64');

describe('refresh token flow', () => {
  beforeEach(() => tokenStore.clear());

  function createRefresh(userId = 'user1') {
    const token = jwt.sign({ id: userId }, privateKey, { algorithm: 'RS256', expiresIn: '7d' });
    tokenStore.save(token, userId, Date.now() + 7 * 24 * 60 * 60 * 1000);
    return token;
  }

  test('rotates refresh token', async () => {
    const oldToken = createRefresh();
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [`refreshToken=${oldToken}`])
      .expect(200);
    const setCookie = res.headers['set-cookie'].join(';');
    const match = /refreshToken=([^;]+)/.exec(setCookie);
    expect(match).toBeTruthy();
    const newToken = match[1];
    expect(tokenStore.isValid(oldToken)).toBe(false);
    expect(tokenStore.isValid(newToken)).toBe(true);
  });

  test('old token cannot be reused', async () => {
    const oldToken = createRefresh();
    await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [`refreshToken=${oldToken}`])
      .expect(200);
    await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [`refreshToken=${oldToken}`])
      .expect(401);
  });

  test('logout invalidates token', async () => {
    const token = createRefresh();
    await request(app)
      .post('/api/auth/logout')
      .set('Cookie', [`refreshToken=${token}`])
      .expect(200);
    expect(tokenStore.isValid(token)).toBe(false);
  });
});
