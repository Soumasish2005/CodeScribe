// packages/worker/src/redis/index.ts
// Re-using the same connection logic as the API package
import { createClient } from 'redis';
import config from '../config';
import { logger } from '../utils/logger';

export const redisClient = createClient({
  url: config.redis.uri,
});

redisClient.on('connect', () => logger.info('✅ Worker Redis client connected'));
redisClient.on('error', (err) => logger.error('❌ Worker Redis client error:', err));
