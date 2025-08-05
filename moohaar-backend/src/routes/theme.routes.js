import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import Joi from 'joi';
import config from '../config/index.js';
import {
  createTheme,
  listThemes,
  previewTheme,
  updateTheme,
  deleteTheme,
} from '../controllers/theme.controller.js';
import { auth, authorizeAdmin } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.js';

const router = Router();

// Joi schema for theme metadata validation
const themeSchema = Joi.object({
  handle: Joi.string().required(),
  version: Joi.string().required(),
  description: Joi.string().required(),
  previewImage: Joi.string().required(),
});

// Multer configuration: single ZIP up to 5MB
const upload = multer({
  dest: config.UPLOADS_PATH,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.zip') {
      cb(null, true);
    } else {
      const error = new Error('Only ZIP files are allowed');
      error.name = 'ValidationError';
      cb(error);
    }
  },
});

// Admin create theme
router.post('/', auth, authorizeAdmin, validate(themeSchema), (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return next(err);
    }
    return createTheme(req, res, next);
  });
});

// Admin update theme
router.put('/:id', auth, authorizeAdmin, validate(themeSchema), (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return next(err);
    }
    return updateTheme(req, res, next);
  });
});

// Admin delete theme
router.delete('/:id', auth, authorizeAdmin, deleteTheme);

// Protected routes require valid JWT
router.get('/', auth, listThemes);
router.get('/:id/preview', auth, previewTheme);

export default router;
