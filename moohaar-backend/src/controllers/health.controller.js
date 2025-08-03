import mongoose from 'mongoose';
import Theme from '../models/theme.model.js';

export const healthCheck = async (req, res) => {
  const mongo = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const themesLoaded = await Theme.countDocuments();
  return res.json({
    uptime: process.uptime(),
    mongo,
    themesLoaded,
  });
};
