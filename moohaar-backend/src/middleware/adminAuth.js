import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import Admin from '../models/admin.model.js';
import logger from '../utils/logger.js';

// Enhanced admin authentication middleware
export default async (req, res, next) => {
  try {
    const { adminToken } = req.cookies || {};
    let token = adminToken;
    
    if (!token) {
      const { authorization: header } = req.headers;
      if (header && header.startsWith('Bearer ')) {
        [, token] = header.split(' ');
      }
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const admin = await Admin.findById(decoded.adminId).select('-passwordHash -resetTokenHash -invitationToken');
    
    if (!admin || !admin.isActive || !admin.isInvitationAccepted) {
      return res.status(401).json({ message: 'Invalid token or inactive account' });
    }

    // Attach full admin info to request
    req.admin = {
      _id: admin._id,
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      uniqueUrl: admin.uniqueUrl,
    };
    
    return next();
  } catch (err) {
    logger.error({ 
      message: 'Admin authentication failed', 
      error: err.message 
    });
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Permission check middleware factory
export const requirePermission = (permission) => {
  return (req, res, next) => {
    // Super admin has all permissions
    if (req.admin.role === 'superadmin') {
      return next();
    }

    // Check if admin has required permission
    if (!req.admin.permissions || !req.admin.permissions[permission]) {
      return res.status(403).json({ 
        message: `Access denied. Required permission: ${permission}` 
      });
    }

    return next();
  };
};

// Role check middleware factory
export const requireRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
      });
    }
    return next();
  };
};
