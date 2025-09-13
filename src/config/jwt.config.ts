import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret:
    process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',

  refresh: {
    secret:
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '-refresh',
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  resetPassword: {
    secret: process.env.JWT_RESET_SECRET || process.env.JWT_SECRET + '-reset',
    expiresIn: process.env.JWT_RESET_EXPIRES_IN || '1h',
  },

  emailVerification: {
    secret: process.env.JWT_EMAIL_SECRET || process.env.JWT_SECRET + '-email',
    expiresIn: process.env.JWT_EMAIL_EXPIRES_IN || '24h',
  },

  issuer: process.env.JWT_ISSUER || 'gym-management',
  audience: process.env.JWT_AUDIENCE || 'gym-users',
}));
