// packages/worker/src/services/trending.service.ts
import { RedisClientType } from 'redis';
import { TRENDING_WINDOWS } from '@devnovate/shared/constants';

const INTERACTION_SCORES = {
  like: 2,
  view: 1,
  comment: 5,
};

type InteractionType = keyof typeof INTERACTION_SCORES;

export class TrendingService {
  constructor(private redis: RedisClientType) {}

  public async incrementScore(blogId: string, type: InteractionType, amount: number = 1): Promise<void> {
    const score = INTERACTION_SCORES[type] * amount;
    const now = Date.now();

    const multi = this.redis.multi();

    for (const [windowKey, windowMs] of Object.entries(TRENDING_WINDOWS)) {
      const redisKey = `trending:${windowKey}`;
      multi.zIncrBy(redisKey, score, blogId);

      // Simple TTL-based cleanup. A cron job for precise windowing is more robust.
      multi.expire(redisKey, Math.ceil(windowMs / 1000));
    }

    await multi.exec();
  }

  public async getTrending(window: string = '24h', limit: number = 10): Promise<string[]> {
    const redisKey = `trending:${window}`;
    const results = await this.redis.zRangeWithScores(redisKey, 0, limit - 1, { REV: true });
    return results.map((item) => item.value);
  }
}
