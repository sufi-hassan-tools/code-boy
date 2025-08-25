import dotenv from 'dotenv';

dotenv.config();

const config = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  THEMES_PATH: process.env.THEMES_PATH || './themes',
  UPLOADS_PATH: process.env.UPLOADS_PATH || './uploads',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  CACHE_TTL_THEME: parseInt(process.env.CACHE_TTL_THEME || '60', 10),
  CACHE_TTL_CONTEXT: parseInt(process.env.CACHE_TTL_CONTEXT || '30', 10),
  CACHE_TTL_HEALTH: parseInt(process.env.CACHE_TTL_HEALTH || '5', 10),
  APM_SERVICE_NAME: process.env.APM_SERVICE_NAME || 'moohaar-backend',
  APM_SERVER_URL: process.env.APM_SERVER_URL,
  APM_ACTIVE: process.env.APM_ACTIVE !== 'false',
  // Email configuration for OTP and notifications
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@moohaar.com',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://moohaarapp.onrender.com',
};

export default config;
