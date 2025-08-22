/* eslint-env jest */
/* eslint-disable import/no-extraneous-dependencies */
import { jest } from '@jest/globals';

let authorizeStoreOwner;
let Store;

beforeAll(async () => {
  const stores = [];

  class MockStore {
    constructor(data) {
      Object.assign(this, data);
    }
    static async findById(id) {
      return stores.find(store => store._id === id) || null;
    }
  }

  jest.unstable_mockModule('../../models/store.model.js', () => ({ default: MockStore }));

  const authStoreOwnerMiddleware = await import('../authorizeStoreOwner.js');
  ({ default: Store } = await import('../../models/store.model.js'));

  authorizeStoreOwner = authStoreOwnerMiddleware.default;

  // Add test store
  stores.push({
    _id: 'store1',
    name: 'Test Store',
    ownerId: 'user1'
  });
});

beforeEach(() => {
  // Clear test data before each test
  Store.collection = [];
});

describe('authorizeStoreOwner', () => {
  it('should allow access for store owner', async () => {
    const req = {
      user: { id: 'user1' },
      params: { storeId: 'store1' }
    };
    const res = {};
    const next = jest.fn();

    await authorizeStoreOwner(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.store).toBeDefined();
  });

  it('should deny access for non-store owner', async () => {
    const req = {
      user: { id: 'user2' },
      params: { storeId: 'store1' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await authorizeStoreOwner(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 404 when store does not exist', async () => {
    const req = {
      user: { id: 'user1' },
      params: { storeId: 'nonexistent' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await authorizeStoreOwner(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Store not found'
    });
    expect(next).not.toHaveBeenCalled();
  });
});