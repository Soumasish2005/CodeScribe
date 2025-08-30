// packages/worker/src/processors/InteractionBatchProcessor.ts
import { EachBatchPayload } from 'kafkajs';
import { InteractionEventPayload } from '@devnovate/shared/events';
import { INTERACTION_TYPES, KAFKA_TOPICS } from '@devnovate/shared/constants';
import { logger } from '../utils/logger';
import { Blog } from '../models/blog.model'; // Worker needs its own models
import { TrendingService } from '../services/trending.service';

type BatchBuffer = Map<string, { likes: Set<string>; unlikes: Set<string>; views: number }>;

export class InteractionBatchProcessor {
  private buffer: BatchBuffer = new Map();
  private flushTimeout: NodeJS.Timeout | null = null;

  constructor(
    private readonly config: { flushIntervalMs: number; batchSize: number },
    private readonly trendingService: TrendingService
  ) {}

  public async processBatch(batchPayload: EachBatchPayload) {
    const { batch, resolveOffset, heartbeat, isRunning, isStale } = batchPayload;

    for (const message of batch.messages) {
      if (!isRunning() || isStale()) break;

      try {
        const event = JSON.parse(message.value!.toString()) as InteractionEventPayload;
        this.addToBuffer(event);

        if (this.shouldFlush(batch.messages.length)) {
          await this.flush();
        }

        resolveOffset(message.offset);
        await heartbeat();
      } catch (err) {
        logger.error({ err, offset: message.offset }, 'Error processing message, sending to DLQ is recommended.');
        // Here you would produce to a DLQ topic
      }
    }

    // Ensure any remaining items in buffer are flushed
    await this.flush();
  }

  private addToBuffer(event: InteractionEventPayload) {
    const { blogId, userId, type } = event;
    if (!this.buffer.has(blogId)) {
      this.buffer.set(blogId, { likes: new Set(), unlikes: new Set(), views: 0 });
    }
    const blogInteractions = this.buffer.get(blogId)!;

    switch (type) {
      case INTERACTION_TYPES.LIKE:
        blogInteractions.likes.add(userId);
        blogInteractions.unlikes.delete(userId); // If user unliked then liked in same batch
        break;
      case INTERACTION_TYPES.UNLIKE:
        blogInteractions.unlikes.add(userId);
        blogInteractions.likes.delete(userId);
        break;
      case INTERACTION_TYPES.VIEW:
        blogInteractions.views++;
        break;
    }
  }

  private shouldFlush(currentBatchSize: number): boolean {
    return currentBatchSize >= this.config.batchSize;
  }

  private async flush() {
    if (this.buffer.size === 0) return;

    logger.info(`Flushing interaction batch of size ${this.buffer.size}`);
    const promises = [];

    for (const [blogId, interactions] of this.buffer.entries()) {
      const netLikes = interactions.likes.size - interactions.unlikes.size;
      const netViews = interactions.views;

      const updatePromise = Blog.updateOne({ _id: blogId }, { $inc: { likeCount: netLikes, viewCount: netViews } });
      promises.push(updatePromise);

      // Update trending scores
      if (netLikes > 0) promises.push(this.trendingService.incrementScore(blogId, 'like', netLikes));
      if (netViews > 0) promises.push(this.trendingService.incrementScore(blogId, 'view', netViews));
    }

    await Promise.all(promises);
    this.buffer.clear();
  }
}
