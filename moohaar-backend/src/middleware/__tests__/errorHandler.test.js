/* eslint-env jest */
/* eslint-disable import/no-extraneous-dependencies */
import { jest } from '@jest/globals';

let errorHandler;

beforeAll(async () => {
  const errorHandlerMiddleware = await import('../errorHandler.js');
  errorHandler = errorHandlerMiddleware.default;
});

describe('errorHandler', () => {
  it('should handle validation errors', async () => {
    const error = new Error('Validation failed');
    error.name = 'ValidationError';

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Validation failed'
    });
  });

  it('should handle unauthorized errors', async () => {
    const error = new Error('Unauthorized');
    error.name = 'UnauthorizedError';

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unauthorized'
    });
  });

  it('should handle generic errors', async () => {
    const error = new Error('Generic error');

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Internal server error'
    });
  });
});