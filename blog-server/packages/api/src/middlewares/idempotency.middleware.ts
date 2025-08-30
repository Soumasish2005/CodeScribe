// packages/api/src/middlewares/idempotency.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { redisClient } from '../redis';
import { ApiError } from '../utils/apiError';

const IDEMPOTENCY_KEY_HEADER = 'Idempotency-Key';
const TTL_SECONDS = 24 * 60 * 60; // 24 hours

export const idempotencyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== 'POST' && req.method !== 'PATCH' && req.method !== 'PUT') {
    return next();
  }

  const idempotencyKey = req.header(IDEMPOTENCY_KEY_HEADER);

  if (!idempotencyKey) {
    return next();
  }

  const redisKey = `idempotency:${idempotencyKey}`;

  try {
    const cachedResponse = await redisClient.get(redisKey);

    if (cachedResponse) {
      const { status, body } = JSON.parse(cachedResponse);
      return res.status(status).json(body);
    }

    const originalJson = res.json;
    res.json = (body: any) => {
      const responseToCache = {
        status: res.statusCode,
        body,
      };
      redisClient.set(redisKey, JSON.stringify(responseToCache), {
        EX: TTL_SECONDS,
      });
      return originalJson.call(res, body);
    };

    next();
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Idempotency check failed'));
  }
};
