import mongoose from 'mongoose';

// GET /health
// Provides basic service health information
const healthCheck = async (req, res, next) => {
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

export default healthCheck;
