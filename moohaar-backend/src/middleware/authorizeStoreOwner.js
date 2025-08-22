import Store from '../models/store.model.js';

export default async (req, res, next) => {
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
