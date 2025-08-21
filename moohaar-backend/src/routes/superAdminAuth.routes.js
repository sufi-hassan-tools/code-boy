import express from 'express';
import superAdminAuthController from '../controllers/superAdminAuth.controller.js';
import { rateLimitLogin } from '../middleware/superAdminAuth.js';

const router = express.Router();

// Owner admin registration route (sufimoohaaradmin)
router.post('/owner-admin/register', rateLimitLogin, superAdminAuthController.registerOwnerAdmin);

// Super admin registration route (requires approval)
router.post('/super-admin/register', rateLimitLogin, superAdminAuthController.registerSuperAdmin);

// Admin login (with 2FA)
router.post('/login', rateLimitLogin, superAdminAuthController.login);

// Get current admin info
router.get('/me', superAdminAuthController.getCurrentAdmin);

// Admin logout
router.post('/logout', superAdminAuthController.logout);

export default router;