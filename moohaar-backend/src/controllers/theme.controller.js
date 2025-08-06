import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

import Theme from '../models/theme.model';
import engine from '../services/liquid.service';
import { auth, authorizeAdmin } from '../middleware/auth.middleware';
import logger from '../utils/logger';

// Utility for safe extraction and scanning of theme archives
import unzipTheme, {
  MaliciousContentError,
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
        await unzipTheme(req.file.path, destPath);
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
      let config;
      try {
        const fileContents = await fs.readFile(
          path.join(destPath, 'config.json'),
          'utf-8'
        );
        config = JSON.parse(fileContents);

        // Validate required fields
        if (!config.name || typeof config.name !== 'string')
          throw new Error('Missing name');
        if (!config.handle || typeof config.handle !== 'string')
          throw new Error('Missing handle');
        if (!config.version || typeof config.version !== 'string')
          throw new Error('Missing version');
        if (!config.description || typeof config.description !== 'string')
          throw new Error('Missing description');
        if (!config.previewImage || typeof config.previewImage !== 'string')
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
      const newTheme = await Theme.create({ ...config, paths });

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
      try {
        await unzipTheme(req.file.path, themeDir);
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
      let config;
      try {
        const fileContents = await fs.readFile(
          path.join(themeDir, 'config.json'),
          'utf-8'
        );
        config = JSON.parse(fileContents);

        // Validate required fields
        if (!config.name || typeof config.name !== 'string')
          throw new Error('Missing name');
        if (!config.handle || typeof config.handle !== 'string')
          throw new Error('Missing handle');
        if (!config.version || typeof config.version !== 'string')
          throw new Error('Missing version');
        if (!config.description || typeof config.description !== 'string')
          throw new Error('Missing description');
        if (!config.previewImage || typeof config.previewImage !== 'string')
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
        { ...config, paths },
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

