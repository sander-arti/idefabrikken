/**
 * Test Setup
 *
 * Global setup and mocks for all tests
 */

import { vi } from 'vitest';
import {
  mockMarketResearch,
  mockProductResearch,
  mockBusinessResearch,
} from './mocks/perplexity-mock.js';

// Mock Perplexity client globally
vi.mock('../providers/perplexity.js', () => {
  return {
    PerplexityClient: vi.fn().mockImplementation(() => ({
      chat: vi.fn().mockImplementation(async ({ messages }) => {
        const userMessage = messages.find((m: { role: string }) => m.role === 'user')?.content || '';

        // Determine agent type from prompt
        if (userMessage.includes('MARKEDSSTØRRELSE') || userMessage.includes('marked')) {
          return {
            content: mockMarketResearch.content,
            model: 'sonar-deep-research',
            usage: {
              promptTokens: 500,
              completionTokens: 2000,
              totalTokens: 2500,
            },
            citations: mockMarketResearch.citations,
          };
        } else if (userMessage.includes('TEKNISK LANDSKAP') || userMessage.includes('produkt')) {
          return {
            content: mockProductResearch.content,
            model: 'sonar-deep-research',
            usage: {
              promptTokens: 500,
              completionTokens: 2000,
              totalTokens: 2500,
            },
            citations: mockProductResearch.citations,
          };
        } else {
          return {
            content: mockBusinessResearch.content,
            model: 'sonar-deep-research',
            usage: {
              promptTokens: 500,
              completionTokens: 2000,
              totalTokens: 2500,
            },
            citations: mockBusinessResearch.citations,
          };
        }
      }),
    })),
  };
});

// Mock OpenAI client globally
vi.mock('../providers/openai.js', () => {
  return {
    OpenAIClient: vi.fn().mockImplementation(() => ({
      chat: vi.fn().mockResolvedValue({
        content: `# Markedsrapport

## Markedsstørrelse
Basert på research viser dette et stort potensial.

## Konkurrenter
Det finnes etablerte aktører, men også rom for nykommere.

## Konklusjon
Anbefaler å gå videre med pilot.

Score: 7/10`,
        model: 'gpt-4o',
        usage: {
          promptTokens: 1000,
          completionTokens: 500,
          totalTokens: 1500,
        },
      }),
    })),
  };
});
