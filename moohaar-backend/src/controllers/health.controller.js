import mongoose from 'mongoose';
import Theme from '../models/theme.model.js';

// GET /health
// Provides basic service health information
export const healthCheck = async (req, res, next) => {
  try {
    const mongo = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const themesLoaded = await Theme.countDocuments();
    return res.json({
      uptime: process.uptime(),
      mongo,
      themesLoaded,
    });
  } catch (err) {
    return next(err);
  }
};
