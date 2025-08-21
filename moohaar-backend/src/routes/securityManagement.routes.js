import express from 'express';
import securityManagementController from '../controllers/securityManagement.controller.js';
import { 
  authenticateAdmin, 
  requirePermission,
  requireOwnerAdmin,
  checkSessionTimeout 
} from '../middleware/superAdminAuth.js';

const router = express.Router();

// Apply authentication and session timeout check to all routes
router.use(authenticateAdmin);
router.use(checkSessionTimeout);

// Get all blocked IPs
router.get('/blocked-ips', 
  requirePermission('system', 'manageBlacklist'),
  securityManagementController.getBlockedIPs
);

// Block an IP address
router.post('/block-ip', 
  requirePermission('system', 'manageBlacklist'),
  securityManagementController.blockIP
);

// Unblock an IP address (owner admin only)
router.post('/unblock-ip/:ipId', 
  requireOwnerAdmin,
  securityManagementController.unblockIP
);

// Get audit logs
router.get('/audit-logs', 
  requirePermission('system', 'viewAuditLogs'),
  securityManagementController.getAuditLogs
);

// Get system statistics
router.get('/stats', 
  requirePermission('system', 'viewSettings'),
  securityManagementController.getSystemStats
);

// Get real-time activity
router.get('/real-time-activity', 
  requirePermission('adminManagement', 'viewAdmins'),
  securityManagementController.getRealTimeActivity
);

export default router;