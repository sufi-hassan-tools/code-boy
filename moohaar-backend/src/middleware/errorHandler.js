import logger from '../utils/logger.js';

// Centralized error handling middleware
// Logs the stack and sends consistent JSON responses
export default (err, req, res, _next) => {
  logger.error({ message: err.message, stack: err.stack });
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  return res.status(500).json({ message: 'Internal server error' });
};
