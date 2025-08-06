import { Router } from 'express';
import setActiveTheme from '../controllers/store.controller';
import { auth, authorizeStoreOwner } from '../middleware/auth.middleware';

const router = Router();

// Assign active theme to store
router.post('/:storeId/theme', auth, authorizeStoreOwner, setActiveTheme);

export default router;
