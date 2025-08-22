import { jest } from '@jest/globals.js';
import adminController from '../controllers/admin.controller.js';

describe('Admin Users Controller', () => {
  it('should list users', () => {
    const req = {};
    const res = { json: jest.fn() };
    adminController.listUsers(req, res);
    expect(res.json).toHaveBeenCalledWith({ users: [], total: 0 });
  });

  it('should update a user', () => {
    const req = {};
    const res = { json: jest.fn() };
    adminController.updateUser(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'update user placeholder' });
  });
});
