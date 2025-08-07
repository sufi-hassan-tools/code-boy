import express from 'express';
import { auth, authorizeAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// A sample admin route
router.get('/', auth, authorizeAdmin, (req, res) => {
  res.json({ message: 'Welcome to the admin area!' });
});

export default router;
