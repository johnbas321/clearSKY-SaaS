import dotenv from 'dotenv';

dotenv.config();

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3309', 10),
  user: process.env.DB_USER || 'clearsky',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'stats',
  connectionLimit: parseInt(process.env.DB_CONN_LIMIT || '10', 10),
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT || '0', 10),
  charset: process.env.DB_CHARSET || 'utf8mb4',
   timezone: process.env.DB_TIMEZONE || 'Z',
};
  
export const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
};
  
export const appConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
};

export const cacheConfig = {
  stdTTL: 180,
}
