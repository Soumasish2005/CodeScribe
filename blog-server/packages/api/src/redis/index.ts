// packages/api/src/redis/index.ts
import { createClient } from 'redis';
import config from '../config';
import { logger } from '../utils/logger';

export const redisClient = createClient({
  url: config.redis.uri,
});

redisClient.on('connect', () => logger.info('✅ Redis client connected'));
redisClient.on('error', (err) => logger.error('❌ Redis client error:', err));
redisClient.on('reconnecting', () => logger.warn('Redis client reconnecting...'));

// Graceful shutdown
process.on('SIGINT', async () => {
  await redisClient.quit();
});
