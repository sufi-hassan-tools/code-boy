/* eslint-env jest */
import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import healthCheck from '../health.controller.js';

const app = express();
app.get('/health', healthCheck);

beforeAll(() => {
  mongoose.connection.readyState = 1;
});

afterAll(() => {
  mongoose.connection.readyState = 0;
});

describe('GET /health', () => {
  it('returns service health information', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('mongo', 'connected');
    expect(res.body).toHaveProperty('memoryUsage');
  });
});
