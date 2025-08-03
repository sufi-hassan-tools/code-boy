import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import unzipper from 'unzipper';

const REQUIRED_DIRS = ['templates'];

const unzipTheme = async (zipPath, destPath) => {
  await fs
    .createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: destPath }))
    .promise();

  await Promise.all(
    REQUIRED_DIRS.map(async (dir) => {
      const dirPath = path.join(destPath, dir);
      await fsp.access(dirPath);
    })
  );
};

export default unzipTheme;
