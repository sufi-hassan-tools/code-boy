import mongoose from 'mongoose';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error({ message: 'MongoDB connection error', error: err });
    throw err;
  }
};

export default connectDB;
