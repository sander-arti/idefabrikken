/**
 * Shared types for AI provider abstractions
 *
 * Provides common interfaces for both OpenAI and Perplexity providers
 */

/**
 * Citation from research/web sources
 */
export interface Citation {
  url: string;
  title?: string;
  snippet?: string;
}

/**
 * Common response structure from AI providers
 */
export interface ProviderResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  citations?: Citation[];
}

/**
 * Base configuration for AI providers
 */
export interface ProviderConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
}

/**
 * Common error class for provider errors
 */
export class ProviderError extends Error {
  constructor(
    message: string,
    public provider: 'openai' | 'perplexity',
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}
