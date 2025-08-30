// packages/worker/src/kafka/consumer.ts
import { Kafka, Consumer, EachBatchPayload, logLevel } from 'kafkajs';
import config from '../config';
import fs from 'fs';
import { logger } from '../utils/logger';
import { KAFKA_TOPICS } from '@devnovate/shared/constants';
import { interactionsConsumer } from '../consumers/interactions.consumer';
import path from 'path';

type ConsumerFunction = (payload: EachBatchPayload) => Promise<void>;

export class KafkaConsumer {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor({ groupId }: { groupId: string }) {
    this.kafka = new Kafka({
      clientId: `${config.kafka.clientId}-${groupId}`,
      brokers: config.kafka.brokers || [],
      logLevel: logLevel.WARN,
      ssl: {
        ca: [fs.readFileSync(path.resolve('./ca.pem'), 'utf-8')],
      },
      sasl: {
        mechanism: 'plain',
        username: config.kafka.username!,
        password: config.kafka.password!,
      },
    });
    this.consumer = this.kafka.consumer({ groupId });
  }

  async connect() {
    await this.consumer.connect();
    logger.info('✅ Kafka consumer connected');
  }

  async subscribe(topic: string, handler: ConsumerFunction) {
    await this.consumer.subscribe({ topic, fromBeginning: true });
    logger.info(`Subscribed to topic: ${topic}`);
  }

  async run() {
    await this.consumer.run({
      eachBatchAutoResolve: false, // We manually resolve offsets in the processor
      eachBatch: async (payload: EachBatchPayload) => {
        const { topic, partition } = payload.batch;
        logger.debug(`Received batch from ${topic}:${partition}`);
        try {
          // Find the handler for this topic
          const handler = this.getHandlerForTopic(topic);
          if (handler) {
            await handler(payload);
          } else {
            logger.warn(`No handler found for topic: ${topic}`);
          }
        } catch (error) {
          logger.error({ error, topic, partition }, 'Error processing batch');
          // For critical errors, you might want to stop the consumer
          // For now, we log and continue, relying on retries or a DLQ
        }
      },
    });
  }

  // This is a simplified handler mapping. A more robust solution might use a map.
  private getHandlerForTopic(topic: string): ConsumerFunction | null {
    if (topic === KAFKA_TOPICS.INTERACTIONS) {
      return interactionsConsumer;
    }
    return null;
  }
}
