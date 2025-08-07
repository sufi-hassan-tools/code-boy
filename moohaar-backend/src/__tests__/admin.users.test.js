import request from 'supertest';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';

const users = [
  { _id: '1', email: 'admin@example.com', passwordHash: 'hash', role: 'admin' },
  { _id: '2', email: 'user@example.com', passwordHash: 'hash', role: 'merchant' },
];

const find = jest.fn().mockReturnValue({
  skip: () => ({
    limit: () => Promise.resolve(users),
  }),
});
const countDocuments = jest.fn().mockResolvedValue(users.length);
const findByIdAndUpdate = jest
  .fn()
  .mockImplementation((id, update) => {
    const user = users.find((u) => u._id === id);
    if (!user) return null;
    Object.assign(user, update);
    return user;
  });

jest.unstable_mockModule('../models/user.model.js', () => ({
  default: { find, countDocuments, findByIdAndUpdate },
}));

jest.unstable_mockModule('../models/store.model.js', () => ({
  default: { findOne: jest.fn().mockResolvedValue(null) },
}));

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';
const token = jwt.sign({ userId: '1', role: 'admin' }, process.env.JWT_SECRET);

const { app } = await import('../server.js');

describe('Admin Users Controller', () => {
  test('should list users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.users).toHaveLength(2);
    expect(find).toHaveBeenCalled();
  });

  test('should update a user', async () => {
    const res = await request(app)
      .patch('/api/admin/users/2')
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'admin' });
    expect(res.status).toBe(200);
    expect(res.body.role).toBe('admin');
    expect(findByIdAndUpdate).toHaveBeenCalledWith('2', { role: 'admin' }, { new: true });
  });
});

