/**
 * Research Response Parser
 *
 * Parses and structures research data from Perplexity Deep Research responses.
 * Extracts findings, categorizes them, and validates citations.
 */

import { Citation } from '../providers/types.js';

/**
 * Structured research data ready for synthesis
 */
export interface ParsedResearch {
  findings: ResearchFinding[];
  citations: Citation[];
  metadata: {
    totalFindings: number;
    totalCitations: number;
    coverage: ResearchCoverage;
  };
}

/**
 * Individual research finding with category and supporting citations
 */
export interface ResearchFinding {
  category: FindingCategory;
  content: string;
  citations: Citation[];
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Finding categories for different agent types
 */
export type FindingCategory =
  // Market research categories
  | 'market_size'
  | 'competitors'
  | 'trends'
  | 'target_audience'
  | 'pricing'
  // Product research categories
  | 'technology'
  | 'data_sources'
  | 'similar_products'
  | 'integrations'
  // Business research categories
  | 'business_model'
  | 'go_to_market'
  | 'risks'
  | 'scaling'
  // General
  | 'other';

/**
 * Coverage assessment of research areas
 */
export interface ResearchCoverage {
  categoriesCovered: FindingCategory[];
  missingCategories: FindingCategory[];
  overall: 'comprehensive' | 'partial' | 'limited';
}

/**
 * Quality assessment of research results
 */
export interface ResearchQualityAssessment {
  overall: 'good' | 'moderate' | 'poor';
  issues: string[];
  suggestions: string[];
  metrics: {
    findingsCount: number;
    citationsCount: number;
    averageCitationsPerFinding: number;
    coverageScore: number; // 0-100
  };
}

/**
 * Parse Perplexity research response into structured data
 */
export function parsePerplexityResponse(
  content: string,
  citations: Citation[],
  agentType: 'market' | 'product' | 'business'
): ParsedResearch {
  // Extract sections from markdown content
  const sections = extractSections(content);

  // Map sections to findings with categories
  const findings = sections.map((section) =>
    categorizeFinding(section, citations, agentType)
  );

  // Assess coverage
  const coverage = assessCoverage(findings, agentType);

  return {
    findings,
    citations,
    metadata: {
      totalFindings: findings.length,
      totalCitations: citations.length,
      coverage,
    },
  };
}

/**
 * Extract structured sections from markdown content
 */
function extractSections(content: string): Section[] {
  const sections: Section[] = [];

  // Split by markdown headers (## or ###)
  const headerRegex = /^(#{2,3})\s+(.+)$/gm;
  const parts = content.split(headerRegex);

  // Process header/content pairs
  for (let i = 1; i < parts.length; i += 3) {
    const level = parts[i].length; // Number of # symbols
    const title = parts[i + 1].trim();
    const body = parts[i + 2]?.trim() || '';

    if (body) {
      sections.push({
        level,
        title,
        content: body,
      });
    }
  }

  return sections;
}

/**
 * Section extracted from markdown
 */
interface Section {
  level: number;
  title: string;
  content: string;
}

/**
 * Categorize a finding based on section title and agent type
 */
function categorizeFinding(
  section: Section,
  allCitations: Citation[],
  agentType: 'market' | 'product' | 'business'
): ResearchFinding {
  const category = inferCategory(section.title, agentType);
  const sectionCitations = extractSectionCitations(section.content, allCitations);
  const confidence = assessConfidence(section.content, sectionCitations);

  return {
    category,
    content: section.content,
    citations: sectionCitations,
    confidence,
  };
}

/**
 * Infer category from section title
 */
function inferCategory(
  title: string,
  agentType: 'market' | 'product' | 'business'
): FindingCategory {
  const titleLower = title.toLowerCase();

  // Market categories
  if (agentType === 'market') {
    if (titleLower.includes('marked') || titleLower.includes('market')) {
      return 'market_size';
    }
    if (titleLower.includes('konkurrent') || titleLower.includes('competitor')) {
      return 'competitors';
    }
    if (titleLower.includes('trend')) {
      return 'trends';
    }
    if (titleLower.includes('målgruppe') || titleLower.includes('target')) {
      return 'target_audience';
    }
    if (titleLower.includes('pris') || titleLower.includes('pricing')) {
      return 'pricing';
    }
  }

  // Product categories
  if (agentType === 'product') {
    if (titleLower.includes('teknologi') || titleLower.includes('technology') || titleLower.includes('tech')) {
      return 'technology';
    }
    if (titleLower.includes('data') || titleLower.includes('api')) {
      return 'data_sources';
    }
    if (titleLower.includes('lignende') || titleLower.includes('similar') || titleLower.includes('eksempel')) {
      return 'similar_products';
    }
    if (titleLower.includes('integra')) {
      return 'integrations';
    }
  }

  // Business categories
  if (agentType === 'business') {
    if (titleLower.includes('forretning') || titleLower.includes('business') || titleLower.includes('modell')) {
      return 'business_model';
    }
    if (titleLower.includes('salg') || titleLower.includes('go-to-market') || titleLower.includes('gtm') || titleLower.includes('distribusjon')) {
      return 'go_to_market';
    }
    if (titleLower.includes('risiko') || titleLower.includes('risk')) {
      return 'risks';
    }
    if (titleLower.includes('skaler') || titleLower.includes('scaling') || titleLower.includes('vekst')) {
      return 'scaling';
    }
  }

  return 'other';
}

/**
 * Extract citations referenced in section content
 */
function extractSectionCitations(
  content: string,
  allCitations: Citation[]
): Citation[] {
  const sectionCitations: Citation[] = [];

  // Look for citation markers like [1], [2], etc.
  const citationMarkers = content.match(/\[(\d+)\]/g);
  if (citationMarkers) {
    const indices = citationMarkers.map((marker) =>
      parseInt(marker.replace(/\[|\]/g, ''), 10)
    );

    indices.forEach((index) => {
      if (allCitations[index - 1]) {
        sectionCitations.push(allCitations[index - 1]);
      }
    });
  }

  // Also look for inline URLs
  const urlRegex = /https?:\/\/[^\s\)]+/g;
  const urls = content.match(urlRegex);
  if (urls) {
    urls.forEach((url) => {
      const citation = allCitations.find((c) => c.url === url);
      if (citation && !sectionCitations.includes(citation)) {
        sectionCitations.push(citation);
      }
    });
  }

  return sectionCitations;
}

/**
 * Assess confidence level based on content and citations
 */
function assessConfidence(
  content: string,
  citations: Citation[]
): 'high' | 'medium' | 'low' {
  // High confidence: multiple citations, concrete numbers/data
  if (citations.length >= 2 && /\d+/.test(content)) {
    return 'high';
  }

  // Medium confidence: at least one citation
  if (citations.length >= 1) {
    return 'medium';
  }

  // Low confidence: no citations or vague language
  return 'low';
}

/**
 * Assess coverage of research areas
 */
function assessCoverage(
  findings: ResearchFinding[],
  agentType: 'market' | 'product' | 'business'
): ResearchCoverage {
  const categoriesCovered = [...new Set(findings.map((f) => f.category))];

  const expectedCategories: FindingCategory[] =
    agentType === 'market'
      ? ['market_size', 'competitors', 'trends', 'target_audience', 'pricing']
      : agentType === 'product'
        ? ['technology', 'data_sources', 'similar_products', 'integrations']
        : ['business_model', 'go_to_market', 'risks', 'scaling'];

  const missingCategories = expectedCategories.filter(
    (cat) => !categoriesCovered.includes(cat)
  );

  const coverageRatio = categoriesCovered.length / expectedCategories.length;

  const overall =
    coverageRatio >= 0.8
      ? 'comprehensive'
      : coverageRatio >= 0.5
        ? 'partial'
        : 'limited';

  return {
    categoriesCovered,
    missingCategories,
    overall,
  };
}

/**
 * Assess overall quality of research results
 */
export function assessResearchQuality(
  research: ParsedResearch
): ResearchQualityAssessment {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check findings count
  if (research.findings.length < 3) {
    issues.push('Få funn (< 3 seksjoner)');
    suggestions.push('Forsøk mer detaljerte søkeord eller bredere søk');
  }

  // Check citations count
  if (research.citations.length < 5) {
    issues.push('Få kilder (< 5 citations)');
    suggestions.push('Be om flere konkrete eksempler og statistikk');
  }

  // Check coverage
  if (research.metadata.coverage.overall === 'limited') {
    issues.push(
      `Begrenset dekning (mangler: ${research.metadata.coverage.missingCategories.join(', ')})`
    );
    suggestions.push('Utvid research-spørsmålene til å dekke flere områder');
  }

  // Check confidence levels
  const lowConfidenceCount = research.findings.filter(
    (f) => f.confidence === 'low'
  ).length;
  if (lowConfidenceCount > research.findings.length / 2) {
    issues.push('Mange funn med lav confidence (mangler kilder)');
    suggestions.push('Be om spesifikke kilder og data for hvert funn');
  }

  // Calculate metrics
  const averageCitationsPerFinding =
    research.findings.length > 0
      ? research.citations.length / research.findings.length
      : 0;

  const coverageScore =
    (research.metadata.coverage.categoriesCovered.length /
      (research.metadata.coverage.categoriesCovered.length +
        research.metadata.coverage.missingCategories.length)) *
    100;

  // Overall assessment
  let overall: 'good' | 'moderate' | 'poor';
  if (issues.length === 0 && coverageScore >= 80) {
    overall = 'good';
  } else if (issues.length <= 2 && coverageScore >= 50) {
    overall = 'moderate';
  } else {
    overall = 'poor';
  }

  return {
    overall,
    issues,
    suggestions,
    metrics: {
      findingsCount: research.findings.length,
      citationsCount: research.citations.length,
      averageCitationsPerFinding,
      coverageScore,
    },
  };
}
