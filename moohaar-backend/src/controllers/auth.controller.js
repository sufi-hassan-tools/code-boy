import jwt from 'jsonwebtoken';
import Joi from 'joi'; // eslint-disable-line import/no-unresolved
import validate from '../middleware/validate';
import User from '../models/user.model';
import config from '../config/index';
import { hashPassword, comparePassword } from '../utils/password.util';

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// POST /api/auth/register
export const register = [
  validate(registerSchema),
  async (req, res, next) => {
    try {
      const { email, password, role } = req.body;
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ message: 'email already exists' });
      }
      const passwordHash = await hashPassword(password);
      const user = await User.create({ email, passwordHash, role });
      return res
        .status(201)
        .json({ id: user.id, email: user.email, role: user.role });
    } catch (err) {
      return next(err);
    }
  },
];

// POST /api/auth/login
export const login = [
  validate(loginSchema),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
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
      res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
      return res.json({ id: user.id, email: user.email, role: user.role });
    } catch (err) {
      return next(err);
    }
  },
];

// POST /api/auth/logout
export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
  return res.status(204).send();
};

export default { register, login, logout };
