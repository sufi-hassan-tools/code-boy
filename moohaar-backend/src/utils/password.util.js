import crypto from 'crypto';

export const hashPassword = async (password) => {
  try {
    const bcrypt = (await import('bcrypt')).default;
    return await bcrypt.hash(password, 10);
  } catch (err) {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(16).toString('hex');
      crypto.scrypt(password, salt, 64, (scryptErr, derivedKey) => {
        if (scryptErr) {
          reject(scryptErr);
          return;
        }
        resolve(`${salt}:${derivedKey.toString('hex')}`);
      });
    });
  }
};

export const comparePassword = async (password, hash) => {
  try {
    const bcrypt = (await import('bcrypt')).default;
    return await bcrypt.compare(password, hash);
  } catch (err) {
    return new Promise((resolve, reject) => {
      const [salt, key] = hash.split(':');
      if (!salt || !key) {
        resolve(false);
        return;
      }
      crypto.scrypt(password, salt, 64, (scryptErr, derivedKey) => {
        if (scryptErr) {
          reject(scryptErr);
          return;
        }
        resolve(key === derivedKey.toString('hex'));
      });
    });
  }
};

export default { hashPassword, comparePassword };
