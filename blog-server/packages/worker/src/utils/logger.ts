// packages/worker/src/utils/logger.ts
// Re-using the same logger as the API package
import pino from 'pino';
import config from '../config';

const transport =
  config.nodeEnv === 'development'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
        },
      }
    : undefined;

export const logger = pino({
  level: config.logLevel,
  name: 'worker',
  transport,
});
