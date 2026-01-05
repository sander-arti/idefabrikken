/**
 * Retry Logic for Agent Calls
 *
 * Handles transient failures from OpenAI and Perplexity APIs with exponential backoff.
 * Supports rate limiting (429), temporary server errors (5xx), and network timeouts.
 */

import OpenAI from 'openai';
import { ProviderError } from './providers/types.js';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 1000, // 1 second
  maxDelayMs: 10000, // 10 seconds
  backoffMultiplier: 2,
};

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(error: unknown): boolean {
  // Check OpenAI errors
  if (error instanceof OpenAI.APIError) {
    // Retry on rate limits (429) and server errors (5xx)
    return error.status === 429 || (error.status >= 500 && error.status < 600);
  }

  // Check ProviderError (from OpenAI or Perplexity clients)
  if (error instanceof ProviderError) {
    if (!error.statusCode) return false;

    // Retry on rate limits and server errors
    return (
      error.statusCode === 429 || // Rate limit
      error.statusCode === 503 || // Service unavailable
      error.statusCode === 504 || // Gateway timeout
      (error.statusCode >= 500 && error.statusCode < 600) // Other 5xx errors
    );
  }

  // Retry on network errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('econnreset') ||
      message.includes('enotfound') ||
      message.includes('etimedout')
    );
  }

  return false;
}

/**
 * Execute a function with retry logic
 *
 * @param fn - Async function to execute
 * @param options - Retry configuration
 * @returns Result of the function
 * @throws Last error if all retries fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;
  let delayMs = opts.initialDelayMs;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on non-retryable errors
      if (!isRetryableError(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === opts.maxAttempts) {
        break;
      }

      // Log retry attempt
      console.warn(
        `Retry attempt ${attempt}/${opts.maxAttempts} after error:`,
        error instanceof Error ? error.message : String(error)
      );

      // Wait with exponential backoff
      await sleep(delayMs);
      delayMs = Math.min(delayMs * opts.backoffMultiplier, opts.maxDelayMs);
    }
  }

  // All retries failed
  throw lastError;
}
