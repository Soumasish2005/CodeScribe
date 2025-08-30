// packages/worker/src/consumers/interactions.consumer.ts
import { EachBatchPayload } from 'kafkajs';
import { InteractionBatchProcessor } from '../processors/InteractionBatchProcessor';
import config from '../config';
import { TrendingService } from '../services/trending.service';
import { redisClient } from '../redis';
import { RedisClientType } from 'redis';

const trendingService = new TrendingService(redisClient as unknown as RedisClientType);

const interactionProcessor = new InteractionBatchProcessor(
  {
    flushIntervalMs: config.worker.flushIntervalMs,
    batchSize: config.worker.batchSize,
  },
  trendingService
);

export const interactionsConsumer = async (payload: EachBatchPayload) => {
  await interactionProcessor.processBatch(payload);
};
