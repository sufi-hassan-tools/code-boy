import { Router } from 'express';
import { register, login, logout, refresh } from '../controllers/auth.controller';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);

export { register };
export default router;
