import fs from 'fs';
import path from 'path';
import Theme from '../models/theme.model.js';
import config from '../config/index.js';
import unzipTheme from '../utils/unzip.util.js';
import engine from '../services/liquid.service.js';

// POST /api/themes/upload
export const uploadTheme = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const theme = new Theme();
    const themeDir = path.join(config.THEMES_PATH, theme._id.toString());
    await unzipTheme(req.file.path, themeDir);

    const configPath = path.join(themeDir, 'config.json');
    if (!fs.existsSync(configPath)) {
      return res.status(400).json({ message: 'config.json missing in theme' });
    }
    const meta = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    theme.name = meta.name || theme._id.toString();
    theme.author = meta.author;
    theme.paths = { root: themeDir };
    theme.metadata = meta;
    await theme.save();
    return res.status(201).json(theme);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/themes
export const listThemes = async (req, res) => {
  try {
    const themes = await Theme.find();
    return res.json(themes);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/themes/:id/preview
export const previewTheme = async (req, res) => {
  try {
    const { id } = req.params;
    const theme = await Theme.findById(id);
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    const html = await engine.renderFile(`${theme._id}/templates/index`, { title: 'Preview' });
    return res.send(html);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
