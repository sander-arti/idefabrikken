/**
 * OpenAI Provider
 *
 * Abstraction layer for OpenAI API calls with error handling and retry logic.
 * Matches the Perplexity provider structure for consistency.
 */

import OpenAI from 'openai';
import { ProviderResponse, ProviderError } from './types.js';

/**
 * OpenAI-specific configuration
 */
export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  timeout?: number;
  organization?: string;
}

/**
 * OpenAI chat request
 */
export interface OpenAIRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

/**
 * OpenAI API client with resolved configuration
 */
interface ResolvedOpenAIConfig {
  apiKey: string;
  model: string;
  baseUrl?: string;
  timeout: number;
  organization?: string;
}

/**
 * OpenAI API client
 */
export class OpenAIClient {
  private client: OpenAI;
  private config: ResolvedOpenAIConfig;

  constructor(config: OpenAIConfig) {
    this.config = {
      apiKey: config.apiKey,
      model: config.model || 'gpt-4o',
      baseUrl: config.baseUrl,
      timeout: config.timeout || 60000,
      organization: config.organization,
    };

    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
      organization: this.config.organization,
      timeout: this.config.timeout,
    });
  }

  /**
   * Execute chat completion
   *
   * @param request - Chat completion request
   * @returns Standardized provider response
   * @throws {ProviderError} On API errors
   */
  async chat(
    request: Omit<OpenAIRequest, 'model'>
  ): Promise<ProviderResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? 2000,
        top_p: request.top_p,
        frequency_penalty: request.frequency_penalty,
        presence_penalty: request.presence_penalty,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new ProviderError(
          'No content in OpenAI response',
          'openai',
          undefined,
          response
        );
      }

      return {
        content,
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        citations: undefined, // OpenAI doesn't return citations
      };
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new ProviderError(
          `OpenAI API error: ${error.message}`,
          'openai',
          error.status,
          error
        );
      }

      if (error instanceof ProviderError) {
        throw error;
      }

      throw new ProviderError(
        `Unexpected OpenAI error: ${error instanceof Error ? error.message : String(error)}`,
        'openai',
        undefined,
        error
      );
    }
  }

  /**
   * Check if an error is retryable
   *
   * @param error - Error to check
   * @returns True if error should trigger retry
   */
  static isRetryableError(error: unknown): boolean {
    if (error instanceof OpenAI.APIError) {
      // Retry on rate limits, server errors, and timeouts
      if (error.status === 429) return true; // Rate limit
      if (error.status === 503) return true; // Service unavailable
      if (error.status === 504) return true; // Gateway timeout
      if (error.status && error.status >= 500) return true; // Server errors
    }

    if (error instanceof ProviderError) {
      if (error.statusCode === 429) return true;
      if (error.statusCode === 503) return true;
      if (error.statusCode === 504) return true;
      if (error.statusCode && error.statusCode >= 500) return true;
    }

    // Retry on network errors
    if (error instanceof Error) {
      if (error.message.includes('timeout')) return true;
      if (error.message.includes('ECONNRESET')) return true;
      if (error.message.includes('ETIMEDOUT')) return true;
    }

    return false;
  }
}
