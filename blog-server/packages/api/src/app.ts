// packages/api/src/app.ts
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import { pinoHttp } from 'pino-http';
import { rateLimit } from 'express-rate-limit';
import { StatusCodes } from 'http-status-codes';
import { collectDefaultMetrics, Registry } from 'prom-client';

import config from './config';
import { logger } from './utils/logger';
import apiRoutes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';
import { tracingMiddleware } from './middlewares/tracing.middleware';
import { setupSwaggerDocs } from './docs/swagger';

const app: Application = express();

// Prometheus Metrics
const register = new Registry();
collectDefaultMetrics({ register });

// Core Middlewares
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'httpsadmin.google.com'], // Allow inline scripts for Swagger UI
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
      },
    },
  })
);
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());
app.use(mongoSanitize());

// Request Tracing & Logging
app.use(tracingMiddleware);
app.use(pinoHttp({ logger }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// API Routes
app.use(config.apiPrefix, apiRoutes);

// Swagger Docs
setupSwaggerDocs(app);

// Health & Metrics Endpoints
app.get('/healthz', (req: Request, res: Response) => res.status(StatusCodes.OK).send('OK'));
app.get('/metrics', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
});

// Error Handling
app.use(errorMiddleware);

export default app;
