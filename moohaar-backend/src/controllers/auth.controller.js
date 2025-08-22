import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import config from '../config/index.js';
import { hashPassword, comparePassword } from '../utils/password.util.js';

// POST /api/auth/register
export const register = async (req, res) => {
  console.log('Register payload:', req.body);
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'email already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'merchant';
    const user = await User.create({ email, passwordHash, role });
    return res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(400).json({ error: err.message });
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.JWT_SECRET,
      { expiresIn: '1d' },
    );
    const refreshToken = jwt.sign(
      { userId: user.id, jti: crypto.randomUUID() },
      config.JWT_SECRET,
      { expiresIn: '7d' },
    );
    user.refreshTokenHash = await hashPassword(refreshToken);
    await user.save();
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    return res.status(200).json({ user: { id: user.id, role: user.role } });
  } catch (err) {
    return next(err);
  }
};

// GET /api/auth/me
export const me = async (req, res) => {
  const { token } = req.cookies || {};
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    return res.status(200).json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// POST /api/auth/refresh
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies || {};
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }
    let payload;
    try {
      payload = jwt.verify(refreshToken, config.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    const user = await User.findById(payload.userId);
    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    const match = await comparePassword(refreshToken, user.refreshTokenHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.JWT_SECRET,
      { expiresIn: '1d' },
    );
    const newRefreshToken = jwt.sign(
      { userId: user.id, jti: crypto.randomUUID() },
      config.JWT_SECRET,
      { expiresIn: '7d' },
    );
    user.refreshTokenHash = await hashPassword(newRefreshToken);
    await user.save();
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    return res.json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    return next(err);
  }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
  const clearOptions = {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  };
  const { refreshToken } = req.cookies || {};
  if (refreshToken) {
    try {
      const { userId } = jwt.verify(refreshToken, config.JWT_SECRET);
      const user = await User.findById(userId);
      if (user) {
        user.refreshTokenHash = undefined;
        await user.save();
      }
    } catch (err) {
      // ignore errors
    }
  }
  res.clearCookie('token', clearOptions);
  res.clearCookie('refreshToken', clearOptions);
  return res.status(204).send();
};

export default { register, login, logout, refresh, me };
