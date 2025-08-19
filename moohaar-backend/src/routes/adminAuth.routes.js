import { Router } from 'express';
import {
  register,
  login,
  me,
  forgotPassword,
  resetPassword,
} from '../controllers/adminAuth.controller.js';
import adminAuth from '../middleware/adminAuth.js';
import { getAdminSecret } from '../utils/adminSecret.util.js';

const router = Router();
const secret = getAdminSecret();

router.post(`/register/${secret}`, register);
router.post('/login', login);
router.get('/me', adminAuth, me);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
