import express from 'express';
import adminManagementController from '../controllers/adminManagement.controller.js';
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
router.post('/approve/:adminId', requireOwnerAdmin, adminManagementController.approveSuperAdmin);

// Get pending super admin approvals (owner admin only)
router.get('/pending-approvals', requireOwnerAdmin, adminManagementController.getPendingApprovals);

// Create new admin/manager/editor
router.post('/create', 
  requirePermission('adminManagement', 'createAdmins'),
  adminManagementController.createAdmin
);

// Get all admins
router.get('/all', 
  requirePermission('adminManagement', 'viewAdmins'),
  adminManagementController.getAllAdmins
);

// Update admin permissions
router.put('/permissions/:adminId', 
  requirePermission('adminManagement', 'editAdmins'),
  adminManagementController.updateAdminPermissions
);

// Force logout admin
router.post('/force-logout/:adminId', 
  adminManagementController.forceLogoutAdmin
);

// Delete/suspend admin
router.delete('/:adminId', 
  requirePermission('adminManagement', 'deleteAdmins'),
  adminManagementController.deleteAdmin
);

// Get admin activity (30 days + live)
router.get('/activity/:adminId', 
  adminManagementController.getAdminActivity
);

export default router;