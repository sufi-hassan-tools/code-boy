import request from 'supertest.js';
import app from '../server.js'; // eslint-disable-line import/no-named-as-default

describe('GET /metrics', () => {
  it('exposes Prometheus metrics', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.text).toContain('http_requests_total');
  });
});
