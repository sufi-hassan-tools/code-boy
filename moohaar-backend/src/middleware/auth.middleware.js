import jwt from 'jsonwebtoken';
import config from '../config/index';
import Store from '../models/store.model';

// JWT authentication middleware
export const auth = (req, res, next) => {
  const { authorization: header } = req.headers;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
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

// Ensures the user has admin role
export const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden' });
};

export default { auth, authorizeStoreOwner, authorizeAdmin };
