/**
 * Two-Step Agent Types
 *
 * Type definitions for the two-step architecture (research + synthesis)
 */

import type { ParsedResearch } from '../research/response-parser.js';
import type { Citation } from '../providers/types.js';

/**
 * Result from a complete two-step agent execution
 */
export interface TwoStepAgentResult {
  // Research phase
  research: {
    content: string;
    parsed: ParsedResearch;
    citations: Citation[];
    tokensUsed: number;
    searchesPerformed: number;
    durationMs: number;
  };

  // Synthesis phase
  synthesis: {
    content: string;
    score: number;
    tokensUsed: number;
    durationMs: number;
  };

  // Combined metadata
  totalDurationMs: number;
  totalCost: number;
}

/**
 * Agent types for two-step flow
 */
export type TwoStepAgentType = 'market' | 'product' | 'business';

/**
 * Configuration for two-step agent execution
 */
export interface TwoStepConfig {
  researchModel?: string;
  synthesisModel?: string;
  researchTimeout?: number;
  synthesisTimeout?: number;
}
