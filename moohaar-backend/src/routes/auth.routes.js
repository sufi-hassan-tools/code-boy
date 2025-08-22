import { Router } from 'express';
import { register, login, logout, refresh, me } from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', me);

export { register };
export default router;
