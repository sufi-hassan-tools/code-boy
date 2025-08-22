import { jest } from '@jest/globals.js';
import adminController from '../controllers/admin.controller.js';

describe('Admin Metrics Controller', () => {
  it('should return platform metrics', () => {
    const req = {};
    const res = { json: jest.fn() };
    adminController.getDashboard(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'admin dashboard placeholder' });
  });
});
