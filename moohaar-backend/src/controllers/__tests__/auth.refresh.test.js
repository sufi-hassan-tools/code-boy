/* eslint-env jest */
/* eslint-disable import/no-extraneous-dependencies */
import request from 'supertest.js';
import express from 'express';
import cookie from 'cookie';
import { jest } from '@jest/globals.js';
import { hashPassword } from '../../utils/password.util.js';

let app;
let User;

beforeAll(async () => {
  process.env.JWT_SECRET = 'testsecret';
  process.env.NODE_ENV = 'test';

  const users = [];
  class MockUser {
    constructor(data) {
      Object.assign(this, data);
    }
    static async findOne({ email }) {
      return users.find((u) => u.email === email) || null;
    }
    static async findById(id) {
      return users.find((u) => u.id === id) || null;
    }
    static async create(data) {
      const user = new MockUser({ ...data, id: `${users.length + 1}` });
      users.push(user);
      return user;
    }
    async save() {
      const idx = users.findIndex((u) => u.id === this.id);
      if (idx !== -1) {
        users[idx] = this;
      }
    }
  }

  jest.unstable_mockModule('../../models/user.model.js', () => ({ default: MockUser }));
  const { default: authRoutes } = await import('../../routes/auth.routes.js');
  ({ default: User } = await import('../../models/user.model.js'));

  app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    const { cookie: raw } = req.headers;
    req.cookies = raw ? cookie.parse(raw) : {};
    next();
  });
  app.use('/api/auth', authRoutes);

  const passwordHash = await hashPassword('password123');
  await User.create({ email: 'test@example.com', passwordHash, role: 'merchant' });
});

describe('POST /api/auth/refresh', () => {
  it('rotates refresh token and issues new access token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(loginRes.status).toBe(200);
    const cookies = loginRes.headers['set-cookie'];
    const refreshCookie = cookies.find((c) => c.startsWith('refreshToken='));
    expect(refreshCookie).toBeDefined();
    const refreshToken = cookie.parse(refreshCookie.split(';')[0]).refreshToken;

    const first = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', `refreshToken=${refreshToken}`);
    expect(first.status).toBe(200);
    const newCookies = first.headers['set-cookie'];
    const newRefreshCookie = newCookies.find((c) => c.startsWith('refreshToken='));
    const newRefreshToken = cookie.parse(newRefreshCookie.split(';')[0]).refreshToken;

    const reuse = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', `refreshToken=${refreshToken}`);
    expect(reuse.status).toBe(401);

    const second = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', `refreshToken=${newRefreshToken}`);
    expect(second.status).toBe(200);
  });
});
