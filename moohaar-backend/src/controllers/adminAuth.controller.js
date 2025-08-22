import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Admin from '../models/admin.model.js';
import config from '../config/index.js';
import { getAdminSecret } from '../utils/adminSecret.util.js';

export const register = async (req, res) => {
  const { secret } = req.params;
  const expected = getAdminSecret();
  if (secret !== expected) {
    return res.status(404).json({ message: 'Not found' });
  }
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'email already exists' });
    }
    const superCount = await Admin.countDocuments({ role: 'superadmin' });
    if (superCount >= 3) {
      return res.status(403).json({ message: 'Super admin limit reached' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name, email, passwordHash, role: 'superadmin' });
    return res.status(201).json({ id: admin.id, name: admin.name, email: admin.email, role: admin.role });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { adminId: admin.id, role: admin.role },
      config.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.cookie('adminToken', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    return res.json({ id: admin.id, email: admin.email, role: admin.role });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const me = (req, res) => {
  if (!req.admin) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  return res.json({ id: req.admin.id, role: req.admin.role });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const admin = await Admin.findOne({ email });
  if (admin) {
    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    admin.resetTokenHash = hash;
    admin.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await admin.save();
    return res.json({ message: 'Reset token generated', token });
  }
  return res.json({ message: 'Reset token generated' });
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ message: 'password is required' });
  }
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const admin = await Admin.findOne({
    resetTokenHash: hash,
    resetTokenExpiry: { $gt: new Date() },
  });
  if (!admin) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
  admin.passwordHash = await bcrypt.hash(password, 10);
  admin.resetTokenHash = undefined;
  admin.resetTokenExpiry = undefined;
  await admin.save();
  return res.json({ message: 'Password reset successful' });
};

export default { register, login, me, forgotPassword, resetPassword };
