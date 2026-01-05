BEGIN;

-- ============================================================================
-- FASE 3: TWO-STEP EVALUATION TRACKING - DATABASE MIGRATION
-- ============================================================================
-- This migration adds progress tracking for two-step evaluation (research + synthesis):
-- - Phase tracking (research, synthesis, complete)
-- - Individual agent research status (market, product, business)
-- - Progress indicators for UI (estimated time, current step description)
-- ============================================================================

-- 1. Add phase and progress tracking columns to evaluation_jobs
ALTER TABLE evaluation_jobs
  ADD COLUMN phase VARCHAR(20) DEFAULT 'research',
  ADD COLUMN market_research_status VARCHAR(20) DEFAULT NULL,
  ADD COLUMN product_research_status VARCHAR(20) DEFAULT NULL,
  ADD COLUMN business_research_status VARCHAR(20) DEFAULT NULL,
  ADD COLUMN estimated_time_remaining INTEGER DEFAULT NULL,
  ADD COLUMN current_step_description TEXT DEFAULT NULL;

-- 2. Add comments for documentation
COMMENT ON COLUMN evaluation_jobs.phase IS
  'Current evaluation phase: research | synthesis | complete';

COMMENT ON COLUMN evaluation_jobs.market_research_status IS
  'Market research status: pending | running | completed | failed';

COMMENT ON COLUMN evaluation_jobs.product_research_status IS
  'Product research status: pending | running | completed | failed';

COMMENT ON COLUMN evaluation_jobs.business_research_status IS
  'Business research status: pending | running | completed | failed';

COMMENT ON COLUMN evaluation_jobs.estimated_time_remaining IS
  'Estimated seconds remaining for current phase';

COMMENT ON COLUMN evaluation_jobs.current_step_description IS
  'Human-readable description of current step (e.g., "Running market research...")';

-- 3. Add index for phase column (for querying jobs by phase)
CREATE INDEX idx_evaluation_jobs_phase ON evaluation_jobs(phase);

-- 4. Update existing rows to have default phase
UPDATE evaluation_jobs
SET phase = 'complete'
WHERE status = 'completed';

UPDATE evaluation_jobs
SET phase = 'synthesis'
WHERE status = 'running' AND completed_at IS NULL;

-- 5. Add check constraint for valid phase values
ALTER TABLE evaluation_jobs
  ADD CONSTRAINT check_phase_valid
  CHECK (phase IN ('research', 'synthesis', 'complete'));

-- 6. Add check constraint for valid research status values
ALTER TABLE evaluation_jobs
  ADD CONSTRAINT check_research_status_valid
  CHECK (
    (market_research_status IS NULL OR market_research_status IN ('pending', 'running', 'completed', 'failed')) AND
    (product_research_status IS NULL OR product_research_status IN ('pending', 'running', 'completed', 'failed')) AND
    (business_research_status IS NULL OR business_research_status IN ('pending', 'running', 'completed', 'failed'))
  );

COMMIT;
