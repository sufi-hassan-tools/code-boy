/* eslint-disable no-underscore-dangle, no-plusplus, consistent-return, radix */
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';
import Admin from '../models/admin.model.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { sendAdminInvitation } from '../services/email.service.js';

// Rate limiter for super admin registration - max 5 attempts per hour
export const superAdminRegistrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { message: 'Too many super admin registration attempts. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Generate unique admin URL
const generateUniqueUrl = (name, role) => {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanRole = role.toLowerCase().replace(/[^a-z0-9]/g, '');
  const uniqueId = crypto.randomBytes(6).toString('hex');
  return `${cleanName}/${cleanRole}/${uniqueId}`;
};

// Generate strong password
const generateStrongPassword = () => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// Super Admin Registration
export const registerSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Name, email and password are required' 
      });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ 
        message: 'Email already registered' 
      });
    }

    const superAdminCount = await Admin.countDocuments({ role: 'superadmin' });
    if (superAdminCount >= 5) {
      return res.status(403).json({ 
        message: 'Maximum super admin limit reached (5)' 
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const superAdmin = await Admin.create({
      name,
      email,
      passwordHash,
      role: 'superadmin',
      permissions: {
        themeManagement: true,
        addonManagement: true,
        userManagement: true,
        storeManagement: true,
        analyticsAccess: true,
        systemSettings: true,
      },
      isInvitationAccepted: true,
      lastLogin: new Date(),
    });

    const token = jwt.sign(
      { 
        adminId: superAdmin.id, 
        role: superAdmin.role,
        permissions: superAdmin.permissions 
      },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    logger.info({ 
      message: 'Super admin registered successfully', 
      adminId: superAdmin.id,
      email: superAdmin.email 
    });

    res.status(201).json({
      message: 'Super admin registered successfully',
      admin: {
        id: superAdmin.id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: superAdmin.role,
        permissions: superAdmin.permissions,
      },
    });
  } catch (error) {
    logger.error({ 
      message: 'Super admin registration failed', 
      error: error.message 
    });
    res.status(500).json({ 
      message: 'Registration failed. Please try again.' 
    });
  }
};

// Create new admin
export const createAdmin = async (req, res) => {
  try {
    const { name, email, role, permissions } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ 
        message: 'Name, email and role are required' 
      });
    }

    const validRoles = ['admin', 'manager', 'editor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role. Must be admin, manager, or editor' 
      });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ 
        message: 'Email already registered' 
      });
    }

    const generatedPassword = generateStrongPassword();
    const passwordHash = await bcrypt.hash(generatedPassword, 12);
    const uniqueUrl = generateUniqueUrl(name, role);
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newAdmin = await Admin.create({
      name,
      email,
      passwordHash,
      role,
      permissions: permissions || {},
      uniqueUrl,
      createdBy: req.admin.id,
      invitationToken,
      invitationExpiry,
      isInvitationAccepted: false,
    });

    await sendAdminInvitation(newAdmin, invitationToken, generatedPassword);

    logger.info({ 
      message: 'Admin created successfully', 
      adminId: newAdmin.id,
      email: newAdmin.email,
      role: newAdmin.role,
      createdBy: req.admin.id 
    });

    res.status(201).json({
      message: 'Admin created successfully. Invitation sent via email.',
      admin: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        permissions: newAdmin.permissions,
        uniqueUrl: newAdmin.uniqueUrl,
      },
    });
  } catch (error) {
    logger.error({ 
      message: 'Admin creation failed', 
      error: error.message 
    });
    res.status(500).json({ 
      message: 'Failed to create admin. Please try again.' 
    });
  }
};

// Accept invitation
export const acceptInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const admin = await Admin.findOne({
      invitationToken: token,
      invitationExpiry: { $gt: new Date() },
      isInvitationAccepted: false,
    });

    if (!admin) {
      return res.status(400).json({ 
        message: 'Invalid or expired invitation token' 
      });
    }

    if (newPassword) {
      admin.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    admin.isInvitationAccepted = true;
    admin.invitationToken = undefined;
    admin.invitationExpiry = undefined;
    await admin.save();

    logger.info({ 
      message: 'Admin invitation accepted', 
      adminId: admin.id,
      email: admin.email 
    });

    res.json({
      message: 'Invitation accepted successfully',
      adminUrl: `/admin/${admin.uniqueUrl}`,
    });
  } catch (error) {
    logger.error({ 
      message: 'Invitation acceptance failed', 
      error: error.message 
    });
    res.status(500).json({ 
      message: 'Failed to accept invitation. Please try again.' 
    });
  }
};

