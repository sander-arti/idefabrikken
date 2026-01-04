/**
 * Rate Limiting Middleware
 *
 * Protects API endpoints from abuse and spam.
 */

import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * Max 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

/**
 * Chat endpoint rate limiter
 * Max 20 chat messages per 5 minutes per IP
 * (More restrictive due to AI costs)
 */
export const chatLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit each IP to 20 chat messages per window
  message: {
    error: 'Too many chat messages',
    message:
      'Too many chat messages from this IP, please try again after 5 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Evaluation endpoint rate limiter
 * Max 5 evaluations per 10 minutes per IP
 * (Most restrictive due to high AI costs - 4 parallel agents)
 */
export const evaluationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 evaluations per window
  message: {
    error: 'Too many evaluation requests',
    message:
      'Too many evaluation requests from this IP, please try again after 10 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
