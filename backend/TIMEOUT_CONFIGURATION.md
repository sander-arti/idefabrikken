# Timeout Configuration for Long-Running AI Operations

## Overview

Idéfabrikken's evaluation system uses **Perplexity Sonar Deep Research**, which performs comprehensive research that can take **3-10 minutes per query**. This document explains the timeout architecture and troubleshooting.

## Timeout Hierarchy

The system has **three layers** of timeouts that must be configured correctly:

```
┌─────────────────────────────────────────────────────────────┐
│  1. HTTP Server Timeout (Express)                           │
│     Default: 900000ms (15 minutes)                          │
│     Must be LONGER than the longest operation               │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Perplexity Client Timeout (HTTP fetch)                  │
│     Default: 600000ms (10 minutes)                          │
│     AbortController kills request after timeout             │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  3. OpenAI Client Timeout (Synthesis)                       │
│     Default: 300000ms (5 minutes)                           │
│     AbortController for synthesis operations                │
└─────────────────────────────────────────────────────────────┘
```

**Critical Rule:** `SERVER_TIMEOUT_MS > PERPLEXITY_TIMEOUT_MS > SYNTHESIS_TIMEOUT_MS`

## Environment Variables

### Production (.env)
```bash
# Timeouts (in milliseconds)
# Note: Perplexity Deep Research can take 3-10 minutes per query
PERPLEXITY_TIMEOUT_MS=600000  # 10 minutes
SYNTHESIS_TIMEOUT_MS=300000   # 5 minutes
SERVER_TIMEOUT_MS=900000      # 15 minutes
```

### Development/Testing (.env.test)
Same values as production. Tests use mocks and complete instantly, but timeout values must match schema validation.

## Why These Values?

### Perplexity Deep Research: 10 minutes

**Reality Check:**
- Perplexity Sonar Deep Research performs **multiple web searches** and synthesizes findings
- Each query can involve 5-15+ searches
- Total time: **3-10 minutes per research agent**
- We run **3 agents in parallel**: Market, Product, Business

**Math:**
- 3 parallel queries × 10 minutes max = **10 minutes total** (because parallel)
- Old value (120s = 2 minutes) would **fail every time**

### OpenAI Synthesis: 5 minutes

**Reality Check:**
- GPT-5.2 synthesis processes large context (research findings + citations)
- Input: ~10,000-15,000 tokens
- Output: ~2,000-3,000 tokens
- Generation time: **1-3 minutes typically, 5 minutes max**

### Express Server: 15 minutes

**Reality Check:**
- Must be **longer than the longest operation** to avoid premature connection close
- Full evaluation flow:
  1. Research (10 min max)
  2. Synthesis (3 min per agent × 3 = ~3 min parallel)
  3. Notes Synthesizer (1-2 min)
  4. Database operations (<1 min)

**Total: ~12-14 minutes max**, so **15 minutes is safe**.

## What Happens When Timeout Occurs?

### Perplexity Timeout (10 min)
```
AbortError → ProviderError(504) → Evaluation fails → Job status: 'failed'
```

**User sees:**
- Job status: `failed`
- Error: "Request timeout"
- Idea status returns to `draft`

### Server Timeout (15 min)
```
HTTP connection closed → Client receives empty response → Frontend shows error
```

**User sees:**
- Network error in frontend
- Job status stuck at `running` (database not updated)

**Recovery:**
- Job remains in database as `running`
- Manual cleanup required or implement timeout cleanup job

## Increasing Timeouts (If Needed)

If you experience frequent timeouts, increase **all three values proportionally**:

```bash
# Example: Double all timeouts
PERPLEXITY_TIMEOUT_MS=1200000  # 20 minutes (was 10)
SYNTHESIS_TIMEOUT_MS=600000    # 10 minutes (was 5)
SERVER_TIMEOUT_MS=1800000      # 30 minutes (was 15)
```

**Important:** Restart backend server after changing `.env`

## Monitoring & Observability

### Check Actual Duration

Add this logging to `backend/src/lib/agents/two-step/agent.ts`:

```typescript
const startTime = Date.now();
const research = await runResearchAgent({ ideaDocument, agentType, config });
const duration = Date.now() - startTime;
logger.info(`Research completed in ${duration}ms (${duration / 60000} minutes)`);
```

### Alert Thresholds

Set up alerts for:
- Research > 8 minutes (approaching timeout)
- Synthesis > 4 minutes (approaching timeout)
- Job status `running` for > 20 minutes (stuck job)

## Troubleshooting

### Problem: "Request timeout" after 2 minutes

**Cause:** Using old timeout values (120s)

**Fix:**
1. Check `.env` has `PERPLEXITY_TIMEOUT_MS=600000`
2. Restart backend: `pnpm dev` or `pnpm start`
3. Verify in logs: "Server timeout: 900000ms (15 minutes)"

### Problem: Connection closed unexpectedly

**Cause:** Server timeout too short

**Fix:**
1. Increase `SERVER_TIMEOUT_MS` to 1200000 (20 minutes)
2. Restart backend
3. Monitor actual evaluation durations

### Problem: Frontend shows "Network Error"

**Cause:** Evaluation took longer than all configured timeouts

**Fix:**
1. Check actual Perplexity duration (add logging)
2. Increase timeouts proportionally
3. Consider implementing progress polling instead of single long request

## Alternative: Async Polling Pattern (Future)

For very long operations (>15 min), consider:

```typescript
// Current: Synchronous (waits for completion)
POST /api/ideas/:id/evaluate → { job_id: "...", status: "started" }
await evaluateIdea() // Blocks for 10-15 minutes
→ Job completes

// Alternative: Async polling (no timeout issues)
POST /api/ideas/:id/evaluate → { job_id: "...", status: "started" }
→ Returns immediately

GET /api/ideas/:id/evaluate/status → { status: "running", progress: "60%" }
→ Frontend polls every 5 seconds
→ Shows live progress
→ No timeout issues
```

**Pros:**
- No timeout issues (each poll is <1s)
- Better UX (live progress)
- Can handle unlimited duration

**Cons:**
- More complex implementation
- Requires background job queue
- More database queries (polling)

## Testing Timeout Behavior

### Test timeout handling without real API calls:

```typescript
// In research/runner.ts
const SIMULATE_TIMEOUT = process.env.SIMULATE_TIMEOUT === 'true';

if (SIMULATE_TIMEOUT) {
  await new Promise(resolve => setTimeout(resolve, 700000)); // 11.6 min
  throw new ProviderError('Simulated timeout', 'perplexity', 504);
}
```

Then:
```bash
SIMULATE_TIMEOUT=true pnpm dev
# Trigger evaluation
# Should fail after ~10 minutes with proper error handling
```

## Cost vs Timeout Tradeoff

Longer timeouts = higher quality research, but:
- **Per evaluation cost**: ~$0.23
- **If timeout kills research**: Wasted $0.12-0.20
- **Failed evaluations**: User frustration

**Recommendation:** Start with 10-minute timeout, monitor, adjust if needed.

## Summary

✅ **Current Configuration (Safe Defaults):**
- Perplexity: 10 minutes (handles 99% of deep research)
- Synthesis: 5 minutes (handles large contexts)
- Server: 15 minutes (handles full evaluation flow)

⚠️ **Watch For:**
- Frequent "Request timeout" errors → Increase PERPLEXITY_TIMEOUT_MS
- Stuck jobs at "running" → Increase SERVER_TIMEOUT_MS
- Empty responses → Server timeout too short

🔧 **When to Adjust:**
- Only if seeing >5% timeout failures
- After monitoring actual duration for 50+ evaluations
- If Perplexity releases slower/faster models
