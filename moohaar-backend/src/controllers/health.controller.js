import mongoose from 'mongoose';
import Theme from '../models/theme.model.js';

// GET /health
// Provides basic service health information
export const healthCheck = async (req, res, next) => {
  try {
    const mongo = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const memoryUsage = process.memoryUsage().rss;
    return res.json({
      uptime: process.uptime(),
      mongo,
      memoryUsage,
    });
  } catch (err) {
    return next(err);
  }
};
