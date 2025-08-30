// packages/worker/src/config/index.ts
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  mongo: {
    uri: process.env.MONGO_URI!,
  },
  redis: {
    uri: process.env.REDIS_URL!,
  },
  kafka: {
    brokers: process.env.KAFKA_BROKERS?.split(','),
    clientId: process.env.KAFKA_CLIENT_ID,
    username: process.env.KAFKA_USERNAME || 'avnadmin',
    password: process.env.KAFKA_PASSWORD || '',
    ssl: {
      ca: process.env.KAFKA_CA_PATH || 'certs/ca.pem',
      cert: process.env.KAFKA_CERT_PATH || 'certs/service.cert',
      key: process.env.KAFKA_KEY_PATH || 'certs/service.key',
    },
  },
  worker: {
    batchSize: parseInt(process.env.WORKER_BATCH_SIZE || '100', 10),
    flushIntervalMs: parseInt(process.env.WORKER_FLUSH_INTERVAL_MS || '5000', 10),
  },
  logLevel: process.env.LOG_LEVEL || 'info',
};

if (!config.mongo.uri) {
  throw new Error('FATAL ERROR: MONGO_URI is not defined.');
}

export default config;
