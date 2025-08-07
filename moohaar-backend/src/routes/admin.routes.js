import { Router } from 'express';
import {
  getDashboard,
  listUsers,
  updateUser,
  listThemes,
  approveTheme,
  updateTheme,
  disableTheme,
  getSettings,
  updateSettings,
} from '../controllers/admin.controller';

const router = Router();

router.get('/dashboard', getDashboard);

// User management
router.get('/users', listUsers);
router.patch('/users/:userId', updateUser);

// Theme marketplace management
router.get('/themes', listThemes);
router.post('/themes/:themeId/approve', approveTheme);
router.put('/themes/:themeId', updateTheme);
router.patch('/themes/:themeId/disable', disableTheme);

// Global settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
