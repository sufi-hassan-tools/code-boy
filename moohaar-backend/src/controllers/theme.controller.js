import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import unzipper from 'unzipper';
import Theme from '../models/theme.model.js';
import config from '../config/index.js';
import engine from '../services/liquid.service.js';

// POST /api/themes
// Handles theme ZIP upload and persists metadata
export const createTheme = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Prepare paths using a generated theme ID
    const theme = new Theme();
    const themeDir = path.join(config.THEMES_PATH, theme.id);
    await fsp.mkdir(themeDir, { recursive: true });

    // Unzip uploaded file into the theme directory
    await fs
      .createReadStream(req.file.path)
      .pipe(unzipper.Extract({ path: themeDir }))
      .promise();

    // Validate required directories
    const requiredDirs = ['layout', 'templates', 'assets'];
    try {
      requiredDirs.forEach((dir) => {
        const dirPath = path.join(themeDir, dir);
        if (!fs.existsSync(dirPath)) {
          throw new Error(`${dir} folder missing in theme`);
        }
      });
    } catch (validationErr) {
      return res.status(400).json({ message: validationErr.message });
    }

    // Validate config.json
    const configPath = path.join(themeDir, 'config.json');
    if (!fs.existsSync(configPath)) {
      return res.status(400).json({ message: 'config.json missing in theme' });
    }

    const meta = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    try {
      const requiredFields = ['name', 'handle', 'version', 'description', 'previewImage'];
      requiredFields.forEach((field) => {
        if (typeof meta[field] !== 'string' || !meta[field]) {
          throw new Error(`Invalid config.json: missing ${field}`);
        }
      });
    } catch (validationErr) {
      return res.status(400).json({ message: validationErr.message });
    }

    // Persist theme metadata
    theme.name = meta.name;
    theme.version = meta.version;
    theme.description = meta.description;
    theme.previewImage = meta.previewImage;
    theme.paths = { root: themeDir };
    theme.metadata = meta;
    await theme.save();

    // Clean up uploaded zip
    await fsp.unlink(req.file.path);

    return res.status(201).json(theme);
  } catch (err) {
    return next(err);
  }
};

// GET /api/themes
// Returns paginated list of themes
export const listThemes = async (req, res, next) => {
  try {
    // Pagination: offset and limit with defaults 0 and 2
    let { offset = 0, limit = 2 } = req.query;
    offset = parseInt(offset, 10);
    limit = parseInt(limit, 10);

    if (Number.isNaN(offset) || Number.isNaN(limit)) {
      return res.status(400).json({ message: 'offset and limit must be integers' });
    }

    const [themes, total] = await Promise.all([
      Theme.find().skip(offset).limit(limit),
      Theme.countDocuments(),
    ]);

    return res.json({ themes, total, offset, limit });
  } catch (err) {
    return next(err);
  }
};

// GET /api/themes/:id/preview
// Renders a preview of the theme's index template
export const previewTheme = async (req, res, next) => {
  try {
    const { id } = req.params;
    const theme = await Theme.findById(id);
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    const templatePath = path.join(theme.paths.root, 'templates', 'index.liquid');
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const template = fs.readFileSync(templatePath, 'utf-8');
    const context = {
      store: { name: 'Preview Store', logo: '/logo.png' },
      products: [{ name: 'Demo', price: 0, image: '/demo.jpg' }],
    };
    const html = await engine.parseAndRender(template, context);
    return res.send(html);
  } catch (err) {
    return next(err);
  }
};

// PUT /api/themes/:id
// Replaces theme files and updates metadata
export const updateTheme = async (req, res, next) => {
  try {
    const { id } = req.params;

    const theme = await Theme.findById(id);
    if (!theme) {
      if (req.file) {
        await fsp.unlink(req.file.path);
      }
      return res.status(404).json({ message: 'Theme not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const themeDir = path.join(config.THEMES_PATH, id);

    // Remove existing directory and recreate
    await fsp.rm(themeDir, { recursive: true, force: true });
    await fsp.mkdir(themeDir, { recursive: true });

    // Unzip uploaded file into the theme directory
    await fs
      .createReadStream(req.file.path)
      .pipe(unzipper.Extract({ path: themeDir }))
      .promise();

    // Validate required directories
    const requiredDirs = ['layout', 'templates', 'assets'];
    try {
      requiredDirs.forEach((dir) => {
        const dirPath = path.join(themeDir, dir);
        if (!fs.existsSync(dirPath)) {
          throw new Error(`${dir} folder missing in theme`);
        }
      });
    } catch (validationErr) {
      return res.status(400).json({ message: validationErr.message });
    }

    // Validate config.json
    const configPath = path.join(themeDir, 'config.json');
    if (!fs.existsSync(configPath)) {
      return res.status(400).json({ message: 'config.json missing in theme' });
    }

    const meta = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    try {
      const requiredFields = ['name', 'handle', 'version', 'description', 'previewImage'];
      requiredFields.forEach((field) => {
        if (typeof meta[field] !== 'string' || !meta[field]) {
          throw new Error(`Invalid config.json: missing ${field}`);
        }
      });
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

    // Clean up uploaded zip
    await fsp.unlink(req.file.path);

    return res.status(200).json(theme);
  } catch (err) {
    return next(err);
  }
};

// DELETE /api/themes/:id
export const deleteTheme = async (req, res, next) => {
  try {
    const { id } = req.params;
    const theme = await Theme.findById(id);
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    const themeDir = path.join(config.THEMES_PATH, id);
    await fsp.rm(themeDir, { recursive: true, force: true });
    await theme.deleteOne();

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};
