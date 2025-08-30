// packages/api/src/index.ts
import app from './app';
import config from './config';
import { connectToDB } from './database/mongo';
import { redisClient } from './redis';
import { kafkaProducer } from './kafka/producer';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    await connectToDB();
    await redisClient.connect();
    await kafkaProducer.connect();
    app.listen(config.port, () => {
      logger.info(`🚀 API Server running on http://${config.host}:${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

const gracefulShutdown = async () => {
  logger.info('Shutting down gracefully...');
  await kafkaProducer.disconnect();
  await redisClient.quit();
  // Add DB disconnect if needed
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
