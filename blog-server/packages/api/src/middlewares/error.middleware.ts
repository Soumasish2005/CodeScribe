// packages/api/src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import { ApiError } from '../utils/apiError';
import config from '../config';
import { logger } from '../utils/logger';

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = 'An unexpected error occurred';
  let errors: any[] | undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Validation failed';
    errors = err.errors.map((e) => ({ path: e.path.join('.'), message: e.message }));
  } else if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    statusCode = StatusCodes.CONFLICT;
    const field = Object.keys((err as any).keyPattern)[0];
    message = `Duplicate field error: The ${field} is already taken.`;
  }

  logger.error(
    {
      err,
      requestId: req.id,
      statusCode,
      message,
    },
    'Error caught in middleware'
  );

  const response: { success: boolean; message: string; errors?: any; stack?: string } = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  if (config.nodeEnv === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
