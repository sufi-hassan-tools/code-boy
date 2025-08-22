import { jest } from '@jest/globals.js';
import { getSettings, updateSettings } from '../controllers/admin.controller.js';

describe('Admin Settings Controller', () => {
  it('should get settings', () => {
    const req = {};
    const res = { json: jest.fn() };
    getSettings(req, res);
    expect(res.json).toHaveBeenCalledWith({ settings: {} });
  });

  it('should update settings', () => {
    const req = {};
    const res = { json: jest.fn() };
    updateSettings(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'update settings placeholder' });
  });
});
