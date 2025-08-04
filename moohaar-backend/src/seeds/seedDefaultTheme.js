/* eslint-disable import/extensions */
import fs from 'fs/promises';
import path from 'path';
import unzipper from 'unzipper';
import Theme from '../models/theme.model.js';

/**
 * Seeds the default Moohaar theme if it does not exist.
 * - Checks for existing theme by handle.
 * - Unzips packaged theme into the themes directory.
 * - Loads config.json and upserts a Theme document.
 */
export async function seedDefaultTheme() {
  const handle = 'moohaar-style';

  try {
    // Ensure theme does not already exist
    const existing = await Theme.findOne({ handle });
    if (existing) return;

    // Paths for the zip file and extraction destination
    const zipPath = path.resolve('./themes-seed', `${handle}.zip`);
    const destDir = path.join(process.env.THEMES_PATH, handle);

    // Extract the default theme archive
    await unzipper.Open.file(zipPath).then((d) => d.extract({ path: destDir }));

    // Read and parse the theme configuration
    const configPath = path.join(destDir, 'config.json');
    const configRaw = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(configRaw);

    // Upsert the theme document using configuration fields
    await Theme.findOneAndUpdate(
      { handle },
      { ...config, handle },
      { upsert: true, new: true },
    );
  } catch (err) {
    // Re-throw with contextual message
    throw new Error(`Failed to seed default theme: ${err.message}`);
  }
}

export default seedDefaultTheme;
