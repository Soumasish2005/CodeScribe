// packages/api/src/config/index.ts
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.API_PORT || '4000', 10),
  host: process.env.API_HOST || '0.0.0.0',
  corsOrigin: process.env.CORS_ORIGIN || 'https://code-scribe-wzzb.vercel.app',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  mongo: {
    uri: process.env.MONGO_URI!,
  },
  redis: {
    uri: process.env.REDIS_URL!,
  },
  aws: {
    bucketName: process.env.AWS_BUCKET_NAME!,
    bucketRegion: process.env.AWS_BUCKET_REGION!,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
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
  jwt: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
    passwordResetTokenExpiry: process.env.PASSWORD_RESET_TOKEN_EXPIRY || '10m',
  },
  argon: {
    timeCost: parseInt(process.env.ARGON2_TIME_COST || '3', 10),
    memoryCost: parseInt(process.env.ARGON2_MEMORY_COST || '65536', 10),
    parallelism: parseInt(process.env.ARGON2_PARALLELISM || '1', 10),
  },
  mailer: {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '1025', 10),
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM_ADDRESS,
  },
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Basic validation to ensure critical secrets are set
if (!config.jwt.accessTokenSecret || !config.jwt.refreshTokenSecret) {
  throw new Error('FATAL ERROR: JWT secrets are not defined.');
}
if (!config.mongo.uri) {
  throw new Error('FATAL ERROR: MONGO_URI is not defined.');
}

export default config;
