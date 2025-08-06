import mongoose from 'mongoose';
import { getCache, setCache } from '../services/cache.service';
import config from '../config/index';

// GET /health
// Provides basic service health information
const healthCheck = async (req, res, next) => {
  try {
    const cached = await getCache('health');
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    const mongo =
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const memoryUsage = process.memoryUsage().rss;
    const result = {
      uptime: process.uptime(),
      mongo,
      memoryUsage,
    };
    await setCache('health', JSON.stringify(result), config.CACHE_TTL_HEALTH);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
};

export default healthCheck;
