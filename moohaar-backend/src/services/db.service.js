import mongoose from 'mongoose';
import config from '../config/index';
import logger from '../utils/logger';

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
