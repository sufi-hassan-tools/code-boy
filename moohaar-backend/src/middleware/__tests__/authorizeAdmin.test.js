/* eslint-env jest */
/* eslint-disable import/no-extraneous-dependencies */
import { jest } from '@jest/globals';

let authorizeAdmin;

beforeAll(async () => {
  const authAdminMiddleware = await import('../authorizeAdmin.js');
  authorizeAdmin = authAdminMiddleware.default;
});

describe('authorizeAdmin', () => {
  it('should allow access for admin user', async () => {
    const req = {
      user: { role: 'admin' }
    };
    const res = {};
    const next = jest.fn();

    authorizeAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should allow access for admin in req.admin', async () => {
    const req = {
      admin: { role: 'admin' }
    };
    const res = {};
    const next = jest.fn();

    authorizeAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should deny access for non-admin user', async () => {
    const req = {
      user: { role: 'merchant' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    authorizeAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should deny access when no user is present', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    authorizeAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden'
    });
    expect(next).not.toHaveBeenCalled();
  });
});