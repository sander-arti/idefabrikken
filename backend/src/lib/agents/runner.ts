import OpenAI from 'openai';
import { env } from '../../config/env.js';
import { withRetry } from './retry.js';
import { logAgentCall, logOpenAIError } from '../logger.js';

/**
 * AI Agent Runner
 *
 * Wrapper around OpenAI API for running AI agents with error handling and retry logic
 */

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export interface AgentOptions {
  systemPrompt: string;
  userMessage: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  agentName?: string; // For logging purposes
}

export interface AgentResponse {
  content: string;
  model: string;
  tokensUsed: number;
}

/**
 * Run an AI agent with given prompts
 */
export async function runAgent(options: AgentOptions): Promise<AgentResponse> {
  const {
    systemPrompt,
    userMessage,
    conversationHistory = [],
    model = 'gpt-4o',
    temperature = 0.7,
    maxTokens = 2000,
    agentName = 'Unknown Agent',
  } = options;

  const startTime = Date.now();

  // Build messages array
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
  ];

  // Add conversation history if provided
  for (const msg of conversationHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }

  // Add current user message
  messages.push({ role: 'user', content: userMessage });

  try {
    // Call OpenAI API with retry logic
    const response = await withRetry(async () => {
      // GPT-5.x models use max_completion_tokens instead of max_tokens
      const isGPT5 = model.startsWith('gpt-5');

      return await openai.chat.completions.create({
        model,
        messages,
        temperature,
        ...(isGPT5
          ? { max_completion_tokens: maxTokens }
          : { max_tokens: maxTokens }
        ),
      });
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const durationMs = Date.now() - startTime;
    const tokensUsed = response.usage?.total_tokens || 0;

    // Log successful agent call
    logAgentCall(agentName, response.model, tokensUsed, durationMs);

    return {
      content,
      model: response.model,
      tokensUsed,
    };
  } catch (error) {
    // Log error with context
    logOpenAIError(error, { agent: agentName });

    // Handle OpenAI-specific errors
    if (error instanceof OpenAI.APIError) {
      throw new Error(
        `OpenAI API error (${error.status}): ${error.message}`
      );
    }

    // Handle other errors
    throw error;
  }
}
