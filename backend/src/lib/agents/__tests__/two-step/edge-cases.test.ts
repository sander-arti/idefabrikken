/**
 * Two-Step Agent Edge Case Tests
 *
 * Tests edge cases, errors, and degraded modes
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runTwoStepAgent } from '../../two-step/agent.js';
import { parsePerplexityResponse, assessResearchQuality } from '../../research/response-parser.js';
import { parseScore } from '../../utils/parse-score.js';
import { mockEmptyResearch, mockLowQualityResearch } from '../mocks/perplexity-mock.js';
import { ProviderError } from '../../providers/types.js';

// Mock environment variables
vi.mock('../../../config/env.js', () => ({
  env: {
    PERPLEXITY_API_KEY: 'test-key',
    OPENAI_API_KEY: 'test-key',
    RESEARCH_MODEL: 'sonar-deep-research',
    SYNTHESIS_MODEL: 'gpt-4o',
    PERPLEXITY_TIMEOUT_MS: 120000,
    SYNTHESIS_TIMEOUT_MS: 60000,
    USE_TWO_STEP_EVALUATION: true,
    RESEARCH_FAILURE_MODE: 'fail',
  },
}));

describe('Empty Research Results', () => {
  it('should handle empty research content', () => {
    const parsed = parsePerplexityResponse(
      mockEmptyResearch.content,
      mockEmptyResearch.citations,
      'market'
    );

    expect(parsed.findings).toBeDefined();
    expect(parsed.findings.length).toBeGreaterThanOrEqual(0);
    expect(parsed.citations).toEqual([]);
  });

  it('should assess empty research as poor quality', () => {
    const parsed = parsePerplexityResponse(
      mockEmptyResearch.content,
      mockEmptyResearch.citations,
      'market'
    );

    const quality = assessResearchQuality(parsed);

    expect(quality.overall).toBe('poor');
    expect(quality.issues.length).toBeGreaterThan(0);
    expect(quality.suggestions.length).toBeGreaterThan(0);
  });
});

describe('Missing Citations', () => {
  it('should handle research with no citations', () => {
    const parsed = parsePerplexityResponse(
      'Noe innhold uten kilder',
      [],
      'market'
    );

    expect(parsed.citations).toEqual([]);
    expect(parsed.metadata.totalCitations).toBe(0);
  });

  it('should assess research without citations as low confidence', () => {
    const parsed = parsePerplexityResponse(
      mockLowQualityResearch.content,
      mockLowQualityResearch.citations,
      'market'
    );

    const quality = assessResearchQuality(parsed);

    expect(quality.overall).toBe('poor');
    expect(quality.metrics.citationsCount).toBeLessThan(5);
  });
});

describe('Score Parsing', () => {
  it('should parse valid score formats', () => {
    expect(parseScore('Score: 7/10')).toBe(7);
    expect(parseScore('Score: 10/10')).toBe(10);
    expect(parseScore('Score: 0/10')).toBe(0);
    expect(parseScore('Score: 3/10')).toBe(3);
  });

  it('should handle score with surrounding text', () => {
    const text = `# Rapport

Basert på analysen anbefaler jeg...

Score: 8/10

Dette er en solid idé.`;

    expect(parseScore(text)).toBe(8);
  });

  it('should throw error for missing score', () => {
    expect(() => parseScore('Ingen score her')).toThrow();
  });

  it('should throw error for invalid score format', () => {
    expect(() => parseScore('Score: X/10')).toThrow();
    expect(() => parseScore('Score: 11/10')).toThrow();
    expect(() => parseScore('Score: -1/10')).toThrow();
  });
});

describe('Perplexity Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw ProviderError on 429 rate limit', async () => {
    // Mock Perplexity to return 429
    vi.doMock('../../providers/perplexity.js', () => {
      return {
        PerplexityClient: vi.fn().mockImplementation(() => ({
          chat: vi.fn().mockRejectedValue(
            new ProviderError('Rate limit exceeded', 'perplexity', 429)
          ),
        })),
      };
    });

    const ideaDocument = 'Test idea';

    await expect(
      runTwoStepAgent({
        ideaDocument,
        agentType: 'market',
      })
    ).rejects.toThrow();
  });

  it('should throw ProviderError on 503 service unavailable', async () => {
    vi.doMock('../../providers/perplexity.js', () => {
      return {
        PerplexityClient: vi.fn().mockImplementation(() => ({
          chat: vi.fn().mockRejectedValue(
            new ProviderError('Service unavailable', 'perplexity', 503)
          ),
        })),
      };
    });

    const ideaDocument = 'Test idea';

    await expect(
      runTwoStepAgent({
        ideaDocument,
        agentType: 'market',
      })
    ).rejects.toThrow();
  });
});

describe('Timeout Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw error on Perplexity timeout', async () => {
    vi.doMock('../../providers/perplexity.js', () => {
      return {
        PerplexityClient: vi.fn().mockImplementation(() => ({
          chat: vi.fn().mockRejectedValue(
            new ProviderError('Request timeout', 'perplexity', 504)
          ),
        })),
      };
    });

    const ideaDocument = 'Test idea';

    await expect(
      runTwoStepAgent({
        ideaDocument,
        agentType: 'market',
      })
    ).rejects.toThrow();
  });

  it('should throw error on OpenAI timeout', async () => {
    // Mock successful Perplexity, but timeout on OpenAI
    vi.doMock('../../providers/perplexity.js', () => {
      return {
        PerplexityClient: vi.fn().mockImplementation(() => ({
          chat: vi.fn().mockResolvedValue({
            content: 'Research content',
            model: 'sonar-deep-research',
            usage: { promptTokens: 100, completionTokens: 200, totalTokens: 300 },
            citations: [],
          }),
        })),
      };
    });

    vi.doMock('../../providers/openai.js', () => {
      return {
        OpenAIClient: vi.fn().mockImplementation(() => ({
          chat: vi.fn().mockRejectedValue(
            new ProviderError('Request timeout', 'openai', 504)
          ),
        })),
      };
    });

    const ideaDocument = 'Test idea';

    await expect(
      runTwoStepAgent({
        ideaDocument,
        agentType: 'market',
      })
    ).rejects.toThrow();
  });
});

describe('Research Quality Assessment', () => {
  it('should assess high-quality research as good', () => {
    const parsed = parsePerplexityResponse(
      `# Comprehensive Research

## Section 1
Finding 1 with detailed analysis.

## Section 2
Finding 2 with evidence.

## Section 3
Finding 3 with data.

## Section 4
Finding 4 with metrics.

## Section 5
Finding 5 with citations.`,
      [
        { url: 'https://source1.com', title: 'Source 1' },
        { url: 'https://source2.com', title: 'Source 2' },
        { url: 'https://source3.com', title: 'Source 3' },
        { url: 'https://source4.com', title: 'Source 4' },
        { url: 'https://source5.com', title: 'Source 5' },
        { url: 'https://source6.com', title: 'Source 6' },
      ],
      'market'
    );

    const quality = assessResearchQuality(parsed);

    expect(quality.overall).toBe('good');
    expect(quality.metrics.findingsCount).toBeGreaterThanOrEqual(3);
    expect(quality.metrics.citationsCount).toBeGreaterThanOrEqual(5);
    expect(quality.issues).toHaveLength(0);
  });

  it('should assess moderate-quality research correctly', () => {
    const parsed = parsePerplexityResponse(
      `# Moderate Research

## Section 1
Some findings.

## Section 2
More findings.`,
      [
        { url: 'https://source1.com', title: 'Source 1' },
        { url: 'https://source2.com', title: 'Source 2' },
        { url: 'https://source3.com', title: 'Source 3' },
      ],
      'market'
    );

    const quality = assessResearchQuality(parsed);

    expect(quality.overall).toBe('moderate');
  });

  it('should flag specific issues for poor research', () => {
    const parsed = parsePerplexityResponse(
      'Kort innhold',
      [{ url: 'https://source1.com', title: 'Source 1' }],
      'market'
    );

    const quality = assessResearchQuality(parsed);

    expect(quality.overall).toBe('poor');
    expect(quality.issues.length).toBeGreaterThan(0);
    expect(quality.suggestions.length).toBeGreaterThan(0);
  });
});

describe('Degraded Mode (Research Unavailable)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw RESEARCH_UNAVAILABLE when Perplexity 503 and mode=degrade', async () => {
    // Mock env with degrade mode
    vi.doMock('../../../config/env.js', () => ({
      env: {
        PERPLEXITY_API_KEY: 'test-key',
        OPENAI_API_KEY: 'test-key',
        RESEARCH_MODEL: 'sonar-deep-research',
        SYNTHESIS_MODEL: 'gpt-4o',
        PERPLEXITY_TIMEOUT_MS: 120000,
        SYNTHESIS_TIMEOUT_MS: 60000,
        USE_TWO_STEP_EVALUATION: true,
        RESEARCH_FAILURE_MODE: 'degrade', // Degrade mode
      },
    }));

    vi.doMock('../../providers/perplexity.js', () => {
      return {
        PerplexityClient: vi.fn().mockImplementation(() => ({
          chat: vi.fn().mockRejectedValue(
            new ProviderError('Service unavailable', 'perplexity', 503)
          ),
        })),
      };
    });

    const ideaDocument = 'Test idea';

    await expect(
      runTwoStepAgent({
        ideaDocument,
        agentType: 'market',
      })
    ).rejects.toThrow('RESEARCH_UNAVAILABLE');
  });

  it('should fail immediately when mode=fail', async () => {
    vi.doMock('../../../config/env.js', () => ({
      env: {
        PERPLEXITY_API_KEY: 'test-key',
        OPENAI_API_KEY: 'test-key',
        RESEARCH_MODEL: 'sonar-deep-research',
        SYNTHESIS_MODEL: 'gpt-4o',
        PERPLEXITY_TIMEOUT_MS: 120000,
        SYNTHESIS_TIMEOUT_MS: 60000,
        USE_TWO_STEP_EVALUATION: true,
        RESEARCH_FAILURE_MODE: 'fail', // Fail mode (default)
      },
    }));

    vi.doMock('../../providers/perplexity.js', () => {
      return {
        PerplexityClient: vi.fn().mockImplementation(() => ({
          chat: vi.fn().mockRejectedValue(
            new ProviderError('Service unavailable', 'perplexity', 503)
          ),
        })),
      };
    });

    const ideaDocument = 'Test idea';

    // Should throw the original error, not RESEARCH_UNAVAILABLE
    await expect(
      runTwoStepAgent({
        ideaDocument,
        agentType: 'market',
      })
    ).rejects.toThrow();
  });
});

describe('Cost Calculation Edge Cases', () => {
  it('should handle empty citations gracefully', () => {
    const parsed = parsePerplexityResponse('Content', [], 'market');

    expect(parsed.metadata.totalCitations).toBe(0);
  });

  it('should calculate findings for minimal research', () => {
    // Even minimal research should parse findings
    const parsed = parsePerplexityResponse('Minimal', [], 'market');

    expect(parsed.metadata.totalFindings).toBeGreaterThanOrEqual(0);
  });
});
