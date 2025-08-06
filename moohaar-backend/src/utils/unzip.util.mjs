import fs from 'fs';
import path from 'path';
import { Open } from 'unzipper';
import logger from './logger';

// Allowed file extensions for extraction
const VALID_EXT = /\.(liquid|js|css|png|jpe?g|webp|svg)$/i;
// Patterns that are not allowed within extracted files
const DISALLOWED_PATTERN = /<script>|eval\(|document\.|window\./i;

export class MaliciousContentError extends Error {}

/**
 * Safely extracts a zip archive into the destination directory.
 *
 * Paths are normalized to prevent directory traversal attacks and only
 * whitelisted file types are written to disk.
 *
 * @param {string} zipPath - Path to the zip file to extract.
 * @param {string} destPath - Directory to extract files into.
 */
export async function sanitizeAndUnzip(zipPath, destPath) {
  const absoluteDest = path.resolve(destPath);

  const directory = await Open.file(zipPath);
  for (const file of directory.files) {
    const entryPath = path.normalize(path.join(absoluteDest, file.path));

    if (!entryPath.startsWith(absoluteDest)) {
      throw new Error('Invalid path');
    }

    if (file.type === 'Directory' || !VALID_EXT.test(file.path)) {
      continue;
    }

    const fileBuffer = await file.buffer();
    const fileContent = fileBuffer.toString('utf8');
    if (DISALLOWED_PATTERN.test(fileContent)) {
      logger.warn(`Malicious content detected in ${entryPath}`);
      await fs.promises.rm(absoluteDest, { recursive: true, force: true });
      throw new MaliciousContentError(
        `Malicious content detected in file ${file.path}`,
      );
    }

    await fs.promises.mkdir(path.dirname(entryPath), { recursive: true });
    await fs.promises.writeFile(entryPath, fileBuffer);
  }
}

export default sanitizeAndUnzip;
