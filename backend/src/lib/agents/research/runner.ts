/**
 * Research Agent Runner
 *
 * Orchestrates research agents using Perplexity Deep Research.
 * Generates prompts, executes research, and parses results.
 */

import { PerplexityClient } from '../providers/perplexity.js';
import { generateResearchPrompt, type AgentType } from './prompt-generator.js';
import {
  parsePerplexityResponse,
  type ParsedResearch,
} from './response-parser.js';
import { env } from '../../../config/env.js';

/**
 * Research agent configuration
 */
export interface ResearchConfig {
  model?: string;
  timeout?: number;
  searchDepth?: 'low' | 'medium' | 'high';
  maxTokens?: number;
}

/**
 * Research agent result with metadata
 */
export interface ResearchResult {
  research: ParsedResearch;
  rawContent: string;
  metadata: {
    agentType: AgentType;
    model: string;
    durationMs: number;
    tokensUsed: number;
    searchesPerformed?: number;
    costEstimate: number;
  };
}

/**
 * Default research configuration
 */
const DEFAULT_CONFIG: Required<ResearchConfig> = {
  model: 'sonar-deep-research',
  timeout: 120000, // 2 minutes
  searchDepth: 'medium',
  maxTokens: 4000,
};

/**
 * Run research agent for a specific domain
 *
 * @param ideaDocument - The IDÉUTKAST.md content
 * @param agentType - Type of research: market, product, or business
 * @param config - Optional research configuration
 * @returns Structured research results with citations
 *
 * @throws {ProviderError} If Perplexity API fails
 * @throws {Error} If research quality is too low (when configured)
 */
export async function runResearchAgent(
  ideaDocument: string,
  agentType: AgentType,
  config: ResearchConfig = {}
): Promise<ResearchResult> {
  const startTime = Date.now();

  // Merge with defaults
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  // Generate agent-specific research prompt
  const { systemPrompt, userPrompt } = generateResearchPrompt(
    agentType,
    ideaDocument
  );

  // Initialize Perplexity client
  const perplexity = new PerplexityClient({
    apiKey: env.PERPLEXITY_API_KEY,
    baseUrl: env.PERPLEXITY_BASE_URL || 'https://api.perplexity.ai',
    model: fullConfig.model,
    timeout: fullConfig.timeout,
  });

  console.log(
    `🔍 Running ${agentType} research agent (${fullConfig.model}, timeout: ${fullConfig.timeout}ms)...`
  );

  // Execute research
  const response = await perplexity.chat({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: fullConfig.maxTokens,
    temperature: 0.2, // Lower temperature for factual research
    search_domain_filter: undefined, // No domain restrictions for broad research
    search_recency_filter: 'month', // Focus on recent data
  });

  const durationMs = Date.now() - startTime;

  console.log(
    `✅ ${agentType} research completed (${durationMs}ms, ${response.usage.totalTokens} tokens, ${response.citations?.length || 0} citations)`
  );

  // Parse response into structured research data
  const research = parsePerplexityResponse(
    response.content,
    response.citations || [],
    agentType
  );

  // Calculate cost estimate
  // Perplexity Sonar Deep Research: ~$0.04 per search
  // Estimate 1 search for this use case
  const costEstimate = 0.04;

  return {
    research,
    rawContent: response.content,
    metadata: {
      agentType,
      model: response.model,
      durationMs,
      tokensUsed: response.usage.totalTokens,
      searchesPerformed: 1, // Deep research typically performs 1 comprehensive search
      costEstimate,
    },
  };
}

/**
 * Run all three research agents in parallel
 *
 * @param ideaDocument - The IDÉUTKAST.md content
 * @param config - Optional research configuration
 * @returns All three research results
 *
 * @throws {ProviderError} If any Perplexity API call fails
 */
export async function runAllResearchAgents(
  ideaDocument: string,
  config: ResearchConfig = {}
): Promise<{
  market: ResearchResult;
  product: ResearchResult;
  business: ResearchResult;
  totalDurationMs: number;
  totalCost: number;
}> {
  const startTime = Date.now();

  console.log('🔍 Running parallel research (Market, Product, Business)...');

  // Run all three agents in parallel
  const [market, product, business] = await Promise.all([
    runResearchAgent(ideaDocument, 'market', config),
    runResearchAgent(ideaDocument, 'product', config),
    runResearchAgent(ideaDocument, 'business', config),
  ]);

  const totalDurationMs = Date.now() - startTime;
  const totalCost =
    market.metadata.costEstimate +
    product.metadata.costEstimate +
    business.metadata.costEstimate;

  console.log(
    `✅ All research completed (${totalDurationMs}ms, $${totalCost.toFixed(4)} total cost)`
  );

  return {
    market,
    product,
    business,
    totalDurationMs,
    totalCost,
  };
}
