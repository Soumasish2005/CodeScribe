// packages/api/src/services/outbox.service.ts
import mongoose, { ClientSession } from 'mongoose';
import { Outbox } from '../models/outbox.model';
import { kafkaProducer } from '../kafka/producer';
import { logger } from '../utils/logger';

interface Event {
  topic: string;
  key: string;
  payload: Record<string, any>;
}

interface Options {
  session?: ClientSession;
}

export class OutboxService {
  public async createEvent(event: Event, options: Options = {}): Promise<void> {
    const outboxMessage = new Outbox(event);
    await outboxMessage.save({ session: options.session });
  }
}

// This function is intended to be run by a separate process/job (the "Relay")
export const processOutboxMessages = async () => {
  logger.info('Polling for outbox messages...');
  // In a real high-throughput system, use findOneAndUpdate for locking to prevent multiple relays from processing the same message
  const messages = await Outbox.find({ status: 'PENDING' }).limit(100).sort({ createdAt: 1 });

  if (messages.length === 0) {
    logger.info('No pending messages found.');
    return;
  }

  for (const msg of messages) {
    try {
      await kafkaProducer.sendMessage(msg.topic, msg.key, msg.payload);
      msg.status = 'PROCESSED';
      msg.processedAt = new Date();
      await msg.save();
      logger.info({ msgId: msg._id, topic: msg.topic }, 'Outbox message processed and sent to Kafka');
    } catch (error) {
      logger.error({ msgId: msg._id, error }, 'Failed to process outbox message');
      msg.status = 'FAILED';
      msg.retries += 1;
      // Add DLQ logic after a certain number of retries
      await msg.save();
    }
  }
};
