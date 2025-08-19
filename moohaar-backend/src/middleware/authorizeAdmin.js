export default (req, res, next) => {
  if (req.admin || (req.user && req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden' });
};
