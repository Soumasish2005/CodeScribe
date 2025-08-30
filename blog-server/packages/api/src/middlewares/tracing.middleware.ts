// packages/api/src/middlewares/tracing.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const tracingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.id = requestId as string;
  res.setHeader('x-request-id', requestId);
  next();
};
