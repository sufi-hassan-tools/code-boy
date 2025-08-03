import { Router } from 'express';
import multer from 'multer';
import config from '../config/index.js';
import { listThemes, previewTheme, uploadTheme } from '../controllers/theme.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router = Router();
const upload = multer({ dest: config.UPLOADS_PATH });

// Optional upload route (not protected in requirements)
router.post('/upload', upload.single('file'), uploadTheme);

// Protected routes require valid JWT
router.get('/', auth, listThemes);
router.get('/:id/preview', auth, previewTheme);

export default router;
