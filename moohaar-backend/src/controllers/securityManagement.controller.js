import BlockedIp from '../models/blockedIp.model.js';
import AdminAuditLog from '../models/adminAuditLog.model.js';
import AdminSession from '../models/adminSession.model.js';
import AdminRole from '../models/adminRole.model.js';

// Helper function to log admin actions
const logAdminAction = async (adminId, action, category, description, target = null, metadata = null, req = null, status = 'SUCCESS', error = null, severity = 'MEDIUM') => {
  try {
    await AdminAuditLog.create({
      adminId,
      action,
      category,
      description,
      target,
      metadata,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.get('User-Agent'),
      status,
      error,
      severity,
    });
  } catch (err) {
    console.error('Failed to log admin action:', err);
  }
};

// Get all blocked IPs
export const getBlockedIPs = async (req, res) => {
  try {
    // Check permissions
    if (!req.admin.permissions.system.manageBlacklist) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view blocked IPs'
      });
    }
    
    const { page = 1, limit = 20, active = 'all' } = req.query;
    const skip = (page - 1) * limit;
    
    // Build filter
    let filter = {};
    if (active === 'true') {
      filter.isActive = true;
    } else if (active === 'false') {
      filter.isActive = false;
    }
    
    const [blockedIPs, total] = await Promise.all([
      BlockedIp.find(filter)
        .populate('blockedBy', 'name email role')
        .populate('unblocked.by', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      BlockedIp.countDocuments(filter)
    ]);
    
    return res.status(200).json({
      success: true,
      data: {
        blockedIPs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get blocked IPs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Manually block an IP address
export const blockIP = async (req, res) => {
  try {
    const { ipAddress, reason } = req.body;
    
    // Check permissions
    if (!req.admin.permissions.system.manageBlacklist) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to block IPs'
      });
    }
    
    // Validate input
    if (!ipAddress || !reason) {
      return res.status(400).json({
        success: false,
        message: 'IP address and reason are required'
      });
    }
    
    // Check if IP is already blocked
    const existingBlock = await BlockedIp.findOne({ ipAddress });
    
    if (existingBlock) {
      if (existingBlock.isActive) {
        return res.status(409).json({
          success: false,
          message: 'IP address is already blocked'
        });
      } else {
        // Reactivate existing block
        existingBlock.isActive = true;
        existingBlock.reason = reason;
        existingBlock.blockedBy = req.admin._id;
        existingBlock.blockType = 'MANUAL';
        existingBlock.unblocked = undefined;
        await existingBlock.save();
        
        await logAdminAction(
          req.admin._id,
          'REACTIVATE_IP_BLOCK',
          'SYSTEM',
          'Reactivated IP block',
          { type: 'ip', id: ipAddress },
          { reason, previouslyBlocked: true },
          req,
          'SUCCESS',
          null,
          'HIGH'
        );
        
        return res.status(200).json({
          success: true,
          message: 'IP address block reactivated',
          blockedIP: existingBlock
        });
      }
    }
    
    // Create new IP block
    const blockedIP = await BlockedIp.create({
      ipAddress,
      reason,
      blockedBy: req.admin._id,
      blockType: 'MANUAL',
      isActive: true
    });
    
    await blockedIP.populate('blockedBy', 'name email role');
    
    // Force logout any admins currently using this IP
    const affectedSessions = await AdminSession.find({
      ipAddress,
      isActive: true
    }).populate('adminId', 'name email');
    
    if (affectedSessions.length > 0) {
      await AdminSession.updateMany(
        { ipAddress, isActive: true },
        {
          isActive: false,
          forcedLogout: {
            by: req.admin._id,
            reason: 'IP address blocked',
            at: new Date()
          }
        }
      );
      
      // Update admin online status
      const adminIds = affectedSessions.map(session => session.adminId._id);
      await AdminRole.updateMany(
        { _id: { $in: adminIds } },
        { isOnline: false, lastActivity: new Date() }
      );
    }
    
    await logAdminAction(
      req.admin._id,
      'BLOCK_IP',
      'SYSTEM',
      'Manually blocked IP address',
      { type: 'ip', id: ipAddress },
      { 
        reason, 
        affectedSessions: affectedSessions.length,
        affectedAdmins: affectedSessions.map(s => s.adminId.name)
      },
      req,
      'SUCCESS',
      null,
      'HIGH'
    );
    
    return res.status(201).json({
      success: true,
      message: `IP address blocked successfully. ${affectedSessions.length} active sessions terminated.`,
      blockedIP,
      affectedSessions: affectedSessions.length
    });
    
  } catch (error) {
    console.error('Block IP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Unblock an IP address
export const unblockIP = async (req, res) => {
  try {
    const { ipId } = req.params;
    const { reason } = req.body;
    
    // Check permissions (only owner admin can unblock)
    if (req.admin.role !== 'owner_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only owner admin can unblock IP addresses'
      });
    }
    
    // Find blocked IP
    const blockedIP = await BlockedIp.findById(ipId);
    if (!blockedIP) {
      return res.status(404).json({
        success: false,
        message: 'Blocked IP not found'
      });
    }
    
    if (!blockedIP.isActive) {
      return res.status(400).json({
        success: false,
        message: 'IP address is not currently blocked'
      });
    }
    
    // Unblock the IP
    blockedIP.isActive = false;
    blockedIP.unblocked = {
      by: req.admin._id,
      at: new Date(),
      reason: reason || 'Unblocked by owner admin'
    };
    await blockedIP.save();
    
    await blockedIP.populate([
      { path: 'blockedBy', select: 'name email role' },
      { path: 'unblocked.by', select: 'name email role' }
    ]);
    
    await logAdminAction(
      req.admin._id,
      'UNBLOCK_IP',
      'SYSTEM',
      'Unblocked IP address',
      { type: 'ip', id: blockedIP.ipAddress },
      { reason: reason || 'Unblocked by owner admin', originalReason: blockedIP.reason },
      req,
      'SUCCESS',
      null,
      'MEDIUM'
    );
    
    return res.status(200).json({
      success: true,
      message: 'IP address unblocked successfully',
      blockedIP
    });
    
  } catch (error) {
    console.error('Unblock IP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get system audit logs
export const getAuditLogs = async (req, res) => {
  try {
    // Check permissions
    if (!req.admin.permissions.system.viewAuditLogs) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view audit logs'
      });
    }
    
    const { 
      page = 1, 
      limit = 50, 
      category, 
      action, 
      adminId, 
      severity,
      startDate,
      endDate,
      search
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build filter
    let filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (action) {
      filter.action = { $regex: action, $options: 'i' };
    }
    
    if (adminId) {
      filter.adminId = adminId;
    }
    
    if (severity) {
      filter.severity = severity;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }
    
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } }
      ];
    }
    
    const [auditLogs, total] = await Promise.all([
      AdminAuditLog.find(filter)
        .populate('adminId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AdminAuditLog.countDocuments(filter)
    ]);
    
    return res.status(200).json({
      success: true,
      data: {
        auditLogs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get audit logs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get system statistics
export const getSystemStats = async (req, res) => {
  try {
    // Check permissions
    if (!req.admin.permissions.system.viewSettings) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view system statistics'
      });
    }
    
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Get various statistics
    const [
      totalAdmins,
      activeAdmins,
      onlineAdmins,
      pendingApprovals,
      blockedIPs,
      activeSessions,
      recentLogins,
      failedLogins24h,
      auditLogs24h,
      auditLogs7d,
      auditLogs30d
    ] = await Promise.all([
      AdminRole.countDocuments({ status: 'approved' }),
      AdminRole.countDocuments({ status: 'approved', lastActivity: { $gte: last7Days } }),
      AdminRole.countDocuments({ isOnline: true }),
      AdminRole.countDocuments({ status: 'pending' }),
      BlockedIp.countDocuments({ isActive: true }),
      AdminSession.countDocuments({ isActive: true }),
      AdminAuditLog.countDocuments({ 
        action: 'SUCCESSFUL_LOGIN', 
        createdAt: { $gte: last24Hours } 
      }),
      AdminAuditLog.countDocuments({ 
        action: { $in: ['FAILED_LOGIN', 'FAILED_2FA'] }, 
        createdAt: { $gte: last24Hours } 
      }),
      AdminAuditLog.countDocuments({ createdAt: { $gte: last24Hours } }),
      AdminAuditLog.countDocuments({ createdAt: { $gte: last7Days } }),
      AdminAuditLog.countDocuments({ createdAt: { $gte: last30Days } })
    ]);
    
    // Get activity by category (last 7 days)
    const activityByCategory = await AdminAuditLog.aggregate([
      { $match: { createdAt: { $gte: last7Days } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get top active admins (last 7 days)
    const topActiveAdmins = await AdminAuditLog.aggregate([
      { $match: { createdAt: { $gte: last7Days } } },
      { $group: { _id: '$adminId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'adminroles', localField: '_id', foreignField: '_id', as: 'admin' } },
      { $unwind: '$admin' },
      { $project: { adminName: '$admin.name', adminEmail: '$admin.email', adminRole: '$admin.role', activityCount: '$count' } }
    ]);
    
    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalAdmins,
          activeAdmins,
          onlineAdmins,
          pendingApprovals,
          blockedIPs,
          activeSessions
        },
        security: {
          recentLogins,
          failedLogins24h,
          blockedIPs
        },
        activity: {
          auditLogs24h,
          auditLogs7d,
          auditLogs30d,
          activityByCategory,
          topActiveAdmins
        },
        timestamp: now
      }
    });
    
  } catch (error) {
    console.error('Get system stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get real-time admin activity
export const getRealTimeActivity = async (req, res) => {
  try {
    // Check permissions
    if (!req.admin.permissions.adminManagement.viewAdmins) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view real-time activity'
      });
    }
    
    const last5Minutes = new Date(Date.now() - 5 * 60 * 1000);
    
    // Get recent activity
    const recentActivity = await AdminAuditLog.find({
      createdAt: { $gte: last5Minutes }
    }).populate('adminId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Get currently online admins
    const onlineAdmins = await AdminRole.find({
      isOnline: true,
      lastActivity: { $gte: new Date(Date.now() - 10 * 60 * 1000) } // Active in last 10 minutes
    }).select('name email role lastActivity')
      .sort({ lastActivity: -1 });
    
    // Get active sessions
    const activeSessions = await AdminSession.find({
      isActive: true,
      lastActivity: { $gte: last5Minutes }
    }).populate('adminId', 'name email role')
      .sort({ lastActivity: -1 });
    
    return res.status(200).json({
      success: true,
      data: {
        recentActivity,
        onlineAdmins,
        activeSessions,
        timestamp: new Date()
      }
    });
    
  } catch (error) {
    console.error('Get real-time activity error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export default {
  getBlockedIPs,
  blockIP,
  unblockIP,
  getAuditLogs,
  getSystemStats,
  getRealTimeActivity,
};