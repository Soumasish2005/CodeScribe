// packages/api/src/kafka/producer.ts
import { Kafka, Partitioners, Producer, logLevel } from 'kafkajs';
import config from '../config';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

class KafkaProducer {
  private kafka: Kafka;
  private producer: Producer;

  constructor() {
    this.kafka = new Kafka({
      clientId: config.kafka.clientId,
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
    this.producer = this.kafka.producer({
      idempotent: true,
      maxInFlightRequests: 1,
      retry: { retries: 5 },
      createPartitioner: Partitioners.LegacyPartitioner,
    });
  }

  async connect() {
    try {
      await this.producer.connect();
      logger.info('Kafka Producer connected');
    } catch (error) {
      logger.error('Failed to connect Kafka Producer:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.producer.disconnect();
      logger.info('Kafka Producer disconnected');
    } catch (error) {
      logger.error('Failed to disconnect Kafka Producer:', error);
    }
  }

  async sendMessage(topic: string, key: string, payload: object) {
    try {
      await this.producer.send({
        topic,
        messages: [{ key, value: JSON.stringify(payload) }],
      });
    } catch (error) {
      logger.error({ error, topic, key }, 'Failed to send message to Kafka');
      // Depending on the strategy, you might want to re-throw or handle this
      throw error;
    }
  }
}

export const kafkaProducer = new KafkaProducer();
