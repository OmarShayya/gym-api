import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
  apiUrl: process.env.API_URL || 'http://localhost:3000',

  appName: process.env.APP_NAME || 'Gym Management System',
  appVersion: process.env.APP_VERSION || '1.0.0',

  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
    limit: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880, // 5MB
    uploadDir: process.env.UPLOAD_DIR || './uploads',
  },

  pagination: {
    defaultLimit: parseInt(process.env.DEFAULT_PAGE_LIMIT, 10) || 20,
    maxLimit: parseInt(process.env.MAX_PAGE_LIMIT, 10) || 100,
  },

  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,

  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'noreply@gym.com',
  },
}));
