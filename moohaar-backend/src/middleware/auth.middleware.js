import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import Store from '../models/store.model.js';

// JWT authentication middleware
export const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = { id: decoded.id };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Ensures the authenticated user owns the store
export const authorizeStoreOwner = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    if (store.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.store = store;
    return next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export default { auth, authorizeStoreOwner };
