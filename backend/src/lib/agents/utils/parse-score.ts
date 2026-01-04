/**
 * Score Parser Utilities
 *
 * Extract scores and recommendations from AI-generated markdown reports.
 */

/**
 * Extract score from markdown report
 *
 * Looks for pattern: "Score: X/10" where X can be integer or decimal
 *
 * @param markdown - The agent's report in markdown format
 * @returns Parsed score (0-10) or throws error if not found
 * @throws Error if score cannot be parsed or is out of range
 */
export function parseScore(markdown: string): number {
  // Match patterns like:
  // "Score: 8/10"
  // "Score: 7.5/10"
  // "## Score: 9/10"
  const scoreRegex = /Score:\s*(\d+(?:\.\d+)?)\s*\/\s*10/i;
  const match = markdown.match(scoreRegex);

  if (!match) {
    throw new Error(
      'Could not find score in markdown. Expected format: "Score: X/10"'
    );
  }

  const score = parseFloat(match[1]);

  // Validate range
  if (isNaN(score) || score < 0 || score > 10) {
    throw new Error(
      `Invalid score: ${score}. Score must be between 0 and 10.`
    );
  }

  // Round to 1 decimal place
  return Math.round(score * 10) / 10;
}

/**
 * Extract recommendation from synthesis report
 *
 * Looks for pattern: "Anbefaling: GÅ VIDERE" (or AVVENT/FORKAST)
 *
 * @param markdown - The synthesizer's report in markdown format
 * @returns Recommendation: 'go', 'hold', or 'reject'
 * @throws Error if recommendation cannot be parsed
 */
export function parseRecommendation(
  markdown: string
): 'go' | 'hold' | 'reject' {
  // Match patterns like:
  // "Anbefaling: GÅ VIDERE"
  // "## Anbefaling: AVVENT"
  // "Anbefaling: FORKAST"

  // First try exact matches (case-insensitive)
  if (/Anbefaling:\s*GÅ\s+VIDERE/i.test(markdown)) {
    return 'go';
  }

  if (/Anbefaling:\s*AVVENT/i.test(markdown)) {
    return 'hold';
  }

  if (/Anbefaling:\s*FORKAST/i.test(markdown)) {
    return 'reject';
  }

  // Fallback: try to find recommendation keywords anywhere in the report
  const lowerMarkdown = markdown.toLowerCase();

  if (lowerMarkdown.includes('gå videre') && lowerMarkdown.includes('anbefaling')) {
    return 'go';
  }

  if (lowerMarkdown.includes('avvent') && lowerMarkdown.includes('anbefaling')) {
    return 'hold';
  }

  if (lowerMarkdown.includes('forkast') && lowerMarkdown.includes('anbefaling')) {
    return 'reject';
  }

  // Could not determine recommendation
  throw new Error(
    'Could not parse recommendation from markdown. Expected format: "Anbefaling: GÅ VIDERE" (or AVVENT/FORKAST)'
  );
}

/**
 * Calculate total score from individual dimension scores
 *
 * @param marketScore - Score from Market Strategist (0-10)
 * @param buildabilityScore - Score from Product Architect (0-10)
 * @param businessScore - Score from Business Critic (0-10)
 * @returns Average score rounded to 1 decimal place
 */
export function calculateTotalScore(
  marketScore: number,
  buildabilityScore: number,
  businessScore: number
): number {
  const average = (marketScore + buildabilityScore + businessScore) / 3;
  return Math.round(average * 10) / 10;
}
