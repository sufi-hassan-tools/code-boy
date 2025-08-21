import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import AdminRole from '../models/adminRole.model.js';
import AdminSession from '../models/adminSession.model.js';
import AdminAuditLog from '../models/adminAuditLog.model.js';
import BlockedIp from '../models/blockedIp.model.js';
import EmailService from '../services/emailService.js';
import config from '../config/index.js';

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

// Helper function to check IP blocking
const checkIPBlocking = async (ip) => {
  const blockedIp = await BlockedIp.findOne({ ipAddress: ip, isActive: true });
  return blockedIp;
};

// Helper function to increment failed login attempts for IP
const handleFailedLogin = async (ip, email, userAgent) => {
  // Check if IP is already blocked
  let blockedIp = await BlockedIp.findOne({ ipAddress: ip });
  
  if (blockedIp) {
    if (blockedIp.isActive) {
      return { blocked: true, reason: blockedIp.reason };
    } else {
      // Reactivate if too many new attempts
      blockedIp.failedAttempts += 1;
      blockedIp.lastAttempt = {
        email,
        userAgent,
        timestamp: new Date(),
      };
      
      if (blockedIp.failedAttempts >= 5) {
        blockedIp.isActive = true;
        blockedIp.reason = `Auto-blocked after ${blockedIp.failedAttempts} failed login attempts`;
        await blockedIp.save();
        return { blocked: true, reason: blockedIp.reason };
      }
      await blockedIp.save();
    }
  } else {
    // Create new blocked IP record
    blockedIp = await BlockedIp.create({
      ipAddress: ip,
      reason: 'Failed login attempts',
      blockedBy: null, // System auto-block
      blockType: 'AUTO',
      failedAttempts: 1,
      lastAttempt: {
        email,
        userAgent,
        timestamp: new Date(),
      },
      isActive: false, // Not blocked yet, just tracking
    });
  }
  
  return { blocked: false, attempts: blockedIp.failedAttempts };
};

