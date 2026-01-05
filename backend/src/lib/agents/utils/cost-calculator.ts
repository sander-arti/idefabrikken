/**
 * Cost Calculator
 *
 * Calculates costs for AI API calls (Perplexity and OpenAI)
 */

/**
 * Cost breakdown for an evaluation
 */
export interface EvaluationCostBreakdown {
  research: {
    marketCost: number;
    productCost: number;
    businessCost: number;
    totalCost: number;
  };
  synthesis: {
    marketCost: number;
    productCost: number;
    businessCost: number;
    notesSynthesizerCost: number;
    totalCost: number;
  };
  totalCost: number;
}

/**
 * Evaluation metrics for cost calculation
 */
export interface EvaluationMetrics {
  research?: {
    marketSearches: number;
    productSearches: number;
    businessSearches: number;
  };
  synthesis?: {
    marketTokens: number;
    productTokens: number;
    businessTokens: number;
    notesSynthesizerTokens: number;
    model: string;
  };
}

/**
 * Calculate Perplexity API cost
 *
 * Pricing: Sonar Deep Research ~$0.04 per search
 *
 * @param searches - Number of searches performed
 * @returns Cost in USD
 */
export function calculatePerplexityCost(searches: number): number {
  const COST_PER_SEARCH = 0.04;
  return searches * COST_PER_SEARCH;
}

/**
 * Calculate OpenAI API cost
 *
 * Pricing (as of 2024):
 * - GPT-4o: $2.50 per 1M input tokens, $10 per 1M output tokens
 * - GPT-4o-mini: $0.15 per 1M input tokens, $0.60 per 1M output tokens
 *
 * Simplified: Assume 50/50 split between input/output
 *
 * @param tokens - Total tokens used
 * @param model - Model name (e.g., 'gpt-4o', 'gpt-4o-mini')
 * @returns Cost in USD
 */
export function calculateOpenAICost(tokens: number, model: string): number {
  // Detect model type
  const modelLower = model.toLowerCase();

  let inputPricePerMillion: number;
  let outputPricePerMillion: number;

  if (modelLower.includes('gpt-4o-mini')) {
    inputPricePerMillion = 0.15;
    outputPricePerMillion = 0.6;
  } else if (modelLower.includes('gpt-4o')) {
    inputPricePerMillion = 2.5;
    outputPricePerMillion = 10.0;
  } else if (modelLower.includes('gpt-5')) {
    // GPT-5.2 pricing (estimated - adjust when actual pricing is available)
    inputPricePerMillion = 3.0;
    outputPricePerMillion = 12.0;
  } else {
    // Default to GPT-4o pricing
    inputPricePerMillion = 2.5;
    outputPricePerMillion = 10.0;
  }

  // Assume 50/50 split between input and output tokens
  const avgPricePerMillion = (inputPricePerMillion + outputPricePerMillion) / 2;
  const costUSD = (tokens / 1_000_000) * avgPricePerMillion;

  return costUSD;
}

/**
 * Calculate total evaluation cost from metrics
 *
 * @param metrics - Evaluation metrics
 * @returns Detailed cost breakdown
 */
export function calculateEvaluationCost(
  metrics: EvaluationMetrics
): EvaluationCostBreakdown {
  const breakdown: EvaluationCostBreakdown = {
    research: {
      marketCost: 0,
      productCost: 0,
      businessCost: 0,
      totalCost: 0,
    },
    synthesis: {
      marketCost: 0,
      productCost: 0,
      businessCost: 0,
      notesSynthesizerCost: 0,
      totalCost: 0,
    },
    totalCost: 0,
  };

  // Calculate research costs (Perplexity)
  if (metrics.research) {
    breakdown.research.marketCost = calculatePerplexityCost(
      metrics.research.marketSearches
    );
    breakdown.research.productCost = calculatePerplexityCost(
      metrics.research.productSearches
    );
    breakdown.research.businessCost = calculatePerplexityCost(
      metrics.research.businessSearches
    );
    breakdown.research.totalCost =
      breakdown.research.marketCost +
      breakdown.research.productCost +
      breakdown.research.businessCost;
  }

  // Calculate synthesis costs (OpenAI)
  if (metrics.synthesis) {
    const model = metrics.synthesis.model;

    breakdown.synthesis.marketCost = calculateOpenAICost(
      metrics.synthesis.marketTokens,
      model
    );
    breakdown.synthesis.productCost = calculateOpenAICost(
      metrics.synthesis.productTokens,
      model
    );
    breakdown.synthesis.businessCost = calculateOpenAICost(
      metrics.synthesis.businessTokens,
      model
    );
    breakdown.synthesis.notesSynthesizerCost = calculateOpenAICost(
      metrics.synthesis.notesSynthesizerTokens,
      model
    );
    breakdown.synthesis.totalCost =
      breakdown.synthesis.marketCost +
      breakdown.synthesis.productCost +
      breakdown.synthesis.businessCost +
      breakdown.synthesis.notesSynthesizerCost;
  }

  // Total cost
  breakdown.totalCost =
    breakdown.research.totalCost + breakdown.synthesis.totalCost;

  return breakdown;
}

/**
 * Format cost as string with 4 decimal places
 *
 * @param cost - Cost in USD
 * @returns Formatted string (e.g., "$0.0420")
 */
export function formatCost(cost: number): string {
  return `$${cost.toFixed(4)}`;
}

/**
 * Calculate cost per evaluation based on average metrics
 *
 * Assumes:
 * - 3 research agents × 1 search each = 3 searches
 * - 3 synthesis agents × 2500 tokens each = 7500 tokens
 * - 1 notes synthesizer × 2000 tokens = 2000 tokens
 * - Total: 9500 tokens for synthesis
 *
 * @param model - Model used for synthesis
 * @returns Estimated cost per evaluation
 */
export function estimateCostPerEvaluation(model: string = 'gpt-4o'): number {
  const researchCost = calculatePerplexityCost(3); // 3 searches
  const synthesisCost = calculateOpenAICost(9500, model); // ~9500 tokens
  return researchCost + synthesisCost;
}
