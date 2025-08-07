import request from 'supertest';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';

const themes = [];

const find = jest.fn().mockImplementation(() => Promise.resolve(themes));
const findByIdAndUpdate = jest.fn().mockImplementation((id, update) => {
  const theme = themes.find((t) => t._id === id);
  if (!theme) return null;
  if (update.$set && update.$set['metadata.status']) {
    theme.metadata.status = update.$set['metadata.status'];
  } else {
    Object.assign(theme, update);
  }
  return theme;
});

jest.unstable_mockModule('../models/theme.model.js', () => ({
  default: { find, findByIdAndUpdate },
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

describe('Admin Themes Controller', () => {
  test('should list themes', async () => {
    themes.length = 0;
    themes.push({
      _id: '1',
      name: 'Theme1',
      version: '1.0',
      description: 'd',
      previewImage: 'img',
      paths: {},
      metadata: { status: 'pending' },
    });
    const res = await request(app)
      .get('/api/admin/themes')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.themes).toHaveLength(1);
    expect(find).toHaveBeenCalled();
  });

  test('should approve a theme', async () => {
    themes.length = 0;
    const theme = {
      _id: '2',
      name: 'Theme2',
      version: '1.0',
      description: 'd',
      previewImage: 'img',
      paths: {},
      metadata: { status: 'pending' },
    };
    themes.push(theme);
    const csrf = await getCsrf();
    const res = await agent
      .post(`/api/admin/themes/${theme._id}/approve`)
      .set('X-CSRF-Token', csrf)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.metadata.status).toBe('approved');
  });

  test('should update a theme', async () => {
    themes.length = 0;
    const theme = {
      _id: '3',
      name: 'Theme3',
      version: '1.0',
      description: 'old',
      previewImage: 'img',
      paths: {},
      metadata: { status: 'approved' },
    };
    themes.push(theme);
    const csrf = await getCsrf();
    const res = await agent
      .put(`/api/admin/themes/${theme._id}`)
      .set('X-CSRF-Token', csrf)
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'new desc' });
    expect(res.status).toBe(200);
    expect(res.body.description).toBe('new desc');
  });

  test('should disable a theme', async () => {
    themes.length = 0;
    const theme = {
      _id: '4',
      name: 'Theme4',
      version: '1.0',
      description: 'd',
      previewImage: 'img',
      paths: {},
      metadata: { status: 'approved' },
    };
    themes.push(theme);
    const res = await request(app)
      .patch(`/api/admin/themes/${theme._id}/disable`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.metadata.status).toBe('disabled');
  });
});

