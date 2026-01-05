import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { ideasRouter } from './api/routes/ideas.js';
import { chatRouter } from './api/routes/chat.js';
import { evaluateRouter } from './api/routes/evaluate.js';
import { apiLimiter, chatLimiter, evaluationLimiter } from './api/middleware/rateLimiter.js';
import { logger } from './lib/logger.js';

/**
 * Idéfabrikken Backend API Server
 *
 * Express server providing REST API for AI-powered idea evaluation.
 */

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (no rate limit)
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Apply general rate limiter to all API routes
app.use('/api', apiLimiter);

// API Routes with specific rate limiters
app.use('/api/ideas', ideasRouter);
app.use('/api/ideas/:id/chat', chatLimiter); // Chat endpoint gets stricter limiter
app.use('/api/ideas', chatRouter);
app.use('/api/ideas/:id/evaluate', evaluationLimiter); // Evaluation gets strictest limiter
app.use('/api/ideas', evaluateRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
  });
});

// Error handler
app.use((err: Error & { statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
  });

  // Use error's statusCode if available, otherwise default to 500
  const statusCode = err.statusCode || 500;
  const errorName = statusCode === 401 || statusCode === 403 ? 'Unauthorized' : 'Internal Server Error';

  res.status(statusCode).json({
    error: errorName,
    message: env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  });
});

// Start server
const PORT = env.PORT;
const server = app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
});

// Configure server timeout for long-running operations (Perplexity Deep Research)
// Note: Deep research can take 3-10 minutes per query, synthesis takes 1-5 minutes
server.timeout = env.SERVER_TIMEOUT_MS; // 15 minutes default
logger.info(`Server timeout: ${env.SERVER_TIMEOUT_MS}ms (${env.SERVER_TIMEOUT_MS / 60000} minutes)`);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
