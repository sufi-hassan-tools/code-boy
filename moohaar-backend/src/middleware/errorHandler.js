// Centralized error handling middleware
// Logs the stack and sends consistent JSON responses
export default (err, req, res, _next) => {
  console.error(err.stack);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  return res.status(500).json({ message: 'Internal server error' });
};
