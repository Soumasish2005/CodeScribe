// packages/api/src/database/mongo.ts
import mongoose from 'mongoose';
import config from '../config';
import { logger } from '../utils/logger';

let isConnected = false;

export const connectToDB = async () => {
  if (isConnected) {
    logger.info('=> using existing database connection');
    return;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(config.mongo.uri);
    isConnected = true;
    logger.info('✅ MongoDB connected');
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected!');
  isConnected = false;
});

export const disconnectFromDB = async () => {
  if (!isConnected) return;
  await mongoose.disconnect();
};
