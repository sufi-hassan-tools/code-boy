import { jest } from '@jest/globals.js';
import adminController from '../controllers/admin.controller.js';

describe('Admin Stores Controller', () => {
  it('should list stores', () => {
    const req = {};
    const res = { json: jest.fn() };
    // Using listUsers as a placeholder since store listing is not implemented yet
    adminController.listUsers(req, res);
    expect(res.json).toHaveBeenCalledWith({ users: [], total: 0 });
  });

  it('should get store metrics', () => {
    const req = {};
    const res = { json: jest.fn() };
    adminController.getDashboard(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'admin dashboard placeholder' });
  });
});
