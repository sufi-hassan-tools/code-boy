import express from 'express';
import {
  registerOwnerAdmin,
  registerSuperAdmin,
  login,
  getCurrentAdmin,
  logout,
} from '../controllers/superAdminAuth.controller.js';
import { rateLimitLogin } from '../middleware/superAdminAuth.js';

const router = express.Router();

// Owner admin registration route (sufimoohaaradmin)
router.post('/owner-admin/register', rateLimitLogin, registerOwnerAdmin);

// Super admin registration route (requires approval)
router.post('/super-admin/register', rateLimitLogin, registerSuperAdmin);

// Admin login (with 2FA)
router.post('/login', rateLimitLogin, login);

// Get current admin info
router.get('/me', getCurrentAdmin);

// Admin logout
router.post('/logout', logout);

export default router;