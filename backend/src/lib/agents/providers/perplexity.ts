/**
 * Perplexity API Client
 *
 * Provides clean abstraction for Perplexity Sonar Deep Research API
 * https://docs.perplexity.ai/api-reference/chat-completions-post
 */

import { Citation, ProviderResponse, ProviderError } from './types.js';

/**
 * Perplexity API configuration
 */
export interface PerplexityConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  model?: string;
  researchDepth?: 'low' | 'medium' | 'high';
}

/**
 * Perplexity chat completion request
 */
export interface PerplexityRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  return_citations?: boolean;
  return_images?: boolean;
  search_domain_filter?: string[];
  search_recency_filter?: 'month' | 'week' | 'day' | 'hour';
}

/**
 * Perplexity API response
 */
interface PerplexityAPIResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta: {
      role: string;
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  citations?: string[];
}

/**
 * Perplexity API Client
 */
export class PerplexityClient {
  private config: Required<PerplexityConfig>;

  constructor(config: PerplexityConfig) {
    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || 'https://api.perplexity.ai',
      timeout: config.timeout || 120000, // 2 minutes default
      model: config.model || 'sonar-deep-research',
      researchDepth: config.researchDepth || 'medium',
    };

    if (!this.config.apiKey) {
      throw new Error('Perplexity API key is required');
    }
  }

  /**
   * Call Perplexity Chat Completions API
   */
  async chat(request: Omit<PerplexityRequest, 'model'>): Promise<ProviderResponse> {
    const url = `${this.config.baseUrl}/chat/completions`;

    const fullRequest: PerplexityRequest = {
      model: this.config.model,
      ...request,
      return_citations: true, // Always return citations
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(fullRequest),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        throw new ProviderError(
          `Perplexity API error: ${response.status} ${response.statusText} - ${errorBody}`,
          'perplexity',
          response.status
        );
      }

      const data = (await response.json()) as PerplexityAPIResponse;

      // Extract content from first choice
      const content = data.choices[0]?.message?.content || '';

      // Parse citations
      const citations: Citation[] = (data.citations || []).map((url) => ({
        url,
      }));

      return {
        content,
        model: data.model,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
        citations,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ProviderError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ProviderError(
            `Perplexity API request timeout after ${this.config.timeout}ms`,
            'perplexity'
          );
        }

        throw new ProviderError(
          `Perplexity API request failed: ${error.message}`,
          'perplexity',
          undefined,
          error
        );
      }

      throw new ProviderError(
        'Unknown Perplexity API error',
        'perplexity',
        undefined,
        error
      );
    }
  }

  /**
   * Helper: Check if error is retryable
   */
  static isRetryableError(error: unknown): boolean {
    if (!(error instanceof ProviderError)) {
      return false;
    }

    if (error.provider !== 'perplexity') {
      return false;
    }

    // Retry on rate limits, server errors, network errors
    return (
      error.statusCode === 429 || // Rate limited
      error.statusCode === 503 || // Service unavailable
      error.statusCode === 504 || // Gateway timeout
      (error.statusCode !== undefined &&
        error.statusCode >= 500 &&
        error.statusCode < 600) || // Server errors
      error.message.includes('timeout') || // Timeout
      error.message.includes('ECONNRESET') || // Network reset
      error.message.includes('ETIMEDOUT') // Network timeout
    );
  }
}
