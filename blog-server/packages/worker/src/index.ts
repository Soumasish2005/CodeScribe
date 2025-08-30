// packages/worker/src/index.ts
import { connectToDB } from './database/mongo';
import { redisClient } from './redis';
import { runConsumers } from './consumers';
import { logger } from './utils/logger';

const startWorker = async () => {
  try {
    await connectToDB();
    await redisClient.connect();
    await runConsumers();
    logger.info('🚀 Kafka Worker started and consuming messages.');
  } catch (error) {
    logger.error('Failed to start worker:', error);
    process.exit(1);
  }
};

startWorker();
