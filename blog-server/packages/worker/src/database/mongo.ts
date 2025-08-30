// packages/worker/src/database/mongo.ts
import mongoose from 'mongoose';
import config from '../config';
import { logger } from '../utils/logger';

// Re-using the same connection logic as the API package
export const connectToDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(config.mongo.uri);
    logger.info('✅ Worker MongoDB connected');
  } catch (error) {
    logger.error('❌ Worker MongoDB connection error:', error);
    process.exit(1);
  }
};
