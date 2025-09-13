import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-management',

  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    w: 'majority',
  },

  connectionPool: {
    minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE, 10) || 5,
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE, 10) || 10,
    serverSelectionTimeoutMS:
      parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT, 10) || 5000,
    socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT, 10) || 45000,
    family: 4,
  },

  debug: process.env.DB_DEBUG === 'true',

  backup: {
    enabled: process.env.DB_BACKUP_ENABLED === 'true',
    schedule: process.env.DB_BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
    path: process.env.DB_BACKUP_PATH || './backups',
  },
}));
