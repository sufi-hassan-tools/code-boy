/* eslint-disable import/named */
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

import Theme from '../models/theme.model';
import engine from '../services/liquid.service';
import auth from '../middleware/auth';
import authorizeAdmin from '../middleware/authorizeAdmin';
import logger from '../utils/logger';
import config from '../config/index';
import { getCache, setCache } from '../services/cache.service';

// Utility for safe extraction and scanning of theme archives
// eslint-disable-next-line import/named
import {
  MaliciousContentError,
  unzipFile,
} from '../utils/unzip.util';

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

      // Extract uploaded ZIP safely then remove the temporary archive
      try {
        await unzipFile(req.file.path, destPath);
      } catch (err) {
        await fs.unlink(req.file.path);
        if (err instanceof MaliciousContentError) {
          logger.warn(`Theme upload rejected: ${err.message}`);
          return res.status(400).json({ message: err.message });
        }
        throw err;
      }
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

      // Read and parse theme configuration
      let themeConfig;
      try {
        const fileContents = await fs.readFile(
          path.join(destPath, 'config.json'),
          'utf-8'
        );
        themeConfig = JSON.parse(fileContents);

        // Validate required fields
        if (!themeConfig.name || typeof themeConfig.name !== 'string')
          throw new Error('Missing name');
        if (!themeConfig.handle || typeof themeConfig.handle !== 'string')
          throw new Error('Missing handle');
        if (!themeConfig.version || typeof themeConfig.version !== 'string')
          throw new Error('Missing version');
        if (!themeConfig.description || typeof themeConfig.description !== 'string')
          throw new Error('Missing description');
        if (!themeConfig.previewImage || typeof themeConfig.previewImage !== 'string')
          throw new Error('Missing previewImage');
      } catch (err) {
        return res.status(400).json({ message: err.message });
      }

      // Build theme paths for templates and assets
      const paths = {
        root: destPath,
        templates: path.join(destPath, 'templates'),
        assets: path.join(destPath, 'assets'),
      };

      // Persist theme metadata using Mongoose
      const newTheme = await Theme.create({ ...themeConfig, paths });

      return res.status(201).json(newTheme);
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

    const cacheKey = `themes:${offset}:${limit}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const [themes, total] = await Promise.all([
      Theme.find().skip(offset).limit(limit),
      Theme.countDocuments(),
    ]);

    const result = { themes, total, offset, limit };
    await setCache(cacheKey, JSON.stringify(result), config.CACHE_TTL_THEME);
    return res.json(result);
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
      try {
        await unzipFile(req.file.path, themeDir);
      } catch (err) {
        await fs.unlink(req.file.path);
        if (err instanceof MaliciousContentError) {
          logger.warn(`Theme update rejected: ${err.message}`);
          return res.status(400).json({ message: err.message });
        }
        throw err;
      }
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

      // Read and parse theme configuration
      let themeConfig;
      try {
        const fileContents = await fs.readFile(
          path.join(themeDir, 'config.json'),
          'utf-8'
        );
        themeConfig = JSON.parse(fileContents);

        // Validate required fields
        if (!themeConfig.name || typeof themeConfig.name !== 'string')
          throw new Error('Missing name');
        if (!themeConfig.handle || typeof themeConfig.handle !== 'string')
          throw new Error('Missing handle');
        if (!themeConfig.version || typeof themeConfig.version !== 'string')
          throw new Error('Missing version');
        if (!themeConfig.description || typeof themeConfig.description !== 'string')
          throw new Error('Missing description');
        if (!themeConfig.previewImage || typeof themeConfig.previewImage !== 'string')
          throw new Error('Missing previewImage');
      } catch (err) {
        return res.status(400).json({ message: err.message });
      }

      // Build theme paths for templates and assets
      const paths = {
        root: themeDir,
        templates: path.join(themeDir, 'templates'),
        assets: path.join(themeDir, 'assets'),
      };

      // Update theme in database
      const updatedTheme = await Theme.findByIdAndUpdate(
        id,
        { ...themeConfig, paths },
        { new: true }
      );

      return res.status(200).json(updatedTheme);
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

