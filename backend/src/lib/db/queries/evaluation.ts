import { supabase } from '../../../config/supabase.js';

/**
 * Evaluation Job Query Functions
 *
 * Operations for tracking evaluation progress and status.
 */

/**
 * Create a new evaluation job for an idea
 *
 * @param ideaId - Idea UUID
 * @returns Created evaluation job
 */
export async function createEvaluationJob(ideaId: string) {
  const { data: job, error } = await supabase
    .from('evaluation_jobs')
    .insert({
      idea_id: ideaId,
      status: 'pending',
      market_strategist_status: null,
      product_architect_status: null,
      business_critic_status: null,
      notes_synthesizer_status: null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create evaluation job: ${error.message}`);
  }

  return job;
}

/**
 * Get the latest evaluation job for an idea
 *
 * @param ideaId - Idea UUID
 * @returns Latest job or null if none exists
 */
export async function getEvaluationJob(ideaId: string) {
  const { data: job, error } = await supabase
    .from('evaluation_jobs')
    .select('*')
    .eq('idea_id', ideaId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    throw new Error(`Failed to get evaluation job: ${error.message}`);
  }

  return job;
}

/**
 * Get evaluation job by ID
 *
 * @param jobId - Job UUID
 * @returns Job or null if not found
 */
export async function getEvaluationJobById(jobId: string) {
  const { data: job, error } = await supabase
    .from('evaluation_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get evaluation job: ${error.message}`);
  }

  return job;
}

/**
 * Update evaluation job status and agent progress
 *
 * @param jobId - Job UUID
 * @param updates - Partial job data to update
 * @returns Updated job
 */
export async function updateEvaluationJobStatus(
  jobId: string,
  updates: {
    status?: 'pending' | 'running' | 'completed' | 'failed';
    phase?: 'research' | 'synthesis' | 'complete' | null;
    market_strategist_status?: string | null;
    product_architect_status?: string | null;
    business_critic_status?: string | null;
    notes_synthesizer_status?: string | null;
    market_research_status?: string | null;
    product_research_status?: string | null;
    business_research_status?: string | null;
    estimated_time_remaining?: number | null;
    current_step_description?: string | null;
    started_at?: string | null;
    completed_at?: string | null;
    error?: string | null;
  }
) {
  const { data: job, error } = await supabase
    .from('evaluation_jobs')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update evaluation job: ${error.message}`);
  }

  return job;
}

/**
 * Mark evaluation job as started
 *
 * @param jobId - Job UUID
 */
export async function startEvaluationJob(jobId: string) {
  return updateEvaluationJobStatus(jobId, {
    status: 'running',
    started_at: new Date().toISOString(),
  });
}

/**
 * Mark evaluation job as completed
 *
 * @param jobId - Job UUID
 */
export async function completeEvaluationJob(jobId: string) {
  return updateEvaluationJobStatus(jobId, {
    status: 'completed',
    completed_at: new Date().toISOString(),
    market_strategist_status: 'completed',
    product_architect_status: 'completed',
    business_critic_status: 'completed',
    notes_synthesizer_status: 'completed',
  });
}

/**
 * Mark evaluation job as failed
 *
 * @param jobId - Job UUID
 * @param errorMessage - Error description
 */
export async function failEvaluationJob(jobId: string, errorMessage: string) {
  return updateEvaluationJobStatus(jobId, {
    status: 'failed',
    completed_at: new Date().toISOString(),
    error: errorMessage,
  });
}

/**
 * Delete an evaluation job
 *
 * @param jobId - Job UUID
 */
export async function deleteEvaluationJob(jobId: string) {
  const { error } = await supabase
    .from('evaluation_jobs')
    .delete()
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to delete evaluation job: ${error.message}`);
  }

  return { success: true };
}
