/**
 * Evaluation Orchestrator
 *
 * Coordinates the multi-agent evaluation process with support for both:
 * - Two-step mode: Perplexity Deep Research → GPT-5.2 Synthesis
 * - Legacy mode: Direct GPT-4o evaluation
 *
 * Flow:
 * 1. Run Market Strategist, Product Architect, Business Critic (parallel)
 * 2. Parse scores from each report
 * 3. Run Notes Synthesizer with all reports
 * 4. Parse final recommendation
 * 5. Return complete evaluation results
 */

import { runAgent } from './runner.js';
import { MARKET_STRATEGIST_PROMPT } from './prompts/market-strategist.js';
import { PRODUCT_ARCHITECT_PROMPT } from './prompts/product-architect.js';
import { BUSINESS_CRITIC_PROMPT } from './prompts/business-critic.js';
import { NOTES_SYNTHESIZER_PROMPT } from './prompts/notes-synthesizer.js';
import {
  parseScore,
  parseRecommendation,
  calculateTotalScore,
} from './utils/parse-score.js';
import { runAllTwoStepAgents } from './two-step/agent.js';
import { env } from '../../config/env.js';
import { logEvaluationCost } from '../logger.js';
import { calculateOpenAICost } from './utils/cost-calculator.js';

export interface EvaluationResult {
  // Generated reports
  market_report: string;
  prd: string;
  risk_assessment: string;
  evaluation_summary: string;

  // Scores
  score_market: number;
  score_buildability: number;
  score_business: number;
  score_total: number;

  // Recommendation
  recommendation: 'go' | 'hold' | 'reject';
}

/**
 * Evaluate an idea document using multiple AI agents
 *
 * Uses either two-step (research + synthesis) or legacy (direct GPT-4o) mode
 * based on USE_TWO_STEP_EVALUATION environment variable.
 *
 * @param ideaDocument - The structured IDÉUTKAST.md from chat conversation
 * @returns Complete evaluation with all reports, scores, and recommendation
 */
export async function evaluateIdea(
  ideaDocument: string
): Promise<EvaluationResult> {
  // Feature flag check
  if (env.USE_TWO_STEP_EVALUATION) {
    console.log('🔬 Using two-step evaluation (research + synthesis)');
    return evaluateIdeaTwoStep(ideaDocument);
  } else {
    console.log('📝 Using legacy evaluation (direct GPT-4o)');
    return evaluateIdeaLegacy(ideaDocument);
  }
}

/**
 * Two-step evaluation: Perplexity Deep Research → GPT-5.2 Synthesis
 */
async function evaluateIdeaTwoStep(
  ideaDocument: string
): Promise<EvaluationResult> {
  console.log('🚀 Starting two-step idea evaluation...');

  // Step 1: Run all three two-step agents in parallel
  const { market, product, business, totalDurationMs, totalCost } =
    await runAllTwoStepAgents(ideaDocument);

  console.log(
    `📊 Research & synthesis complete (${totalDurationMs}ms, $${totalCost.toFixed(4)})`
  );
  console.log(`  - Market score: ${market.synthesis.score}/10`);
  console.log(`  - Buildability score: ${product.synthesis.score}/10`);
  console.log(`  - Business score: ${business.synthesis.score}/10`);

  const totalScore = calculateTotalScore(
    market.synthesis.score,
    product.synthesis.score,
    business.synthesis.score
  );
  console.log(`📈 Total score: ${totalScore}/10`);

  // Step 2: Run Notes Synthesizer (unchanged - still uses GPT)
  console.log('🧠 Synthesizing evaluation with Notes Synthesizer...');

  const synthesisInput = `
# Idéutkast
${ideaDocument}

---

# Markedsrapport (Score: ${market.synthesis.score}/10)
${market.synthesis.content}

---

# PRD - Product Requirements Document (Score: ${product.synthesis.score}/10)
${product.synthesis.content}

---

# Risikovurdering (Score: ${business.synthesis.score}/10)
${business.synthesis.content}
`;

  const synthesisResponse = await runAgent({
    systemPrompt: NOTES_SYNTHESIZER_PROMPT,
    userMessage: synthesisInput,
    model: env.SYNTHESIS_MODEL || 'gpt-4o',
    temperature: 0.7,
    maxTokens: 2500,
    agentName: 'Notes Synthesizer',
  });

  console.log('✅ Synthesis completed');

  // Step 3: Parse recommendation
  console.log('🎯 Parsing final recommendation...');

  const recommendation = parseRecommendation(synthesisResponse.content);
  const recommendationLabel =
    recommendation === 'go'
      ? 'GÅ VIDERE'
      : recommendation === 'hold'
        ? 'AVVENT'
        : 'FORKAST';
  console.log(`  - Recommendation: ${recommendationLabel}`);

  // Calculate and log total evaluation cost
  const notesSynthesizerCost = calculateOpenAICost(
    synthesisResponse.tokensUsed,
    env.SYNTHESIS_MODEL || 'gpt-4o'
  );
  const finalTotalCost = totalCost + notesSynthesizerCost;

  // Breakdown: totalCost already includes research + synthesis for all 3 agents
  const researchCost =
    (market.research.searchesPerformed * 0.04) +
    (product.research.searchesPerformed * 0.04) +
    (business.research.searchesPerformed * 0.04);
  const synthesisCost = finalTotalCost - researchCost;

  logEvaluationCost({
    researchCost,
    synthesisCost,
    totalCost: finalTotalCost,
    breakdown: {
      market: market.totalCost,
      product: product.totalCost,
      business: business.totalCost,
    },
  });

  console.log('✅ Two-step evaluation complete!');

  return {
    market_report: market.synthesis.content,
    prd: product.synthesis.content,
    risk_assessment: business.synthesis.content,
    evaluation_summary: synthesisResponse.content,
    score_market: market.synthesis.score,
    score_buildability: product.synthesis.score,
    score_business: business.synthesis.score,
    score_total: totalScore,
    recommendation,
  };
}

