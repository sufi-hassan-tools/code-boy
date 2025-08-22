import crypto from 'crypto';
import bcrypt from 'bcrypt';
import AdminRole from '../models/adminRole.model.js';
import AdminSession from '../models/adminSession.model.js';
import AdminAuditLog from '../models/adminAuditLog.model.js';
// import BlockedIp from '../models/blockedIp.model.js';
import EmailService from '../services/emailService.js';

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

// Generate temporary password
const generateTempPassword = () => crypto.randomBytes(8).toString('hex').toUpperCase();

// Approve super admin (only owner admin can do this)
export const approveSuperAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { approved, customPermissions } = req.body;
    
    // Check if current user is owner admin
    if (req.admin.role !== 'owner_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only owner admin can approve super admins'
      });
    }
    
    // Find pending super admin
    const superAdmin = await AdminRole.findById(adminId);
    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Super admin not found'
      });
    }
    
    if (superAdmin.role !== 'super_admin' || superAdmin.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Invalid super admin or already processed'
      });
    }
    
    if (approved) {
      // Approve the super admin
      superAdmin.status = 'approved';
      superAdmin.approvedBy = req.admin._id;
      superAdmin.approvedAt = new Date();
      
      // Update permissions if provided
      if (customPermissions) {
        superAdmin.permissions = { ...superAdmin.permissions, ...customPermissions };
      }
      
      // Generate unique URL
      superAdmin.uniqueUrl = superAdmin.generateUniqueUrl();
      
      await superAdmin.save();
      
      // Send approval email with login credentials
      await EmailService.sendAdminCredentials(
        superAdmin.email,
        superAdmin.name,
        superAdmin.uniqueUrl,
        'Use your existing password'
      );
      
      await logAdminAction(
        req.admin._id,
        'APPROVE_SUPER_ADMIN',
        'ADMIN',
        'Super admin approved',
        { type: 'admin', id: superAdmin._id.toString(), name: superAdmin.name },
        { approvedAdminEmail: superAdmin.email, uniqueUrl: superAdmin.uniqueUrl },
        req,
        'SUCCESS',
        null,
        'HIGH'
      );
      
      return res.status(200).json({
        success: true,
        message: 'Super admin approved successfully',
        admin: {
          id: superAdmin._id,
          name: superAdmin.name,
          email: superAdmin.email,
          role: superAdmin.role,
          status: superAdmin.status,
          uniqueUrl: superAdmin.uniqueUrl,
          permissions: superAdmin.permissions,
        }
      });
      
    } 
      // Reject the super admin
      await AdminRole.findByIdAndDelete(adminId);
      
      await logAdminAction(
        req.admin._id,
        'REJECT_SUPER_ADMIN',
        'ADMIN',
        'Super admin registration rejected',
        { type: 'admin', id: superAdmin._id.toString(), name: superAdmin.name },
        { rejectedAdminEmail: superAdmin.email },
        req,
        'SUCCESS',
        null,
        'MEDIUM'
      );
      
      return res.status(200).json({
        success: true,
        message: 'Super admin registration rejected'
      });
    
    
  } catch (error) {
    console.error('Approve super admin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new admin/manager/editor
export const createAdmin = async (req, res) => {
  try {
    const { name, email, role, permissions, sessionTimeout } = req.body;
    
    // Check permissions
    if (!req.admin.permissions.adminManagement.createAdmins) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create admins'
      });
    }
    
    // Validate role hierarchy
    const roleHierarchy = {
      'owner_admin': 5,
      'super_admin': 4,
      'admin': 3,
      'manager': 2,
      'editor': 1
    };
    
    const currentUserLevel = roleHierarchy[req.admin.role] || 0;
    const newUserLevel = roleHierarchy[role] || 0;
    
    if (newUserLevel >= currentUserLevel) {
      return res.status(403).json({
        success: false,
        message: 'You cannot create admins with equal or higher privileges'
      });
    }
    
    // Validate required fields
    if (!name || !email || !role || !permissions) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, role, and permissions are required'
      });
    }
    
    // Check if email already exists
    const existingAdmin = await AdminRole.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    // Generate temporary password
    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);
    
    // Create admin
    const newAdmin = await AdminRole.create({
      name,
      email,
      passwordHash,
      role,
      status: 'approved', // Auto-approved when created by authorized admin
      createdBy: req.admin._id,
      approvedBy: req.admin._id,
      approvedAt: new Date(),
      permissions,
      sessionTimeout: sessionTimeout || 7200000, // Default 2 hours
    });
    
    // Generate unique URL
    newAdmin.uniqueUrl = newAdmin.generateUniqueUrl();
    await newAdmin.save();
    
    // Send credentials email
    await EmailService.sendAdminCredentials(
      newAdmin.email,
      newAdmin.name,
      newAdmin.uniqueUrl,
      tempPassword
    );
    
    // Log the action
    await logAdminAction(
      req.admin._id,
      'CREATE_ADMIN',
      'ADMIN',
      `Created new ${role}`,
      { type: 'admin', id: newAdmin._id.toString(), name: newAdmin.name },
      { 
        newAdminEmail: newAdmin.email, 
        newAdminRole: newAdmin.role,
        uniqueUrl: newAdmin.uniqueUrl,
        permissions: newAdmin.permissions 
      },
      req,
      'SUCCESS',
      null,
      'HIGH'
    );
    
    return res.status(201).json({
      success: true,
      message: `${role} created successfully. Credentials sent via email.`,
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        status: newAdmin.status,
        uniqueUrl: newAdmin.uniqueUrl,
        permissions: newAdmin.permissions,
        createdAt: newAdmin.createdAt,
      }
    });
    
  } catch (error) {
    console.error('Create admin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all admins (with filtering and pagination)
export const getAllAdmins = async (req, res) => {
  try {
    // Check permissions
    if (!req.admin.permissions.adminManagement.viewAdmins) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view admins'
      });
    }
    
    const { page = 1, limit = 10, role, status, search } = req.query;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter = {};
    
    if (role) {
      filter.role = role;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get admins with pagination
    const [admins, total] = await Promise.all([
      AdminRole.find(filter)
        .select('-passwordHash -twoFactorAuth.secret -resetTokenHash')
        .populate('createdBy', 'name email role')
        .populate('approvedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AdminRole.countDocuments(filter)
    ]);
    
    return res.status(200).json({
      success: true,
      data: {
        admins,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get all admins error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get pending super admin approvals
export const getPendingApprovals = async (req, res) => {
  try {
    // Check permissions (only owner admin can see pending approvals)
    if (req.admin.role !== 'owner_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only owner admin can view pending approvals'
      });
    }
    
    const pendingAdmins = await AdminRole.find({
      role: 'super_admin',
      status: 'pending'
    }).select('-passwordHash -twoFactorAuth.secret -resetTokenHash')
      .sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      data: pendingAdmins
    });
    
  } catch (error) {
    console.error('Get pending approvals error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update admin permissions
export const updateAdminPermissions = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { permissions, sessionTimeout } = req.body;
    
    // Check permissions
    if (!req.admin.permissions.adminManagement.editAdmins) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit admins'
      });
    }
    
    // Find target admin
    const targetAdmin = await AdminRole.findById(adminId);
    if (!targetAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    // Check role hierarchy
    const roleHierarchy = {
      'owner_admin': 5,
      'super_admin': 4,
      'admin': 3,
      'manager': 2,
      'editor': 1
    };
    
    const currentUserLevel = roleHierarchy[req.admin.role] || 0;
    const targetUserLevel = roleHierarchy[targetAdmin.role] || 0;
    
    if (targetUserLevel >= currentUserLevel) {
      return res.status(403).json({
        success: false,
        message: 'You cannot edit admins with equal or higher privileges'
      });
    }
    
    // Update permissions and session timeout
    const updates = {};
    if (permissions) {
      updates.permissions = permissions;
    }
    if (sessionTimeout) {
      updates.sessionTimeout = sessionTimeout;
    }
    
    const updatedAdmin = await AdminRole.findByIdAndUpdate(
      adminId,
      updates,
      { new: true }
    ).select('-passwordHash -twoFactorAuth.secret -resetTokenHash');
    
    // Log the action
    await logAdminAction(
      req.admin._id,
      'UPDATE_ADMIN_PERMISSIONS',
      'ADMIN',
      'Updated admin permissions',
      { type: 'admin', id: targetAdmin._id.toString(), name: targetAdmin.name },
      { updatedPermissions: permissions, updatedSessionTimeout: sessionTimeout },
      req,
      'SUCCESS',
      null,
      'MEDIUM'
    );
    
    return res.status(200).json({
      success: true,
      message: 'Admin permissions updated successfully',
      admin: updatedAdmin
    });
    
  } catch (error) {
    console.error('Update admin permissions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Force logout admin
export const forceLogoutAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    
    // Check permissions (only owner admin and super admin can force logout)
    if (!['owner_admin', 'super_admin'].includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to force logout admins'
      });
    }
    
    // Find target admin
    const targetAdmin = await AdminRole.findById(adminId);
    if (!targetAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    // Deactivate all sessions for the target admin
    const result = await AdminSession.updateMany(
      { adminId, isActive: true },
      { 
        isActive: false,
        forcedLogout: {
          by: req.admin._id,
          reason: 'Force logout by admin',
          at: new Date()
        }
      }
    );
    
    // Update admin status
    await AdminRole.findByIdAndUpdate(adminId, {
      isOnline: false,
      lastActivity: new Date()
    });
    
    // Log the action
    await logAdminAction(
      req.admin._id,
      'FORCE_LOGOUT',
      'ADMIN',
      'Forced admin logout',
      { type: 'admin', id: targetAdmin._id.toString(), name: targetAdmin.name },
      { sessionsDeactivated: result.modifiedCount },
      req,
      'SUCCESS',
      null,
      'HIGH'
    );
    
    return res.status(200).json({
      success: true,
      message: `Successfully logged out ${targetAdmin.name}. ${result.modifiedCount} sessions deactivated.`
    });
    
  } catch (error) {
    console.error('Force logout admin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete/suspend admin
export const deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { action = 'suspend' } = req.body; // 'suspend' or 'delete'
    
    // Check permissions
    if (!req.admin.permissions.adminManagement.deleteAdmins) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete/suspend admins'
      });
    }
    
    // Find target admin
    const targetAdmin = await AdminRole.findById(adminId);
    if (!targetAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    // Check role hierarchy
    const roleHierarchy = {
      'owner_admin': 5,
      'super_admin': 4,
      'admin': 3,
      'manager': 2,
      'editor': 1
    };
    
    const currentUserLevel = roleHierarchy[req.admin.role] || 0;
    const targetUserLevel = roleHierarchy[targetAdmin.role] || 0;
    
    if (targetUserLevel >= currentUserLevel) {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete/suspend admins with equal or higher privileges'
      });
    }
    
    if (action === 'delete') {
      // Permanently delete admin
      await AdminRole.findByIdAndDelete(adminId);
      
      // Deactivate all sessions
      await AdminSession.updateMany(
        { adminId },
        { isActive: false }
      );
      
      await logAdminAction(
        req.admin._id,
        'DELETE_ADMIN',
        'ADMIN',
        'Permanently deleted admin',
        { type: 'admin', id: targetAdmin._id.toString(), name: targetAdmin.name },
        { deletedAdminEmail: targetAdmin.email, deletedAdminRole: targetAdmin.role },
        req,
        'SUCCESS',
        null,
        'CRITICAL'
      );
      
      return res.status(200).json({
        success: true,
        message: 'Admin deleted permanently'
      });
      
    } 
      // Suspend admin
      const updatedAdmin = await AdminRole.findByIdAndUpdate(
        adminId,
        { 
          status: 'suspended',
          isOnline: false 
        },
        { new: true }
      );
      
      // Deactivate all active sessions
      await AdminSession.updateMany(
        { adminId, isActive: true },
        { 
          isActive: false,
          forcedLogout: {
            by: req.admin._id,
            reason: 'Admin suspended',
            at: new Date()
          }
        }
      );
      
      await logAdminAction(
        req.admin._id,
        'SUSPEND_ADMIN',
        'ADMIN',
        'Suspended admin',
        { type: 'admin', id: targetAdmin._id.toString(), name: targetAdmin.name },
        { suspendedAdminEmail: targetAdmin.email, suspendedAdminRole: targetAdmin.role },
        req,
        'SUCCESS',
        null,
        'HIGH'
      );
      
      return res.status(200).json({
        success: true,
        message: 'Admin suspended successfully',
        admin: updatedAdmin
      });
    
    
  } catch (error) {
    console.error('Delete/suspend admin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get admin activity (30 days + live)
export const getAdminActivity = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { days = 30 } = req.query;
    
    // Check permissions
    if (!req.admin.permissions.adminManagement.viewAdmins && 
        req.admin._id.toString() !== adminId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this admin activity'
      });
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Get audit logs for the admin
    const activities = await AdminAuditLog.find({
      adminId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 })
      .limit(1000); // Limit to prevent too much data
    
    // Get current session info
    const currentSessions = await AdminSession.find({
      adminId,
      isActive: true
    }).select('ipAddress userAgent lastActivity createdAt');
    
    // Get admin info
    const admin = await AdminRole.findById(adminId)
      .select('name email role isOnline lastActivity lastLogin');
    
    return res.status(200).json({
      success: true,
      data: {
        admin,
        activities,
        currentSessions,
        timeframe: `${days} days`
      }
    });
    
  } catch (error) {
    console.error('Get admin activity error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export default {
  approveSuperAdmin,
  createAdmin,
  getAllAdmins,
  getPendingApprovals,
  updateAdminPermissions,
  forceLogoutAdmin,
  deleteAdmin,
  getAdminActivity,
};