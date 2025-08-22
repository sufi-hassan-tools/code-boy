import jwt from 'jsonwebtoken';
import AdminRole from '../models/adminRole.model.js';
import AdminSession from '../models/adminSession.model.js';
import BlockedIp from '../models/blockedIp.model.js';
import config from '../config/index.js';

// Main authentication middleware
export const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.adminToken;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    // Check if session exists and is active
    const session = await AdminSession.findById(decoded.sessionId);
    if (!session || !session.isActive || session.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid'
      });
    }
    
    // Check if admin exists and is approved
    const admin = await AdminRole.findById(decoded.adminId);
    if (!admin || admin.status !== 'approved') {
      return res.status(401).json({
        success: false,
        message: 'Admin account not found or not approved'
      });
    }
    
    // Check if admin account is locked
    if (admin.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is locked. Contact owner admin.'
      });
    }
    
    // Check IP blocking
    const ip = req.ip || req.connection.remoteAddress;
    const blockedIp = await BlockedIp.findOne({ 
      ipAddress: ip, 
      isActive: true 
    });
    
    if (blockedIp) {
      return res.status(423).json({
        success: false,
        message: 'IP address is blocked. Contact owner admin.',
        blocked: true
      });
    }
    
    // Update last activity
    await Promise.all([
      AdminRole.findByIdAndUpdate(admin._id, {
        lastActivity: new Date(),
        isOnline: true
      }),
      AdminSession.findByIdAndUpdate(session._id, {
        lastActivity: new Date()
      })
    ]);
    
    // Attach admin and session info to request
    req.admin = admin;
    req.session = session;
    req.sessionId = session._id;
    req.permissions = admin.permissions;
    
    next();
    
  } catch (error) {
    // Removed console.error for production
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Role-based authorization middleware
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

// Permission-based authorization middleware
export const requirePermission = (category, action) => {
  return (req, res, next) => {
    if (!req.admin || !req.permissions) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const hasPermission = req.permissions[category] && req.permissions[category][action];
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Permission denied: ${category}.${action}`
      });
    }
    
    next();
  };
};

// Owner admin only middleware
export const requireOwnerAdmin = (req, res, next) => {
  if (!req.admin || req.admin.role !== 'owner_admin') {
    return res.status(403).json({
      success: false,
      message: 'Owner admin access required'
    });
  }
  next();
};

// Super admin or higher middleware
export const requireSuperAdminOrHigher = (req, res, next) => {
  if (!req.admin || !['owner_admin', 'super_admin'].includes(req.admin.role)) {
    return res.status(403).json({
      success: false,
      message: 'Super admin or owner admin access required'
    });
  }
  next();
};

// Rate limiting middleware for login attempts
export const rateLimitLogin = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    
    // Check if IP is blocked
    const blockedIp = await BlockedIp.findOne({ 
      ipAddress: ip, 
      isActive: true 
    });
    
    if (blockedIp) {
      return res.status(423).json({
        success: false,
        message: 'IP address is permanently blocked due to multiple failed login attempts. Contact owner admin to unblock.',
        blocked: true,
        reason: blockedIp.reason
      });
    }
    
    next();
    
  } catch (error) {
    // Removed console.error for production
    next(); // Continue on error to not block legitimate requests
  }
};

// Session timeout checker
export const checkSessionTimeout = async (req, res, next) => {
  try {
    if (!req.admin || !req.session) {
      return next();
    }
    
    const now = new Date();
    const sessionAge = now - req.session.lastActivity;
    
    // Check if session has exceeded admin's timeout
    if (sessionAge > req.admin.sessionTimeout) {
      // Deactivate session
      await AdminSession.findByIdAndUpdate(req.session._id, {
        isActive: false,
        forcedLogout: {
          reason: 'Session timeout',
          at: now
        }
      });
      
      // Update admin status
      await AdminRole.findByIdAndUpdate(req.admin._id, {
        isOnline: false,
        lastActivity: now
      });
      
      // Clear cookie
      res.clearCookie('adminToken');
      
      return res.status(401).json({
        success: false,
        message: 'Session expired due to inactivity',
        sessionExpired: true
      });
    }
    
    next();
    
  } catch (error) {
    // Removed console.error for production
    next(); // Continue on error
  }
};

// Middleware to log admin activities
export const logActivity = (action, category, description) => {
  return async (req, res, next) => {
    // Store activity info in request for later logging
    req.activityLog = {
      action,
      category,
      description
    };
    next();
  };
};

export default {
  authenticateAdmin,
  requireRole,
  requirePermission,
  requireOwnerAdmin,
  requireSuperAdminOrHigher,
  rateLimitLogin,
  checkSessionTimeout,
  logActivity,
};