// Admin login via unique URL
export const loginViaUniqueUrl = async (req, res) => {
  try {
    const { uniqueUrl } = req.params;
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    const admin = await Admin.findOne({ 
      uniqueUrl, 
      email, 
      isActive: true,
      isInvitationAccepted: true 
    });

    if (!admin) {
      return res.status(401).json({ 
        message: 'Invalid credentials or inactive account' 
      });
    }

    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      { 
        adminId: admin.id, 
        role: admin.role,
        permissions: admin.permissions 
      },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    logger.info({ 
      message: 'Admin logged in successfully', 
      adminId: admin.id,
      email: admin.email,
      uniqueUrl: admin.uniqueUrl 
    });

    res.json({
      message: 'Login successful',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        uniqueUrl: admin.uniqueUrl,
      },
    });
  } catch (error) {
    logger.error({ 
      message: 'Admin login failed', 
      error: error.message 
    });
    res.status(500).json({ 
      message: 'Login failed. Please try again.' 
    });
  }
};

// Get current admin info
export const getCurrentAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-passwordHash -resetTokenHash -invitationToken');
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ 
        message: 'Admin not found or inactive' 
      });
    }

    res.json({
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        uniqueUrl: admin.uniqueUrl,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (error) {
    logger.error({ 
      message: 'Failed to get current admin', 
      error: error.message 
    });
    res.status(500).json({ 
      message: 'Failed to get admin information' 
    });
  }
};

// Update admin permissions
export const updateAdminPermissions = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { permissions, isActive } = req.body;

    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ 
        message: 'Only super admin can update permissions' 
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ 
        message: 'Admin not found' 
      });
    }

    if (admin.role === 'superadmin') {
      return res.status(403).json({ 
        message: 'Cannot modify super admin permissions' 
      });
    }

    if (permissions) {
      admin.permissions = { ...admin.permissions, ...permissions };
    }
    if (typeof isActive === 'boolean') {
      admin.isActive = isActive;
    }

    await admin.save();

    logger.info({ 
      message: 'Admin permissions updated', 
      adminId: admin.id,
      updatedBy: req.admin.id 
    });

    res.json({
      message: 'Admin permissions updated successfully',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
      },
    });
  } catch (error) {
    logger.error({ 
      message: 'Failed to update admin permissions', 
      error: error.message 
    });
    res.status(500).json({ 
      message: 'Failed to update permissions' 
    });
  }
};

// List all admins
export const listAdmins = async (req, res) => {
  try {
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ 
        message: 'Only super admin can view all admins' 
      });
    }

    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { role: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const admins = await Admin.find(query)
      .select('-passwordHash -resetTokenHash -invitationToken')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await Admin.countDocuments(query);

    res.json({
      admins,
      pagination: {
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(total / parseInt(limit, 10)),
        totalAdmins: total,
        hasNext: skip + admins.length < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    logger.error({ 
      message: 'Failed to list admins', 
      error: error.message 
    });
    res.status(500).json({ 
      message: 'Failed to fetch admins' 
    });
  }
};

// Admin logout
export const logout = async (req, res) => {
  try {
    res.clearCookie('adminToken');
    
    logger.info({ 
      message: 'Admin logged out', 
      adminId: req.admin.id 
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error({ 
      message: 'Logout failed', 
      error: error.message 
    });
    res.status(500).json({ 
      message: 'Logout failed' 
    });
  }
};

// Delete admin
export const deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ 
        message: 'Only super admin can delete admins' 
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ 
        message: 'Admin not found' 
      });
    }

    if (admin.role === 'superadmin') {
      return res.status(403).json({ 
        message: 'Cannot delete super admin' 
      });
    }

    await Admin.findByIdAndDelete(adminId);

    logger.info({ 
      message: 'Admin deleted', 
      deletedAdminId: adminId,
      deletedBy: req.admin.id 
    });

    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    logger.error({ 
      message: 'Failed to delete admin', 
      error: error.message 
    });
    res.status(500).json({ 
      message: 'Failed to delete admin' 
    });
  }
};