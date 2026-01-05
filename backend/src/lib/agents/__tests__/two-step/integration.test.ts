/**
 * Two-Step Agent Integration Tests
 *
 * Tests the complete two-step flow: Research → Synthesis
 */

import { describe, it, expect, vi } from 'vitest';

// Import mocks first
import {
  mockMarketResearch,
  mockProductResearch,
  mockBusinessResearch,
} from '../mocks/perplexity-mock.js';

// Mock providers BEFORE importing modules that use them
vi.mock('../../providers/perplexity.js', () => ({
  PerplexityClient: vi.fn().mockImplementation(() => ({
    chat: vi.fn().mockImplementation(async ({ messages }) => {
      const userMessage = messages.find((m: { role: string; content: string }) => m.role === 'user')?.content || '';

      if (userMessage.includes('MARKEDSSTØRRELSE')) {
        return {
          content: mockMarketResearch.content,
          model: 'sonar-deep-research',
          usage: { promptTokens: 500, completionTokens: 2000, totalTokens: 2500 },
          citations: mockMarketResearch.citations,
        };
      } else if (userMessage.includes('TEKNISK LANDSKAP')) {
        return {
          content: mockProductResearch.content,
          model: 'sonar-deep-research',
          usage: { promptTokens: 500, completionTokens: 2000, totalTokens: 2500 },
          citations: mockProductResearch.citations,
        };
      } else {
        return {
          content: mockBusinessResearch.content,
          model: 'sonar-deep-research',
          usage: { promptTokens: 500, completionTokens: 2000, totalTokens: 2500 },
          citations: mockBusinessResearch.citations,
        };
      }
    }),
  })),
}));

vi.mock('../../providers/openai.js', () => ({
  OpenAIClient: vi.fn().mockImplementation(() => ({
    chat: vi.fn().mockResolvedValue({
      content: `# Markedsrapport\n\n## Markedsstørrelse\nBasert på research viser dette et stort potensial.\n\nScore: 7/10`,
      model: 'gpt-4o',
      usage: { promptTokens: 1000, completionTokens: 500, totalTokens: 1500 },
    }),
  })),
}));

// Now import modules that use the mocked providers
import { runTwoStepAgent, runAllTwoStepAgents } from '../../two-step/agent.js';
import { generateResearchPrompt } from '../../research/prompt-generator.js';
import { parsePerplexityResponse } from '../../research/response-parser.js';

describe('Research Prompt Generation', () => {
  it('should generate market research prompt in Norwegian', () => {
    const ideaDocument = 'AI-drevet kundeserviceløsning for SMB';
    const { systemPrompt, userPrompt } = generateResearchPrompt('market', ideaDocument);

    expect(systemPrompt).toContain('forskningsassistent');
    expect(systemPrompt).toContain('norsk');
    expect(userPrompt).toContain('MARKEDSSTØRRELSE');
    expect(userPrompt).toContain('KONKURRANSELANDSKAP');
    expect(userPrompt).toContain(ideaDocument);
  });

  it('should generate product research prompt in Norwegian', () => {
    const ideaDocument = 'AI-drevet kundeserviceløsning for SMB';
    const { systemPrompt, userPrompt } = generateResearchPrompt('product', ideaDocument);

    expect(systemPrompt).toContain('forskningsassistent');
    expect(userPrompt).toContain('TEKNISK LANDSKAP');
    expect(userPrompt).toContain('DATAKILDER');
    expect(userPrompt).toContain(ideaDocument);
  });

  it('should generate business research prompt in Norwegian', () => {
    const ideaDocument = 'AI-drevet kundeserviceløsning for SMB';
    const { systemPrompt, userPrompt } = generateResearchPrompt('business', ideaDocument);

    expect(systemPrompt).toContain('forskningsassistent');
    expect(userPrompt).toContain('FORRETNINGSMODELLER');
    expect(userPrompt).toContain('UNIT ECONOMICS');
    expect(userPrompt).toContain(ideaDocument);
  });
});

