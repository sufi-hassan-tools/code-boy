import { Router } from 'express';
import setActiveTheme from '../controllers/store.controller.js';
import { createOrder } from '../controllers/order.controller.js';
import auth from '../middleware/auth.js';
import authorizeStoreOwner from '../middleware/authorizeStoreOwner.js';

const router = Router();

// Assign active theme to store
router.post('/:storeId/theme', auth, authorizeStoreOwner, setActiveTheme);

// Create order after checkout
router.post('/:storeId/orders', createOrder);

export default router;
