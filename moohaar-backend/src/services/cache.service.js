import config from '../config/index';
import logger from '../utils/logger';

let client;

export const initCache = async () => {
  try {
    const { createClient } = await import('redis'); // eslint-disable-line import/no-unresolved
    client = createClient({ url: config.REDIS_URL });
    client.on('error', (err) => {
      logger.error({ message: 'Redis error', error: err.message });
    });
    await client.connect();
    logger.info({ message: 'Redis connected' });
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
