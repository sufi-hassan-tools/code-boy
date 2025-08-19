import jwt from 'jsonwebtoken';
import config from '../config/index';
import Admin from '../models/admin.model';

export default async (req, res, next) => {
  const { adminToken } = req.cookies || {};
  let token = adminToken;
  if (!token) {
    const { authorization: header } = req.headers;
    if (header && header.startsWith('Bearer ')) {
      [, token] = header.split(' ');
    }
  }
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const admin = await Admin.findById(decoded.adminId);
    if (!admin) return res.status(401).json({ message: 'Invalid token' });
    req.admin = { id: admin.id, role: admin.role };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