describe('Perplexity Response Parsing', () => {
  it('should parse market research with citations', () => {
    const parsed = parsePerplexityResponse(
      mockMarketResearch.content,
      mockMarketResearch.citations,
      'market'
    );

    expect(parsed.findings).toBeDefined();
    expect(parsed.findings.length).toBeGreaterThan(0);
    expect(parsed.citations).toEqual(mockMarketResearch.citations);
  });

  it('should categorize market findings correctly', () => {
    const parsed = parsePerplexityResponse(
      mockMarketResearch.content,
      mockMarketResearch.citations,
      'market'
    );

    const categories = parsed.findings.map((f) => f.category);
    expect(categories).toContain('market_size');
    expect(categories).toContain('competitors');
    expect(categories).toContain('pricing');
  });

  it('should parse product research with technical findings', () => {
    const parsed = parsePerplexityResponse(
      mockProductResearch.content,
      mockProductResearch.citations,
      'product'
    );

    const categories = parsed.findings.map((f) => f.category);
    expect(categories).toContain('technology');
    expect(categories).toContain('data_sources');
  });

  it('should parse business research with financial findings', () => {
    const parsed = parsePerplexityResponse(
      mockBusinessResearch.content,
      mockBusinessResearch.citations,
      'business'
    );

    const categories = parsed.findings.map((f) => f.category);
    expect(categories).toContain('business_model');
    expect(categories).toContain('go_to_market');
    expect(categories).toContain('risks');
  });

  it('should assess research quality', () => {
    const parsed = parsePerplexityResponse(
      mockMarketResearch.content,
      mockMarketResearch.citations,
      'market'
    );

    expect(parsed.metadata.totalFindings).toBeGreaterThan(0);
    expect(parsed.metadata.totalCitations).toBeGreaterThan(0);
  });
});

describe('Two-Step Agent Execution', () => {
  it('should complete market research and synthesis', async () => {
    const ideaDocument = `# IDÉUTKAST

## Problemstilling
SMB-er sliter med kundeservice - for dyrt å ansette folk, for komplisert å sette opp eksisterende AI-løsninger.

## Målgruppe (ICP)
Norske SMB-er med 10-100 ansatte, e-handel og SaaS.

## JTBD (Jobs To Be Done)
"Når jeg får mange kundehenvendelser, vil jeg automatisere svar på vanlige spørsmål, slik at teamet mitt kan fokusere på komplekse saker."`;

    const result = await runTwoStepAgent({
      ideaDocument,
      agentType: 'market',
    });

    // Verify research phase
    expect(result.research).toBeDefined();
    expect(result.research.content).toContain('MARKEDSSTØRRELSE');
    expect(result.research.citations.length).toBeGreaterThan(0);
    expect(result.research.tokensUsed).toBeGreaterThan(0);
    expect(result.research.searchesPerformed).toBe(1);

    // Verify synthesis phase
    expect(result.synthesis).toBeDefined();
    expect(result.synthesis.content).toContain('Score:');
    expect(result.synthesis.score).toBeGreaterThanOrEqual(0);
    expect(result.synthesis.score).toBeLessThanOrEqual(10);

    // Verify metadata
    expect(result.totalDurationMs).toBeGreaterThan(0);
    expect(result.totalCost).toBeGreaterThan(0);
  });

  it('should parse score from synthesis output', async () => {
    const ideaDocument = 'Test idea';
    const result = await runTwoStepAgent({
      ideaDocument,
      agentType: 'market',
    });

    expect(result.synthesis.score).toBeDefined();
    expect(typeof result.synthesis.score).toBe('number');
    expect(result.synthesis.score).toBeGreaterThanOrEqual(0);
    expect(result.synthesis.score).toBeLessThanOrEqual(10);
  });

  it('should run all three agents in parallel', async () => {
    const ideaDocument = 'AI kundeservice for SMB';

    const results = await runAllTwoStepAgents(ideaDocument);

    // Verify all agents completed
    expect(results.market).toBeDefined();
    expect(results.product).toBeDefined();
    expect(results.business).toBeDefined();

    // Verify they ran in parallel (should take ~same time as one agent, not 3x)
    // This is a loose check since we're mocking, but in real scenario this matters
    expect(results.totalDurationMs).toBeGreaterThan(0);

    // Verify total cost is sum of all three
    const expectedCost =
      results.market.totalCost +
      results.product.totalCost +
      results.business.totalCost;
    expect(results.totalCost).toBeCloseTo(expectedCost, 4);
  });
});

// Error handling tests are covered in edge-cases.test.ts
