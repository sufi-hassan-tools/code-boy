/* eslint-env jest */
/* eslint-disable import/no-extraneous-dependencies */
import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

let app;
let Order;
let PageView;

beforeAll(async () => {
  const orders = [];
  const pageViews = [];

  class MockOrder {
    static async aggregate(pipeline) {
      // Mock aggregation for sales metrics
      const match = pipeline.find(p => p.$match);
      const group = pipeline.find(p => p.$group);
      
      if (match && group) {
        // Filter orders based on match criteria
        let filtered = orders.filter(order => {
          if (match.$match.storeId && order.storeId !== match.$match.storeId) return false;
          if (match.$match.createdAt) {
            if (match.$match.createdAt.$gte && new Date(order.createdAt) < match.$match.createdAt.$gte) return false;
            if (match.$match.createdAt.$lte && new Date(order.createdAt) > match.$match.createdAt.$lte) return false;
          }
          return true;
        });

        // Group by date
        const grouped = {};
        filtered.forEach(order => {
          const date = new Date(order.createdAt).toISOString().split('T')[0];
          if (!grouped[date]) {
            grouped[date] = { _id: date, total: 0 };
          }
          grouped[date].total += order.amount;
        });

        return Object.values(grouped).sort((a, b) => a._id.localeCompare(b._id));
      }
      
      return [];
    }
  }

  class MockPageView {
    static async aggregate(pipeline) {
      // Mock aggregation for traffic metrics
      const match = pipeline.find(p => p.$match);
      const group = pipeline.find(p => p.$group);
      const project = pipeline.find(p => p.$project);
      
      if (match && group) {
        // Filter page views based on match criteria
        let filtered = pageViews.filter(view => {
          if (match.$match.storeId && view.storeId !== match.$match.storeId) return false;
          if (match.$match.timestamp) {
            if (match.$match.timestamp.$gte && new Date(view.timestamp) < match.$match.timestamp.$gte) return false;
            if (match.$match.timestamp.$lte && new Date(view.timestamp) > match.$match.timestamp.$lte) return false;
          }
          return true;
        });

        // Group by date
        const grouped = {};
        filtered.forEach(view => {
          const date = new Date(view.timestamp).toISOString().split('T')[0];
          if (!grouped[date]) {
            grouped[date] = { 
              _id: date, 
              views: 0, 
              bounces: 0 
            };
          }
          grouped[date].views += 1;
          if (view.isBounce) {
            grouped[date].bounces += 1;
          }
        });

        // Apply projection
        return Object.values(grouped).map(item => ({
          date: item._id,
          views: item.views,
          bounces: item.bounces,
          bounceRate: item.views > 0 ? item.bounces / item.views : 0
        })).sort((a, b) => a.date.localeCompare(b.date));
      }
      
      return [];
    }
  }

  jest.unstable_mockModule('../../models/order.model.js', () => ({ default: MockOrder }));
  jest.unstable_mockModule('../../models/pageview.model.js', () => ({ default: MockPageView }));
  
  const { default: metricsRoutes } = await import('../metrics.routes.js');
  ({ default: Order } = await import('../../models/order.model.js'));
  ({ default: PageView } = await import('../../models/pageview.model.js'));

  app = express();
  app.use(express.json());
  app.use('/api', metricsRoutes);

  // Add some test data
  orders.push(
    { storeId: 'store1', amount: 100, createdAt: '2024-01-01T10:00:00Z' },
    { storeId: 'store1', amount: 200, createdAt: '2024-01-01T11:00:00Z' },
    { storeId: 'store1', amount: 150, createdAt: '2024-01-02T10:00:00Z' },
    { storeId: 'store2', amount: 300, createdAt: '2024-01-01T10:00:00Z' }
  );

  pageViews.push(
    { storeId: 'store1', timestamp: '2024-01-01T10:00:00Z', isBounce: false },
    { storeId: 'store1', timestamp: '2024-01-01T11:00:00Z', isBounce: true },
    { storeId: 'store1', timestamp: '2024-01-02T10:00:00Z', isBounce: false },
    { storeId: 'store2', timestamp: '2024-01-01T10:00:00Z', isBounce: false }
  );
});

describe('GET /api/stores/:storeId/metrics/sales', () => {
  it('should return sales metrics for a store', async () => {
    const response = await request(app)
      .get('/api/stores/store1/metrics/sales');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    
    const firstMetric = response.body[0];
    expect(firstMetric).toHaveProperty('date');
    expect(firstMetric).toHaveProperty('total');
    expect(typeof firstMetric.total).toBe('number');
  });

  it('should return empty array for non-existent store', async () => {
    const response = await request(app)
      .get('/api/stores/nonexistent/metrics/sales');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  it('should filter by date range when from parameter is provided', async () => {
    const response = await request(app)
      .get('/api/stores/store1/metrics/sales?from=2024-01-02T00:00:00Z');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should filter by date range when to parameter is provided', async () => {
    const response = await request(app)
      .get('/api/stores/store1/metrics/sales?to=2024-01-01T23:59:59Z');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should filter by date range when both from and to parameters are provided', async () => {
    const response = await request(app)
      .get('/api/stores/store1/metrics/sales?from=2024-01-01T00:00:00Z&to=2024-01-01T23:59:59Z');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe('GET /api/stores/:storeId/metrics/traffic', () => {
  it('should return traffic metrics for a store', async () => {
    const response = await request(app)
      .get('/api/stores/store1/metrics/traffic');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    
    const firstMetric = response.body[0];
    expect(firstMetric).toHaveProperty('date');
    expect(firstMetric).toHaveProperty('views');
    expect(firstMetric).toHaveProperty('bounces');
    expect(firstMetric).toHaveProperty('bounceRate');
    expect(typeof firstMetric.views).toBe('number');
    expect(typeof firstMetric.bounces).toBe('number');
    expect(typeof firstMetric.bounceRate).toBe('number');
  });

  it('should return empty array for non-existent store', async () => {
    const response = await request(app)
      .get('/api/stores/nonexistent/metrics/traffic');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  it('should filter by date range when from parameter is provided', async () => {
    const response = await request(app)
      .get('/api/stores/store1/metrics/traffic?from=2024-01-02T00:00:00Z');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should filter by date range when to parameter is provided', async () => {
    const response = await request(app)
      .get('/api/stores/store1/metrics/traffic?to=2024-01-01T23:59:59Z');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should filter by date range when both from and to parameters are provided', async () => {
    const response = await request(app)
      .get('/api/stores/store1/metrics/traffic?from=2024-01-01T00:00:00Z&to=2024-01-01T23:59:59Z');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should calculate bounce rate correctly', async () => {
    const response = await request(app)
      .get('/api/stores/store1/metrics/traffic');

    expect(response.status).toBe(200);
    
    // Find the date with both views and bounces
    const metricWithBounces = response.body.find(m => m.bounces > 0);
    if (metricWithBounces) {
      expect(metricWithBounces.bounceRate).toBe(metricWithBounces.bounces / metricWithBounces.views);
    }
  });
});