/**
 * Legacy evaluation: Direct GPT-4o (no research phase)
 */
async function evaluateIdeaLegacy(
  ideaDocument: string
): Promise<EvaluationResult> {
  console.log('🚀 Starting idea evaluation...');

  // Step 1: Run 3 parallel agents
  console.log('📊 Running parallel evaluations (Market, Product, Business)...');

  const [marketResponse, productResponse, businessResponse] =
    await Promise.all([
      runAgent({
        systemPrompt: MARKET_STRATEGIST_PROMPT,
        userMessage: ideaDocument,
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 3000,
        agentName: 'Market Strategist',
      }),
      runAgent({
        systemPrompt: PRODUCT_ARCHITECT_PROMPT,
        userMessage: ideaDocument,
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 3000,
        agentName: 'Product Architect',
      }),
      runAgent({
        systemPrompt: BUSINESS_CRITIC_PROMPT,
        userMessage: ideaDocument,
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 3000,
        agentName: 'Business Critic',
      }),
    ]);

  const marketReport = marketResponse.content;
  const prd = productResponse.content;
  const riskAssessment = businessResponse.content;

  console.log('✅ Parallel evaluations completed');

  // Step 2: Parse scores from each report
  console.log('🔢 Parsing scores from reports...');

  let marketScore: number;
  let buildabilityScore: number;
  let businessScore: number;

  try {
    marketScore = parseScore(marketReport);
    console.log(`  - Market score: ${marketScore}/10`);
  } catch (error) {
    console.error('Failed to parse market score:', error);
    throw new Error(
      `Market Strategist did not provide valid score: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  try {
    buildabilityScore = parseScore(prd);
    console.log(`  - Buildability score: ${buildabilityScore}/10`);
  } catch (error) {
    console.error('Failed to parse buildability score:', error);
    throw new Error(
      `Product Architect did not provide valid score: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  try {
    businessScore = parseScore(riskAssessment);
    console.log(`  - Business score: ${businessScore}/10`);
  } catch (error) {
    console.error('Failed to parse business score:', error);
    throw new Error(
      `Business Critic did not provide valid score: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  const totalScore = calculateTotalScore(
    marketScore,
    buildabilityScore,
    businessScore
  );
  console.log(`📈 Total score: ${totalScore}/10`);

  // Step 3: Synthesize all reports
  console.log('🧠 Synthesizing evaluation with Notes Synthesizer...');

  const synthesisInput = `
# Idéutkast
${ideaDocument}

---

# Markedsrapport (Score: ${marketScore}/10)
${marketReport}

---

# PRD - Product Requirements Document (Score: ${buildabilityScore}/10)
${prd}

---

# Risikovurdering (Score: ${businessScore}/10)
${riskAssessment}
`;

  const synthesisResponse = await runAgent({
    systemPrompt: NOTES_SYNTHESIZER_PROMPT,
    userMessage: synthesisInput,
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 2500,
    agentName: 'Notes Synthesizer',
  });

  const evaluationSummary = synthesisResponse.content;

  console.log('✅ Synthesis completed');

  // Step 4: Parse recommendation
  console.log('🎯 Parsing final recommendation...');

  let recommendation: 'go' | 'hold' | 'reject';

  try {
    recommendation = parseRecommendation(evaluationSummary);
    const recommendationLabel =
      recommendation === 'go'
        ? 'GÅ VIDERE'
        : recommendation === 'hold'
          ? 'AVVENT'
          : 'FORKAST';
    console.log(`  - Recommendation: ${recommendationLabel}`);
  } catch (error) {
    console.error('Failed to parse recommendation:', error);
    throw new Error(
      `Notes Synthesizer did not provide valid recommendation: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  console.log('✅ Evaluation complete!');

  // Return complete results
  return {
    market_report: marketReport,
    prd,
    risk_assessment: riskAssessment,
    evaluation_summary: evaluationSummary,
    score_market: marketScore,
    score_buildability: buildabilityScore,
    score_business: businessScore,
    score_total: totalScore,
    recommendation,
  };
}