// Owner Admin Registration (sufimoohaaradmin URL)
export const registerOwnerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email and password are required' 
      });
    }
    
    // Check if this is the correct owner admin name
    if (name !== 'SUFI Hassan ms') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized registration attempt' 
      });
    }
    
    // Check if owner admin already exists
    const existingOwner = await AdminRole.findOne({ 
      role: 'owner_admin',
      status: 'approved'
    });
    
    if (existingOwner) {
      return res.status(409).json({ 
        success: false, 
        message: 'Owner admin already exists' 
      });
    }
    
    // Check if email already exists
    const existingEmail = await AdminRole.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create owner admin
    const ownerAdmin = await AdminRole.create({
      name,
      email,
      passwordHash,
      role: 'owner_admin',
      status: 'approved', // Auto-approved for owner admin
      approvedAt: new Date(),
      permissions: {
        // Owner admin has all permissions
        themes: { view: true, create: true, edit: true, delete: true, publish: true },
        users: { view: true, edit: true, delete: true, suspend: true },
        stores: { view: true, edit: true, delete: true, suspend: true },
        analytics: { view: true, export: true, advanced: true },
        adminManagement: { viewAdmins: true, createAdmins: true, editAdmins: true, deleteAdmins: true, manageRoles: true, approveAdmins: true },
        system: { viewSettings: true, editSettings: true, viewAuditLogs: true, manageBlacklist: true },
        addons: { view: true, upload: true, edit: true, delete: true, approve: true },
      },
      sessionTimeout: 14400000, // 4 hours for owner admin
    });
    
    // Set approvedBy to self
    ownerAdmin.approvedBy = ownerAdmin._id;
    await ownerAdmin.save();
    
    // Log the registration
    await logAdminAction(
      ownerAdmin._id,
      'OWNER_ADMIN_REGISTRATION',
      'AUTH',
      'Owner admin registered successfully',
      { type: 'admin', id: ownerAdmin._id.toString(), name: ownerAdmin.name },
      { email: ownerAdmin.email, role: ownerAdmin.role },
      req,
      'SUCCESS',
      null,
      'CRITICAL'
    );
    
    return res.status(201).json({
      success: true,
      message: 'Owner admin registered successfully',
      admin: {
        id: ownerAdmin._id,
        name: ownerAdmin.name,
        email: ownerAdmin.email,
        role: ownerAdmin.role,
        status: ownerAdmin.status,
      }
    });
    
  } catch (error) {
    console.error('Owner admin registration error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Super Admin Registration (requires owner admin approval)
export const registerSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email and password are required' 
      });
    }
    
    // Check super admin limit (5 total including owner admin)
    const superAdminCount = await AdminRole.countDocuments({ 
      role: { $in: ['owner_admin', 'super_admin'] },
      status: 'approved'
    });
    
    if (superAdminCount >= 5) {
      return res.status(403).json({ 
        success: false, 
        message: 'Super admin limit reached (maximum 5)' 
      });
    }
    
    // Check if email already exists
    const existingEmail = await AdminRole.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create super admin (pending approval)
    const superAdmin = await AdminRole.create({
      name,
      email,
      passwordHash,
      role: 'super_admin',
      status: 'pending', // Requires approval
      permissions: {
        // Default permissions for super admin (can be customized by owner admin)
        themes: { view: true, create: true, edit: true, delete: true, publish: true },
        users: { view: true, edit: true, delete: false, suspend: true },
        stores: { view: true, edit: true, delete: false, suspend: true },
        analytics: { view: true, export: true, advanced: true },
        adminManagement: { viewAdmins: true, createAdmins: true, editAdmins: true, deleteAdmins: false, manageRoles: true, approveAdmins: false },
        system: { viewSettings: true, editSettings: false, viewAuditLogs: true, manageBlacklist: false },
        addons: { view: true, upload: true, edit: true, delete: true, approve: true },
      },
      sessionTimeout: 7200000, // 2 hours for super admin
    });
    
    // Send notification to owner admin
    const ownerAdmin = await AdminRole.findOne({ 
      role: 'owner_admin', 
      status: 'approved' 
    });
    
    if (ownerAdmin) {
      await EmailService.sendApprovalNotification(
        ownerAdmin.email,
        superAdmin.name,
        superAdmin.email,
        superAdmin.role
      );
    }
    
    // Log the registration
    await logAdminAction(
      superAdmin._id,
      'SUPER_ADMIN_REGISTRATION',
      'AUTH',
      'Super admin registered and pending approval',
      { type: 'admin', id: superAdmin._id.toString(), name: superAdmin.name },
      { email: superAdmin.email, role: superAdmin.role },
      req,
      'SUCCESS',
      null,
      'HIGH'
    );
    
    return res.status(201).json({
      success: true,
      message: 'Super admin registration submitted. Awaiting owner admin approval.',
      admin: {
        id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: superAdmin.role,
        status: superAdmin.status,
      }
    });
    
  } catch (error) {
    console.error('Super admin registration error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Admin Login with 2FA
export const login = async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Check if IP is blocked
    const ipBlock = await checkIPBlocking(ip);
    if (ipBlock) {
      return res.status(423).json({ 
        success: false, 
        message: 'IP address is blocked. Contact owner admin to unblock.',
        blocked: true,
        reason: ipBlock.reason
      });
    }
    
    // Validate required fields
    if (!email || !password) {
      await handleFailedLogin(ip, email, userAgent);
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }
    
    // Find admin
    const admin = await AdminRole.findOne({ email });
    if (!admin) {
      await handleFailedLogin(ip, email, userAgent);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Check if admin account is locked
    if (admin.isLocked) {
      return res.status(423).json({ 
        success: false, 
        message: 'Account is locked due to too many failed login attempts. Contact owner admin.' 
      });
    }
    
    // Check if admin is approved
    if (admin.status !== 'approved') {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is not approved yet. Please wait for approval.' 
      });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!validPassword) {
      await admin.incLoginAttempts();
      await handleFailedLogin(ip, email, userAgent);
      
      await logAdminAction(
        admin._id,
        'FAILED_LOGIN',
        'AUTH',
        'Failed login attempt - invalid password',
        { type: 'admin', id: admin._id.toString(), name: admin.name },
        { email: admin.email, ip, userAgent },
        req,
        'FAILED',
        'Invalid password',
        'MEDIUM'
      );
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // If no OTP provided, send OTP and require 2FA
    if (!otp) {
      const otpCode = EmailService.generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      // Save OTP to admin record
      admin.twoFactorAuth.lastOtpUsed = null; // Clear previous OTP
      admin.twoFactorAuth.secret = otpCode;
      admin.twoFactorAuth.otpExpiry = otpExpiry;
      await admin.save();
      
      // Send OTP email
      const emailResult = await EmailService.sendOTP(admin.email, otpCode, admin.name);
      
      if (!emailResult.success) {
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to send OTP. Please try again.' 
        });
      }
      
      return res.status(200).json({
        success: true,
        requiresOTP: true,
        message: 'OTP sent to your email. Please enter the 8-character code.',
        adminId: admin._id, // Temporary ID for OTP verification
      });
    }
    
    // Verify OTP
    if (admin.twoFactorAuth.secret !== otp || 
        !admin.twoFactorAuth.otpExpiry || 
        admin.twoFactorAuth.otpExpiry < new Date()) {
      
      await logAdminAction(
        admin._id,
        'FAILED_2FA',
        'AUTH',
        'Failed 2FA verification',
        { type: 'admin', id: admin._id.toString(), name: admin.name },
        { email: admin.email, ip, userAgent, providedOTP: otp },
        req,
        'FAILED',
        'Invalid or expired OTP',
        'HIGH'
      );
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }
    
    // Clear OTP after successful verification
    admin.twoFactorAuth.lastOtpUsed = otp;
    admin.twoFactorAuth.secret = null;
    admin.twoFactorAuth.otpExpiry = null;
    admin.twoFactorAuth.enabled = true;
    
    // Reset login attempts on successful login
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    admin.lastLogin = new Date();
    admin.lastActivity = new Date();
    admin.isOnline = true;
    
    // Add IP to admin's IP list if not already there
    if (!admin.ipAddresses.includes(ip)) {
      admin.ipAddresses.push(ip);
    }
    
    await admin.save();
    
    // Create session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + admin.sessionTimeout);
    
    const session = await AdminSession.create({
      adminId: admin._id,
      sessionToken,
      ipAddress: ip,
      userAgent,
      expiresAt,
    });
    
    // Create JWT token
    const jwtToken = jwt.sign(
      { 
        adminId: admin._id, 
        role: admin.role,
        sessionId: session._id,
        permissions: admin.permissions,
      },
      config.JWT_SECRET,
      { expiresIn: admin.sessionTimeout / 1000 } // Convert to seconds
    );
    
    // Set HTTP-only cookie
    res.cookie('adminToken', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: admin.sessionTimeout,
    });
    
    // Log successful login
    await logAdminAction(
      admin._id,
      'SUCCESSFUL_LOGIN',
      'AUTH',
      'Admin logged in successfully',
      { type: 'admin', id: admin._id.toString(), name: admin.name },
      { email: admin.email, ip, userAgent, sessionId: session._id.toString() },
      req,
      'SUCCESS',
      null,
      'LOW'
    );
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        uniqueUrl: admin.uniqueUrl,
        lastLogin: admin.lastLogin,
      },
      sessionTimeout: admin.sessionTimeout,
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Get current admin info
export const getCurrentAdmin = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authenticated' 
      });
    }
    
    // Update last activity
    await AdminRole.findByIdAndUpdate(req.admin._id, {
      lastActivity: new Date(),
      isOnline: true,
    });
    
    return res.status(200).json({
      success: true,
      admin: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        role: req.admin.role,
        permissions: req.admin.permissions,
        uniqueUrl: req.admin.uniqueUrl,
        lastLogin: req.admin.lastLogin,
        lastActivity: req.admin.lastActivity,
      }
    });
    
  } catch (error) {
    console.error('Get current admin error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Admin logout
export const logout = async (req, res) => {
  try {
    const adminId = req.admin?._id;
    const sessionId = req.sessionId;
    
    if (sessionId) {
      // Deactivate session
      await AdminSession.findByIdAndUpdate(sessionId, {
        isActive: false,
        lastActivity: new Date(),
      });
    }
    
    if (adminId) {
      // Update admin status
      await AdminRole.findByIdAndUpdate(adminId, {
        isOnline: false,
        lastActivity: new Date(),
      });
      
      // Log logout
      await logAdminAction(
        adminId,
        'LOGOUT',
        'AUTH',
        'Admin logged out',
        { type: 'admin', id: adminId.toString(), name: req.admin?.name },
        { sessionId: sessionId?.toString() },
        req,
        'SUCCESS',
        null,
        'LOW'
      );
    }
    
    // Clear cookie
    res.clearCookie('adminToken');
    
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    console.error('Admin logout error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

export default {
  registerOwnerAdmin,
  registerSuperAdmin,
  login,
  getCurrentAdmin,
  logout,
};