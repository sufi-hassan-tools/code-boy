import jwt from 'jsonwebtoken';
import config from '../config/index';

export default (req, res, next) => {
  const { token } = req.cookies || {};
  let jwtToken = token;
  if (!jwtToken) {
    const { authorization: header } = req.headers;
    if (header && header.startsWith('Bearer ')) {
      [, jwtToken] = header.split(' ');
    }
  }
  if (!jwtToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(jwtToken, config.JWT_SECRET);
    req.user = { id: decoded.userId, role: decoded.role };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
