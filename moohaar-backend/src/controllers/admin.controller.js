export const getDashboard = (_req, res) =>
  res.json({ message: 'admin dashboard placeholder' });

export const listUsers = (_req, res) =>
  res.json({ users: [], total: 0 });

export const updateUser = (_req, res) =>
  res.json({ message: 'update user placeholder' });

export const listThemes = (_req, res) =>
  res.json({ themes: [] });

export const approveTheme = (_req, res) =>
  res.json({ message: 'approve theme placeholder' });

export const updateTheme = (_req, res) =>
  res.json({ message: 'update theme placeholder' });

export const disableTheme = (_req, res) =>
  res.json({ message: 'disable theme placeholder' });

export const getSettings = (_req, res) =>
  res.json({ settings: {} });

export const updateSettings = (_req, res) =>
  res.json({ message: 'update settings placeholder' });

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
