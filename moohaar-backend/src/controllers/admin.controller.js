import User from '../models/user.model.js';
import Theme from '../models/theme.model.js';
import Setting from '../models/setting.model.js';

export const getDashboard = async (_req, res, next) => {
  try {
    const [users, themes] = await Promise.all([
      User.countDocuments(),
      Theme.countDocuments(),
    ]);
    return res.json({ users, themes });
  } catch (err) {
    return next(err);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    let { offset = 0, limit = 10 } = req.query;
    offset = parseInt(offset, 10);
    limit = parseInt(limit, 10);

    const [users, total] = await Promise.all([
      User.find().skip(offset).limit(limit),
      User.countDocuments(),
    ]);

    return res.json({ users, total, offset, limit });
  } catch (err) {
    return next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  } catch (err) {
    return next(err);
  }
};

export const listThemes = async (_req, res, next) => {
  try {
    const themes = await Theme.find();
    return res.json({ themes });
  } catch (err) {
    return next(err);
  }
};

export const approveTheme = async (req, res, next) => {
  try {
    const { themeId } = req.params;
    const theme = await Theme.findByIdAndUpdate(
      themeId,
      { $set: { 'metadata.status': 'approved' } },
      { new: true }
    );
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    return res.json(theme);
  } catch (err) {
    return next(err);
  }
};

export const updateTheme = async (req, res, next) => {
  try {
    const { themeId } = req.params;
    const updates = req.body;
    const theme = await Theme.findByIdAndUpdate(themeId, updates, { new: true });
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    return res.json(theme);
  } catch (err) {
    return next(err);
  }
};

export const disableTheme = async (req, res, next) => {
  try {
    const { themeId } = req.params;
    const theme = await Theme.findByIdAndUpdate(
      themeId,
      { $set: { 'metadata.status': 'disabled' } },
      { new: true }
    );
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    return res.json(theme);
  } catch (err) {
    return next(err);
  }
};

export const getSettings = async (_req, res, next) => {
  try {
    const settings = await Setting.findOne();
    return res.json({ settings: settings || {} });
  } catch (err) {
    return next(err);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const settings = await Setting.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
    });
    return res.json({ settings });
  } catch (err) {
    return next(err);
  }
};

export default {
  getDashboard,
  listUsers,
  updateUser,
  listThemes,
  approveTheme,
  updateTheme,
  disableTheme,
  getSettings,
  updateSettings,
};
