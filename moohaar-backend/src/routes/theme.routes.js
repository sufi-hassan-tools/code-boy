import { Router } from 'express';
import multer from 'multer';
import config from '../config/index.js';
import { uploadTheme, listThemes, previewTheme } from '../controllers/theme.controller.js';

const router = Router();
const upload = multer({ dest: config.UPLOADS_PATH });

router.post('/upload', upload.single('file'), uploadTheme);
router.get('/', listThemes);
router.get('/:id/preview', previewTheme);

export default router;
