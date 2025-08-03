import dotenv from 'dotenv';

dotenv.config();

const config = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  THEMES_PATH: process.env.THEMES_PATH || './themes',
  UPLOADS_PATH: process.env.UPLOADS_PATH || './uploads',
};

export default config;
