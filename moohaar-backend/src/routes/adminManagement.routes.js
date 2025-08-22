import express from 'express';
import {
  approveSuperAdmin,
  createAdmin,
  getAllAdmins,
  getPendingApprovals,
  updateAdminPermissions,
  forceLogoutAdmin,
  deleteAdmin,
  getAdminActivity,
} from '../controllers/adminManagement.controller.js';
import { 
  authenticateAdmin, 
  requireOwnerAdmin, 
  requirePermission,
  checkSessionTimeout 
} from '../middleware/superAdminAuth.js';

const router = express.Router();

// Apply authentication and session timeout check to all routes
router.use(authenticateAdmin);
router.use(checkSessionTimeout);

// Approve super admin (owner admin only)
router.post('/approve/:adminId', requireOwnerAdmin, approveSuperAdmin);

// Get pending super admin approvals (owner admin only)
router.get('/pending-approvals', requireOwnerAdmin, getPendingApprovals);

// Create new admin/manager/editor
router.post('/create', 
  requirePermission('adminManagement', 'createAdmins'),
  createAdmin
);

// Get all admins
router.get('/all', 
  requirePermission('adminManagement', 'viewAdmins'),
  getAllAdmins
);

// Update admin permissions
router.put('/permissions/:adminId', 
  requirePermission('adminManagement', 'editAdmins'),
  updateAdminPermissions
);

// Force logout admin
router.post('/force-logout/:adminId', 
  forceLogoutAdmin
);

// Delete/suspend admin
router.delete('/:adminId', 
  requirePermission('adminManagement', 'deleteAdmins'),
  deleteAdmin
);

// Get admin activity (30 days + live)
router.get('/activity/:adminId', 
  getAdminActivity
);

export default router;