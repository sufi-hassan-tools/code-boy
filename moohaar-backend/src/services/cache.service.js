import logger from '../utils/logger.js';

let client;

export const initCache = async () => {
  try {
    // Temporarily disable Redis to test registration
    logger.info({ message: 'Cache disabled for testing' });
    client = null;
  } catch (err) {
    logger.warn({ message: 'Redis connection failed', error: err.message });
    client = null;
  }
};

export const getCache = async (key) => {
  if (!client) return null;
  try {
    return await client.get(key);
  } catch (err) {
    logger.warn({ message: 'Redis get failed', error: err.message });
    return null;
  }
};

export const setCache = async (key, value, ttl) => {
  if (!client) return;
  try {
    await client.set(key, value, { EX: ttl });
  } catch (err) {
    logger.warn({ message: 'Redis set failed', error: err.message });
  }
};

export default { initCache, getCache, setCache };
