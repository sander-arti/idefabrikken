/**
 * Two-Step Agent
 *
 * Combines research and synthesis phases for comprehensive idea evaluation.
 * Step 1: Perplexity Deep Research
 * Step 2: GPT-5.2 Synthesis
 */

import { runResearchAgent } from '../research/runner.js';
import { runSynthesisAgent } from '../synthesis/runner.js';
import { assessResearchQuality } from '../research/response-parser.js';
import { env } from '../../../config/env.js';
import { logResearchQuality, logProviderError } from '../../logger.js';
import { ProviderError } from '../providers/types.js';
import type { TwoStepAgentResult, TwoStepAgentType, TwoStepConfig } from './types.js';

/**
 * Run a complete two-step agent (research + synthesis)
 *
 * @param options - Agent options
 * @returns Complete two-step result with research and synthesis
 *
 * @throws {ProviderError} If Perplexity or OpenAI fails
 * @throws {Error} If research quality is too low (when configured)
 */
export async function runTwoStepAgent(options: {
  ideaDocument: string;
  agentType: TwoStepAgentType;
  config?: TwoStepConfig;
}): Promise<TwoStepAgentResult> {
  const { ideaDocument, agentType, config = {} } = options;
  const startTime = Date.now();

  console.log(`\n🚀 Starting two-step ${agentType} agent...`);

  // Step 1: Research
  console.log(`📊 Step 1/2: Deep Research (Perplexity)`);

  let researchResult;
  try {
    researchResult = await runResearchAgent(ideaDocument, agentType, {
      model: config.researchModel,
      timeout: config.researchTimeout,
    });
  } catch (error) {
    // Log error with full context
    logProviderError('perplexity', error, {
      agent: agentType,
    });

    console.error(`❌ Research failed for ${agentType} agent:`, error);

    // Check if Perplexity is unavailable and we should degrade
    const isPerplexityUnavailable =
      error instanceof ProviderError &&
      error.provider === 'perplexity' &&
      (error.statusCode === 503 || error.statusCode === 504);

    if (isPerplexityUnavailable && env.RESEARCH_FAILURE_MODE === 'degrade') {
      console.warn(
        `⚠️  Perplexity unavailable for ${agentType} agent. RESEARCH_FAILURE_MODE=degrade requires fallback to legacy mode (to be handled at orchestration level).`
      );
      // Re-throw with specific error that orchestrator can catch
      throw new Error(
        `RESEARCH_UNAVAILABLE: Perplexity service unavailable for ${agentType}`
      );
    }

    throw error;
  }

  // Assess research quality
  const quality = assessResearchQuality(researchResult.research);
  console.log(
    `  - Research quality: ${quality.overall} (${quality.metrics.findingsCount} findings, ${quality.metrics.citationsCount} citations)`
  );

  // Log research quality to structured logs
  logResearchQuality({
    agent: agentType,
    overall: quality.overall,
    findingsCount: quality.metrics.findingsCount,
    citationsCount: quality.metrics.citationsCount,
    coverageScore: quality.metrics.coverageScore,
    issues: quality.issues.length > 0 ? quality.issues : undefined,
    suggestions: quality.suggestions.length > 0 ? quality.suggestions : undefined,
  });

  if (quality.issues.length > 0) {
    console.warn(`  - Issues: ${quality.issues.join(', ')}`);
  }

  // If quality is poor and we're in fail mode, throw error
  if (quality.overall === 'poor' && env.RESEARCH_FAILURE_MODE === 'fail') {
    throw new Error(
      `Poor research quality for ${agentType} agent: ${quality.issues.join(', ')}`
    );
  }

  // Step 2: Synthesis
  console.log(`🧠 Step 2/2: Synthesis (GPT-5.2)`);

  const synthesisResult = await runSynthesisAgent({
    ideaDocument,
    researchData: researchResult.research,
    agentType,
    config: {
      model: config.synthesisModel,
      timeout: config.synthesisTimeout,
    },
  });

  const totalDurationMs = Date.now() - startTime;
  const totalCost =
    researchResult.metadata.costEstimate + synthesisResult.metadata.costEstimate;

  console.log(
    `✅ Two-step ${agentType} agent completed (${totalDurationMs}ms, $${totalCost.toFixed(4)})`
  );

  return {
    research: {
      content: researchResult.rawContent,
      parsed: researchResult.research,
      citations: researchResult.research.citations,
      tokensUsed: researchResult.metadata.tokensUsed,
      searchesPerformed: researchResult.metadata.searchesPerformed || 1,
      durationMs: researchResult.metadata.durationMs,
    },
    synthesis: {
      content: synthesisResult.content,
      score: synthesisResult.score,
      tokensUsed: synthesisResult.metadata.tokensUsed,
      durationMs: synthesisResult.metadata.durationMs,
    },
    totalDurationMs,
    totalCost,
  };
}

/**
 * Run all three two-step agents in parallel
 *
 * @param ideaDocument - The IDÉUTKAST.md content
 * @param config - Optional configuration
 * @returns All three two-step results
 */
export async function runAllTwoStepAgents(
  ideaDocument: string,
  config?: TwoStepConfig
): Promise<{
  market: TwoStepAgentResult;
  product: TwoStepAgentResult;
  business: TwoStepAgentResult;
  totalDurationMs: number;
  totalCost: number;
}> {
  const startTime = Date.now();

  console.log('\n🚀 Starting parallel two-step evaluation...');

  // Run all three agents in parallel
  const [market, product, business] = await Promise.all([
    runTwoStepAgent({ ideaDocument, agentType: 'market', config }),
    runTwoStepAgent({ ideaDocument, agentType: 'product', config }),
    runTwoStepAgent({ ideaDocument, agentType: 'business', config }),
  ]);

  const totalDurationMs = Date.now() - startTime;
  const totalCost = market.totalCost + product.totalCost + business.totalCost;

  console.log(
    `\n✅ All two-step agents completed (${totalDurationMs}ms, $${totalCost.toFixed(4)})`
  );

  return {
    market,
    product,
    business,
    totalDurationMs,
    totalCost,
  };
}
