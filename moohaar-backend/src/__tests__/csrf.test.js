/* eslint-env jest */
import request from 'supertest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { jest } from '@jest/globals';

// Mock Store model to avoid database dependency
jest.unstable_mockModule('../models/store.model.js', () => ({
  default: { findOne: jest.fn().mockResolvedValue(null) },
}));

const { app } = await import('../server.js');

let tmpRoot;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'csrf-test-'));
  process.env.THEMES_PATH = path.join(tmpRoot, 'themes');
  process.env.UPLOADS_PATH = path.join(tmpRoot, 'uploads');
  await fs.mkdir(process.env.THEMES_PATH);
  await fs.mkdir(process.env.UPLOADS_PATH);
});

afterAll(async () => {
  await fs.rm(tmpRoot, { recursive: true, force: true });
});

describe('CSRF protection', () => {
  it('rejects POST without CSRF token', async () => {
    const res = await request(app).post('/api/themes');
    expect(res.status).toBe(403);
  });

  it('allows request with valid CSRF token (then fails auth)', async () => {
    const agent = request.agent(app);
    const tokenRes = await agent.get('/api/csrf-token');
    const { csrfToken } = tokenRes.body;
    const res = await agent
      .post('/api/themes')
      .set('X-CSRF-Token', csrfToken);
    expect(res.status).not.toBe(403);
  });
});
