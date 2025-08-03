import { Router } from 'express';
import { setActiveTheme } from '../controllers/store.controller.js';
import { auth, authorizeStoreOwner } from '../middleware/auth.middleware.js';

const router = Router();

// Assign active theme to store
router.post('/:storeId/theme', auth, authorizeStoreOwner, setActiveTheme);

export default router;
