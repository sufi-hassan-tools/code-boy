import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import config from '../config/index.js';
import {
  createTheme,
  listThemes,
  previewTheme,
  updateTheme,
  deleteTheme,
} from '../controllers/theme.controller.js';
import { auth, authorizeAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Multer configuration: single ZIP up to 5MB
const upload = multer({
  dest: config.UPLOADS_PATH,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.zip') {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'));
    }
  },
});

// Admin create theme
router.post('/', auth, authorizeAdmin, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    return createTheme(req, res);
  });
});

// Admin update theme
router.put('/:id', auth, authorizeAdmin, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    return updateTheme(req, res);
  });
});

// Admin delete theme
router.delete('/:id', auth, authorizeAdmin, deleteTheme);

// Protected routes require valid JWT
router.get('/', auth, listThemes);
router.get('/:id/preview', auth, previewTheme);

export default router;
