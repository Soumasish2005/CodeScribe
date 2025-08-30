// packages/worker/src/consumers/index.ts
import { KafkaConsumer } from '../kafka/consumer';
import { KAFKA_TOPICS } from '@devnovate/shared/constants';
import { interactionsConsumer } from './interactions.consumer';
// Import other consumers like analytics.consumer here

export const runConsumers = async () => {
  const consumer = new KafkaConsumer({
    groupId: 'interactions-group',
  });

  await consumer.connect();

  await consumer.subscribe(KAFKA_TOPICS.INTERACTIONS, interactionsConsumer);
  // await consumer.subscribe(KAFKA_TOPICS.ANALYTICS, analyticsConsumer);

  await consumer.run();
};
