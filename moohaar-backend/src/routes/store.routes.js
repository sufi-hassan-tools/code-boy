import { Router } from 'express';
import setActiveTheme from '../controllers/store.controller';
import { createOrder } from '../controllers/order.controller';
import { auth, authorizeStoreOwner } from '../middleware/auth.middleware';

const router = Router();

// Assign active theme to store
router.post('/:storeId/theme', auth, authorizeStoreOwner, setActiveTheme);

// Create order after checkout
router.post('/:storeId/orders', createOrder);

export default router;
