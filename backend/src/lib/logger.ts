/**
 * Logger Configuration
 *
 * Structured logging with Winston for development and production.
 */

import winston from 'winston';
import { env } from '../config/env.js';

const isDevelopment = env.NODE_ENV === 'development';

/**
 * Custom log format for development (human-readable)
 */
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} ${level}: ${message} ${metaStr}`;
  })
);

/**
 * JSON format for production (structured, parseable)
 */
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Logger instance
 */
export const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: isDevelopment ? devFormat : prodFormat,
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
});

/**
 * Log API request
 */
export function logRequest(
  method: string,
  path: string,
  statusCode: number,
  durationMs: number
) {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  logger.log(level, `${method} ${path} - ${statusCode} (${durationMs}ms)`);
}

/**
 * Log AI agent call
 */
export function logAgentCall(
  agent: string,
  model: string,
  tokensUsed: number,
  durationMs: number
) {
  logger.info(`AI Agent: ${agent}`, {
    model,
    tokensUsed,
    durationMs,
    costEstimate: calculateCost(model, tokensUsed),
  });
}

/**
 * Estimate OpenAI API cost
 * Based on GPT-4o pricing (as of 2024)
 */
function calculateCost(_model: string, tokens: number): string {
  // GPT-4o pricing (approximate): $5 per 1M input tokens, $15 per 1M output tokens
  // Simplified: assume 50/50 split
  // Note: Could use model parameter to differentiate pricing for different models
  const avgPricePerToken = (5 + 15) / 2 / 1_000_000;
  const costUSD = tokens * avgPricePerToken;
  return `$${costUSD.toFixed(4)}`;
}

/**
 * Log OpenAI error with context
 */
export function logOpenAIError(
  error: unknown,
  context: { agent?: string; attempt?: number }
) {
  logger.error('OpenAI API Error', {
    error: error instanceof Error ? error.message : String(error),
    ...context,
  });
}

/**
 * Log Perplexity research call
 */
export function logPerplexityCall(data: {
  agent: string;
  searchesPerformed: number;
  tokensUsed: number;
  durationMs: number;
  citationsCount: number;
}) {
  logger.info(`Perplexity Research: ${data.agent}`, {
    searchesPerformed: data.searchesPerformed,
    tokensUsed: data.tokensUsed,
    durationMs: data.durationMs,
    citationsCount: data.citationsCount,
    costEstimate: calculatePerplexityCost(data.searchesPerformed),
  });
}

/**
 * Estimate Perplexity API cost
 * Sonar Deep Research: ~$0.04 per search
 */
function calculatePerplexityCost(searches: number): string {
  const costPerSearch = 0.04;
  const costUSD = searches * costPerSearch;
  return `$${costUSD.toFixed(4)}`;
}

/**
 * Log provider error (OpenAI or Perplexity)
 */
export function logProviderError(
  provider: 'openai' | 'perplexity',
  error: unknown,
  context: { agent?: string; attempt?: number }
) {
  logger.error(`${provider.toUpperCase()} API Error`, {
    error: error instanceof Error ? error.message : String(error),
    provider,
    ...context,
  });
}

/**
 * Log evaluation start/completion
 */
export function logEvaluation(
  ideaId: string,
  status: 'started' | 'completed' | 'failed',
  metadata?: { totalScore?: number; recommendation?: string; error?: string }
) {
  const level = status === 'failed' ? 'error' : 'info';
  logger.log(level, `Evaluation ${status}`, {
    ideaId,
    ...metadata,
  });
}

/**
 * Log research quality assessment
 */
export function logResearchQuality(data: {
  agent: string;
  overall: 'good' | 'moderate' | 'poor';
  findingsCount: number;
  citationsCount: number;
  coverageScore: number;
  issues?: string[];
  suggestions?: string[];
}) {
  const level = data.overall === 'poor' ? 'warn' : 'info';
  logger.log(level, `Research Quality: ${data.agent}`, {
    overall: data.overall,
    metrics: {
      findings: data.findingsCount,
      citations: data.citationsCount,
      coverage: `${data.coverageScore.toFixed(0)}%`,
    },
    issues: data.issues,
    suggestions: data.suggestions,
  });
}

/**
 * Log evaluation cost breakdown
 */
export function logEvaluationCost(data: {
  researchCost: number;
  synthesisCost: number;
  totalCost: number;
  breakdown?: {
    market?: number;
    product?: number;
    business?: number;
  };
}) {
  logger.info('Evaluation Cost', {
    research: `$${data.researchCost.toFixed(4)}`,
    synthesis: `$${data.synthesisCost.toFixed(4)}`,
    total: `$${data.totalCost.toFixed(4)}`,
    breakdown: data.breakdown
      ? {
          market: `$${data.breakdown.market?.toFixed(4)}`,
          product: `$${data.breakdown.product?.toFixed(4)}`,
          business: `$${data.breakdown.business?.toFixed(4)}`,
        }
      : undefined,
  });
}
