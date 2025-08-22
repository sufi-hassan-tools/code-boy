/* eslint-env jest */
/* eslint-disable import/no-extraneous-dependencies */
import request from 'supertest';
import express from 'express';
import cookie from 'cookie';
import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// Removed unused imports: hashPassword, comparePassword

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
    static async countDocuments() {
      return users.length;
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
});

beforeEach(() => {
  // Clear users array before each test
  User.collection = [];
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    await User.create({ email: 'test@example.com', passwordHash, role: 'merchant' });
  });

  it('should login successfully with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user).toHaveProperty('role', 'merchant');
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('should return 400 when email is missing', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ password: 'password123' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'email and password are required');
  });

  it('should return 400 when password is missing', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'email and password are required');
  });

  it('should return 401 when user does not exist', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'password123' });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('should return 401 when password is incorrect', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Invalid credentials');
  });
});

describe('GET /api/auth/me', () => {
  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    await User.create({ id: '1', email: 'test@example.com', passwordHash, role: 'merchant' });
  });

  it('should return user info when valid token is provided', async () => {
    const token = jwt.sign({ userId: '1', role: 'merchant' }, 'testsecret', { expiresIn: '1d' });

    const response = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `token=${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', '1');
    expect(response.body).toHaveProperty('email', 'test@example.com');
    expect(response.body).toHaveProperty('role', 'merchant');
  });

  it('should return 401 when no token is provided', async () => {
    const response = await request(app)
      .get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Not authenticated');
  });

  it('should return 401 when token is invalid', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Cookie', 'token=invalidtoken');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Invalid token');
  });

  it('should return 401 when user does not exist', async () => {
    const token = jwt.sign({ userId: '999', role: 'merchant' }, 'testsecret', { expiresIn: '1d' });

    const response = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `token=${token}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Not authenticated');
  });
});

describe('POST /api/auth/logout', () => {
  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    await User.create({ id: '1', email: 'test@example.com', passwordHash, role: 'merchant' });
  });

  it('should logout successfully and clear cookies', async () => {
    const refreshToken = jwt.sign({ userId: '1', jti: 'test' }, 'testsecret', { expiresIn: '7d' });

    const response = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', `refreshToken=${refreshToken}`);

    expect(response.status).toBe(204);
    expect(response.headers['set-cookie']).toBeDefined();
    
    const cookies = response.headers['set-cookie'];
    const tokenCookie = cookies.find(c => c.startsWith('token='));
    const refreshCookie = cookies.find(c => c.startsWith('refreshToken='));
    
    expect(tokenCookie).toContain('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    expect(refreshCookie).toContain('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  });

  it('should logout successfully even without refresh token', async () => {
    const response = await request(app)
      .post('/api/auth/logout');

    expect(response.status).toBe(204);
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('should handle invalid refresh token gracefully', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', 'refreshToken=invalidtoken');

    expect(response.status).toBe(204);
  });
});