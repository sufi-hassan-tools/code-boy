import { existsSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const secretPath = path.resolve(__dirname, '../../admin-secret.txt');
let cached;

export const getAdminSecret = () => {
  if (!cached) {
    if (existsSync(secretPath)) {
      cached = readFileSync(secretPath, 'utf8').trim();
    } else {
      cached = crypto.randomBytes(24).toString('hex');
      writeFileSync(secretPath, cached);
    }
  }
  return cached;
};

export default getAdminSecret;
