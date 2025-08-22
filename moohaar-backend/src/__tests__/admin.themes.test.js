import { jest } from '@jest/globals.js';
import adminController from '../controllers/admin.controller.js';

describe('Admin Themes Controller', () => {
  it('should list themes', () => {
    const req = {};
    const res = { json: jest.fn() };
    adminController.listThemes(req, res);
    expect(res.json).toHaveBeenCalledWith({ themes: [] });
  });

  it('should approve a theme', () => {
    const req = {};
    const res = { json: jest.fn() };
    adminController.approveTheme(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'approve theme placeholder' });
  });

  it('should update a theme', () => {
    const req = {};
    const res = { json: jest.fn() };
    adminController.updateTheme(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'update theme placeholder' });
  });

  it('should disable a theme', () => {
    const req = {};
    const res = { json: jest.fn() };
    adminController.disableTheme(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'disable theme placeholder' });
  });
});
