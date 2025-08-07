import request from 'supertest';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';

let settingsData = {};

const findOne = jest.fn().mockImplementation(() => {
  if (Object.keys(settingsData).length === 0) return Promise.resolve(null);
  return Promise.resolve(settingsData);
});
const findOneAndUpdate = jest.fn().mockImplementation((_query, update) => {
  settingsData = { ...settingsData, ...update };
  return Promise.resolve(settingsData);
});

jest.unstable_mockModule('../models/setting.model.js', () => ({
  default: { findOne, findOneAndUpdate },
}));

jest.unstable_mockModule('../models/store.model.js', () => ({
  default: { findOne: jest.fn().mockResolvedValue(null) },
}));

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';
const token = jwt.sign({ userId: '1', role: 'admin' }, process.env.JWT_SECRET);

const { app } = await import('../server.js');
const agent = request.agent(app);

const getCsrf = async () => {
  const res = await agent.get('/api/csrf-token');
  return res.body.csrfToken;
};

describe('Admin Settings Controller', () => {
  test('should get settings', async () => {
    settingsData = {};
    const res = await request(app)
      .get('/api/admin/settings')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.settings).toEqual({});
    expect(findOne).toHaveBeenCalled();
  });

  test('should update settings', async () => {
    settingsData = {};
    const csrf = await getCsrf();
    const res = await agent
      .put('/api/admin/settings')
      .set('X-CSRF-Token', csrf)
      .set('Authorization', `Bearer ${token}`)
      .send({ maintenanceMode: true });
    expect(res.status).toBe(200);
    expect(res.body.settings.maintenanceMode).toBe(true);
    expect(findOneAndUpdate).toHaveBeenCalled();
  });
});

