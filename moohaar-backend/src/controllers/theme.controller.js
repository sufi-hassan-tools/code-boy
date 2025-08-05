import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

import Theme from '../models/theme.model.js';
import engine from '../services/liquid.service.js';
import { auth, authorizeAdmin } from '../middleware/auth.middleware.js';

// sanitizeAndUnzip utility lives outside this package in the root src directory
import sanitizeAndUnzip from '../../src/utils/unzip.util.js';

// Multer configuration: store uploads in configured path with size and type checks
const upload = multer({
  dest: process.env.UPLOADS_PATH,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === '.zip') cb(null, true);
    else cb(new Error('Only ZIP files allowed'));
  },
});

const router = Router();

// POST /api/themes
// Handles theme ZIP upload, sanitizes contents, and persists metadata
router.post(
  '/',
  auth,
  authorizeAdmin,
  upload.single('themeFile'),
  async (req, res, next) => {
    try {
      // Generate a theme ID and prepare destination path
      const themeId = new Theme().id;
      const destPath = path.join(process.env.THEMES_PATH, themeId);

      // Extract uploaded zip safely then remove the temporary archive
      await sanitizeAndUnzip(req.file.path, destPath);
      await fs.unlink(req.file.path);

      // Validate required theme sub-directories
      const requiredDirs = ['layout', 'templates', 'assets'];
      try {
        await Promise.all(
          requiredDirs.map((dir) => fs.access(path.join(destPath, dir)))
        );
      } catch (err) {
        return res.status(400).json({ message: `${err.message}` });
      }

      // Validate presence of config.json and its required fields
      const configPath = path.join(destPath, 'config.json');
      try {
        await fs.access(configPath);
      } catch {
        return res
          .status(400)
          .json({ message: 'config.json missing in theme' });
      }

      const meta = JSON.parse(await fs.readFile(configPath, 'utf-8'));
      try {
        const requiredFields = [
          'name',
          'handle',
          'version',
          'description',
          'previewImage',
        ];
        for (const field of requiredFields) {
          if (typeof meta[field] !== 'string' || !meta[field]) {
            throw new Error(`Invalid config.json: missing ${field}`);
          }
        }
      } catch (validationErr) {
        return res.status(400).json({ message: validationErr.message });
      }

      // Persist theme metadata
      const theme = new Theme({
        _id: themeId,
        name: meta.name,
        version: meta.version,
        description: meta.description,
        previewImage: meta.previewImage,
        paths: { root: destPath },
        metadata: meta,
      });

      await theme.save();

      return res.status(201).json(theme);
    } catch (err) {
      return next(err);
    }
  }
);

// GET /api/themes
// Returns paginated list of themes
router.get('/', auth, async (req, res, next) => {
  try {
    let { offset = 0, limit = 2 } = req.query;
    offset = parseInt(offset, 10);
    limit = parseInt(limit, 10);

    if (Number.isNaN(offset) || Number.isNaN(limit)) {
      return res
        .status(400)
        .json({ message: 'offset and limit must be integers' });
    }

    const [themes, total] = await Promise.all([
      Theme.find().skip(offset).limit(limit),
      Theme.countDocuments(),
    ]);

    return res.json({ themes, total, offset, limit });
  } catch (err) {
    return next(err);
  }
});

// GET /api/themes/:id/preview
// Renders a preview of the theme's index template
router.get('/:id/preview', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const theme = await Theme.findById(id);
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    const templatePath = path.join(
      theme.paths.root,
      'templates',
      'index.liquid'
    );
    try {
      await fs.access(templatePath);
    } catch {
      return res.status(404).json({ message: 'Template not found' });
    }

    const template = await fs.readFile(templatePath, 'utf-8');
    const context = {
      store: { name: 'Preview Store', logo: '/logo.png' },
      products: [{ name: 'Demo', price: 0, image: '/demo.jpg' }],
    };
    const html = await engine.parseAndRender(template, context);
    return res.send(html);
  } catch (err) {
    return next(err);
  }
});

// PUT /api/themes/:id
// Replaces theme files and updates metadata
router.put(
  '/:id',
  auth,
  authorizeAdmin,
  upload.single('themeFile'),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const theme = await Theme.findById(id);
      if (!theme) {
        if (req.file) {
          await fs.unlink(req.file.path);
        }
        return res.status(404).json({ message: 'Theme not found' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const themeDir = path.join(process.env.THEMES_PATH, id);

      // Remove existing directory and extract new one
      await fs.rm(themeDir, { recursive: true, force: true });
      await sanitizeAndUnzip(req.file.path, themeDir);
      await fs.unlink(req.file.path);

      // Validate required directories
      const requiredDirs = ['layout', 'templates', 'assets'];
      try {
        await Promise.all(
          requiredDirs.map((dir) => fs.access(path.join(themeDir, dir)))
        );
      } catch (validationErr) {
        return res.status(400).json({ message: validationErr.message });
      }

      // Validate config.json
      const configPath = path.join(themeDir, 'config.json');
      try {
        await fs.access(configPath);
      } catch {
        return res
          .status(400)
          .json({ message: 'config.json missing in theme' });
      }

      const meta = JSON.parse(await fs.readFile(configPath, 'utf-8'));
      try {
        const requiredFields = [
          'name',
          'handle',
          'version',
          'description',
          'previewImage',
        ];
        for (const field of requiredFields) {
          if (typeof meta[field] !== 'string' || !meta[field]) {
            throw new Error(`Invalid config.json: missing ${field}`);
          }
        }
      } catch (validationErr) {
        return res.status(400).json({ message: validationErr.message });
      }

      // Update theme metadata
      theme.version = meta.version;
      theme.description = meta.description;
      theme.previewImage = meta.previewImage;
      theme.paths = { root: themeDir };
      theme.metadata = meta;
      await theme.save();

      return res.status(200).json(theme);
    } catch (err) {
      return next(err);
    }
  }
);

// DELETE /api/themes/:id
router.delete('/:id', auth, authorizeAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const theme = await Theme.findById(id);
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    const themeDir = path.join(process.env.THEMES_PATH, id);
    await fs.rm(themeDir, { recursive: true, force: true });
    await theme.deleteOne();

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

export default router;

