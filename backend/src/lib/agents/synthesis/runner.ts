/**
 * Synthesis Agent Runner
 *
 * Runs synthesis agents that combine research data with idea documents
 * to produce final reports with scores.
 */

import { OpenAIClient } from '../providers/openai.js';
import type { ParsedResearch } from '../research/response-parser.js';
import { parseScore } from '../utils/parse-score.js';
import { env } from '../../../config/env.js';
import { getMarketStrategistSynthesisPrompt } from '../prompts/synthesis/market-strategist.js';
import { getProductArchitectSynthesisPrompt } from '../prompts/synthesis/product-architect.js';
import { getBusinessCriticSynthesisPrompt } from '../prompts/synthesis/business-critic.js';

/**
 * Synthesis agent result
 */
export interface SynthesisResult {
  content: string;
  score: number;
  metadata: {
    agentType: 'market' | 'product' | 'business';
    model: string;
    durationMs: number;
    tokensUsed: number;
    costEstimate: number;
  };
}

/**
 * Synthesis configuration
 */
export interface SynthesisConfig {
  model?: string;
  timeout?: number;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Default synthesis configuration
 */
const DEFAULT_CONFIG: Required<SynthesisConfig> = {
  model: 'gpt-4o', // Will be gpt-5.2 when available
  timeout: 60000, // 1 minute
  temperature: 0.7,
  maxTokens: 3000,
};

/**
 * Run synthesis agent for a specific domain
 *
 * @param options - Synthesis options
 * @returns Synthesis result with score
 *
 * @throws {ProviderError} If OpenAI API fails
 * @throws {Error} If score parsing fails
 */
export async function runSynthesisAgent(options: {
  ideaDocument: string;
  researchData: ParsedResearch;
  agentType: 'market' | 'product' | 'business';
  config?: SynthesisConfig;
}): Promise<SynthesisResult> {
  const { ideaDocument, researchData, agentType, config = {} } = options;
  const startTime = Date.now();

  // Merge with defaults
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  // Generate synthesis prompt based on agent type
  const { systemPrompt, userPrompt } = generateSynthesisPrompt(
    agentType,
    ideaDocument,
    researchData
  );

  // Initialize OpenAI client
  const openai = new OpenAIClient({
    apiKey: env.OPENAI_API_KEY,
    model: env.SYNTHESIS_MODEL || fullConfig.model,
    timeout: env.SYNTHESIS_TIMEOUT_MS || fullConfig.timeout,
  });

  console.log(
    `🧠 Running ${agentType} synthesis agent (${env.SYNTHESIS_MODEL || fullConfig.model})...`
  );

  // Execute synthesis
  const response = await openai.chat({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: fullConfig.maxTokens,
    temperature: fullConfig.temperature,
  });

  const durationMs = Date.now() - startTime;

  console.log(
    `✅ ${agentType} synthesis completed (${durationMs}ms, ${response.usage.totalTokens} tokens)`
  );

  // Parse score from synthesis content
  const score = parseScore(response.content);

  console.log(`  - Score: ${score}/10`);

  // Calculate cost estimate
  // GPT-4o pricing: ~$2.50 per 1M input tokens, ~$10 per 1M output tokens (averaged)
  const avgPricePerToken = (2.5 + 10) / 2 / 1_000_000;
  const costEstimate = response.usage.totalTokens * avgPricePerToken;

  return {
    content: response.content,
    score,
    metadata: {
      agentType,
      model: response.model,
      durationMs,
      tokensUsed: response.usage.totalTokens,
      costEstimate,
    },
  };
}

/**
 * Generate synthesis prompt for agent type
 */
function generateSynthesisPrompt(
  agentType: 'market' | 'product' | 'business',
  ideaDocument: string,
  researchData: ParsedResearch
): { systemPrompt: string; userPrompt: string } {
  switch (agentType) {
    case 'market':
      return getMarketStrategistSynthesisPrompt(ideaDocument, researchData);
    case 'product':
      return getProductArchitectSynthesisPrompt(ideaDocument, researchData);
    case 'business':
      return getBusinessCriticSynthesisPrompt(ideaDocument, researchData);
    default:
      throw new Error(`Unknown agent type: ${agentType}`);
  }
}
