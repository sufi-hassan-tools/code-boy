/* eslint-env jest */
/* eslint-disable import/no-extraneous-dependencies */
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

let authenticate;
let User;

beforeAll(async () => {
  process.env.JWT_SECRET = 'testsecret';

  const users = [];

  class MockUser {
    constructor(data) {
      Object.assign(this, data);
    }
    static async findById(id) {
      return users.find(user => user._id === id) || null;
    }
  }

  jest.unstable_mockModule('../../models/user.model.js', () => ({ default: MockUser }));

  const authMiddleware = await import('../auth.js');
  ({ default: User } = await import('../../models/user.model.js'));

  authenticate = authMiddleware.default;

  // Add test user
  users.push({
    _id: 'user1',
    email: 'test@example.com',
    role: 'merchant'
  });
});

beforeEach(() => {
  // Clear test data before each test
  User.collection = [];
});

describe('authenticate', () => {
  it('should authenticate valid user successfully', async () => {
    const token = jwt.sign({ userId: 'user1', role: 'merchant' }, 'testsecret');
    const req = {
      cookies: { token }
    };
    const res = {};
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe('user1');
    expect(req.user.role).toBe('merchant');
  });

  it('should authenticate with Bearer token', async () => {
    const token = jwt.sign({ userId: 'user1', role: 'merchant' }, 'testsecret');
    const req = {
      cookies: {},
      headers: { authorization: `Bearer ${token}` }
    };
    const res = {};
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
  });

  it('should return 401 when no token is provided', async () => {
    const req = { cookies: {}, headers: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unauthorized'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token is invalid', async () => {
    const req = { cookies: { token: 'invalidtoken' }, headers: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid token'
    });
    expect(next).not.toHaveBeenCalled();
  });
});