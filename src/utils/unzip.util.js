import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';

// Allowed file extensions for extraction
const VALID_EXT = /\.(liquid|js|css|png|jpe?g|webp|svg)$/i;

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
  // Resolve the destination path to ensure absolute path comparison
  const absoluteDest = path.resolve(destPath);

  // Stream and parse the zip file
  const directory = fs.createReadStream(zipPath).pipe(unzipper.Parse());

  // Iterate through each entry in the archive
  for await (const entry of directory) {
    const entryPath = path.normalize(path.join(absoluteDest, entry.path));

    // Ensure the normalized path stays within the destination directory
    if (!entryPath.startsWith(absoluteDest)) {
      entry.autodrain();
      throw new Error('Invalid path');
    }

    // Skip files that do not match the allowed extensions
    if (!VALID_EXT.test(entry.path)) {
      entry.autodrain();
      continue;
    }

    // Ensure the parent directory exists before writing the file
    await fs.promises.mkdir(path.dirname(entryPath), { recursive: true });

    // Pipe the entry to the destination file and await completion
    await new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(entryPath);
      entry.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
  }
}

export default sanitizeAndUnzip;
