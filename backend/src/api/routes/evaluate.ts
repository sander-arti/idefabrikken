import { Router, type Request, type Response } from 'express';
import {
  createEvaluationJob,
  getEvaluationJob,
  updateEvaluationJobStatus,
} from '../../lib/db/queries/index.js';
import { getIdea, updateIdea } from '../../lib/db/queries/index.js';
import { evaluateIdea } from '../../lib/agents/evaluate.js';
import { requireAuth } from '../../middleware/auth.js';
import { env } from '../../config/env.js';

export const evaluateRouter: Router = Router();

/**
 * POST /api/ideas/:id/evaluate
 * Start evaluation process with real AI agents (must be owned by authenticated user)
 */
evaluateRouter.post('/:id/evaluate', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if idea exists and has idea_document
    const idea = await getIdea(id);
    if (!idea) {
      res.status(404).json({ error: 'Idea not found' });
      return;
    }

    // Permission check
    if (idea.created_by !== req.user!.id && idea.created_by !== null) {
      res.status(403).json({ error: 'Forbidden: You do not have access to this idea' });
      return;
    }

    if (!idea.idea_document) {
      res.status(400).json({
        error: 'Cannot evaluate idea',
        message: 'Idea must be structured first (idea_document is required)',
      });
      return;
    }

    // Create evaluation job
    const job = await createEvaluationJob(id);

    // Update idea status to evaluating
    await updateIdea(id, { status: 'evaluating' }, req.user!.id);

    // Run evaluation asynchronously with real AI agents (pass userId for permission)
    runEvaluation(id, job.id, idea.idea_document, req.user!.id);

    res.json({
      job_id: job.id,
      status: 'started',
      message: 'Evaluation started',
    });
  } catch (error) {
    console.error('Failed to start evaluation:', error);
    res.status(500).json({
      error: 'Failed to start evaluation',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/ideas/:id/evaluate
 * Get evaluation status and progress (must be owned by authenticated user)
 */
evaluateRouter.get('/:id/evaluate', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if idea exists
    const idea = await getIdea(id);
    if (!idea) {
      res.status(404).json({ error: 'Idea not found' });
      return;
    }

    // Permission check
    if (idea.created_by !== req.user!.id && idea.created_by !== null) {
      res.status(403).json({ error: 'Forbidden: You do not have access to this idea' });
      return;
    }

    // Get latest evaluation job
    const job = await getEvaluationJob(id);

    if (!job) {
      res.status(404).json({
        error: 'No evaluation found for this idea',
      });
      return;
    }

    res.json(job);
  } catch (error) {
    console.error('Failed to get evaluation status:', error);
    res.status(500).json({
      error: 'Failed to get evaluation status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * AI Evaluation runner
 * Runs real AI agents to evaluate the idea
 */
async function runEvaluation(
  ideaId: string,
  jobId: string,
  ideaDocument: string,
  userId: string
) {
  const useTwoStep = env.USE_TWO_STEP_EVALUATION;

  try {
    console.log(`🚀 Starting evaluation for idea ${ideaId} (${useTwoStep ? 'two-step' : 'legacy'} mode)`);

    // Update job: started
    await updateEvaluationJobStatus(jobId, {
      status: 'running',
      started_at: new Date().toISOString(),
    });

    if (useTwoStep) {
      // TWO-STEP MODE: Research → Synthesis → Complete

      // Phase 1: Research
      console.log('📊 Phase 1: Research (Perplexity Deep Research)');
      await updateEvaluationJobStatus(jobId, {
        phase: 'research',
        market_research_status: 'running',
        product_research_status: 'running',
        business_research_status: 'running',
        current_step_description: 'Kjører parallell markedsundersøkelse, produktanalyse og forretningsanalyse...',
        estimated_time_remaining: 600, // Deep research can take 3-10 minutes per query (parallel = ~10 min max)
      });

      // Run evaluation orchestrator (this blocks until both research + synthesis complete)
      const results = await evaluateIdea(ideaDocument);

      // Phase 2: Synthesis (research completed, synthesis happened inside evaluateIdea)
      console.log('🧠 Phase 2: Synthesis (GPT-5.2 Analysis)');
      await updateEvaluationJobStatus(jobId, {
        phase: 'synthesis',
        market_research_status: 'completed',
        product_research_status: 'completed',
        business_research_status: 'completed',
        market_strategist_status: 'completed',
        product_architect_status: 'completed',
        business_critic_status: 'completed',
        notes_synthesizer_status: 'running',
        current_step_description: 'Syntetiserer alle rapporter til endelig anbefaling...',
        estimated_time_remaining: 120, // Synthesis with large context can take 1-2 minutes
      });

      // Save all results to idea
      await updateIdea(ideaId, {
        market_report: results.market_report,
        prd: results.prd,
        risk_assessment: results.risk_assessment,
        evaluation_summary: results.evaluation_summary,
        score_market: results.score_market,
        score_buildability: results.score_buildability,
        score_business: results.score_business,
        score_total: results.score_total,
        recommendation: results.recommendation,
        recommendation_reason: `Basert på scores: marked ${results.score_market}/10, byggbarhet ${results.score_buildability}/10, business ${results.score_business}/10`,
        status: 'evaluated',
      }, userId);

      // Phase 3: Complete
      await updateEvaluationJobStatus(jobId, {
        status: 'completed',
        phase: 'complete',
        notes_synthesizer_status: 'completed',
        current_step_description: 'Evaluering fullført',
        estimated_time_remaining: 0,
        completed_at: new Date().toISOString(),
      });

    } else {
      // LEGACY MODE: Parallel agents → Synthesizer → Complete

      // Update job: parallel agents running (market, product, business)
      await updateEvaluationJobStatus(jobId, {
        market_strategist_status: 'running',
        product_architect_status: 'running',
        business_critic_status: 'running',
        current_step_description: 'Kjører parallell evaluering med AI-agenter...',
        estimated_time_remaining: 120, // GPT-4o evaluation takes 1-2 minutes per agent (parallel)
      });

      // Run evaluation orchestrator (3 parallel agents + synthesizer)
      const results = await evaluateIdea(ideaDocument);

      // Update job: parallel agents completed, synthesizer running
      await updateEvaluationJobStatus(jobId, {
        market_strategist_status: 'completed',
        product_architect_status: 'completed',
        business_critic_status: 'completed',
        notes_synthesizer_status: 'running',
        current_step_description: 'Syntetiserer evalueringer...',
        estimated_time_remaining: 60, // Synthesis takes 30-60 seconds
      });

      // Save all results to idea
      await updateIdea(ideaId, {
        market_report: results.market_report,
        prd: results.prd,
        risk_assessment: results.risk_assessment,
        evaluation_summary: results.evaluation_summary,
        score_market: results.score_market,
        score_buildability: results.score_buildability,
        score_business: results.score_business,
        score_total: results.score_total,
        recommendation: results.recommendation,
        recommendation_reason: `Basert på scores: marked ${results.score_market}/10, byggbarhet ${results.score_buildability}/10, business ${results.score_business}/10`,
        status: 'evaluated',
      }, userId);

      // Mark job as completed
      await updateEvaluationJobStatus(jobId, {
        status: 'completed',
        notes_synthesizer_status: 'completed',
        current_step_description: 'Evaluering fullført',
        estimated_time_remaining: 0,
        completed_at: new Date().toISOString(),
      });
    }

    console.log(`✅ Evaluation completed for idea ${ideaId}`);
  } catch (error) {
    console.error('Evaluation failed:', error);

    // Mark job as failed
    await updateEvaluationJobStatus(jobId, {
      status: 'failed',
      phase: 'complete',
      error: error instanceof Error ? error.message : 'Unknown error',
      current_step_description: 'Evaluering feilet',
      completed_at: new Date().toISOString(),
    });

    // Update idea status back to draft
    await updateIdea(ideaId, { status: 'draft' }, userId);
  }
}
