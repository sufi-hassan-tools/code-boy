import { Router } from 'express';
import {
  registerSuperAdmin,
  createAdmin,
  acceptInvitation,
  loginViaUniqueUrl,
  getCurrentAdmin,
  updateAdminPermissions,
  listAdmins,
  logout,
  deleteAdmin,
  superAdminRegistrationLimiter,
} from '../controllers/superAdminAuth.controller.js';
import {
  getPlatformOverview,
  getAdminAnalytics,
  getSystemStatus,
} from '../controllers/superAdminDashboard.controller.js';
import adminAuth, { requireRole, requirePermission } from '../middleware/adminAuth.js';

const router = Router();

// Super Admin Registration (with rate limiting)
router.post('/sufimoohaaradmin', superAdminRegistrationLimiter, registerSuperAdmin);

// Admin invitation acceptance
router.post('/invitation/:token', acceptInvitation);

// Admin login via unique URL
router.post('/login/:uniqueUrl', loginViaUniqueUrl);

// Protected routes (require authentication)
router.use(adminAuth);

// Get current admin info
router.get('/me', getCurrentAdmin);

// Admin logout
router.post('/logout', logout);

// Super admin only routes
router.post('/create-admin', requireRole('superadmin'), createAdmin);
router.get('/admins', requireRole('superadmin'), listAdmins);
router.put('/admins/:adminId/permissions', requireRole('superadmin'), updateAdminPermissions);
router.delete('/admins/:adminId', requireRole('superadmin'), deleteAdmin);

// Dashboard and analytics routes
router.get('/dashboard/overview', requireRole('superadmin'), getPlatformOverview);
router.get('/dashboard/analytics', requireRole('superadmin'), getAdminAnalytics);
router.get('/dashboard/system-status', requireRole('superadmin'), getSystemStatus);

export default router;