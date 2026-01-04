import { Router, type Request, type Response } from 'express';
import {
  createEvaluationJob,
  getEvaluationJob,
  updateEvaluationJobStatus,
} from '../../lib/db/queries/index.js';
import { getIdea, updateIdea } from '../../lib/db/queries/index.js';
import { evaluateIdea } from '../../lib/agents/evaluate.js';

export const evaluateRouter: Router = Router();

/**
 * POST /api/ideas/:id/evaluate
 * Start evaluation process with real AI agents
 */
evaluateRouter.post('/:id/evaluate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if idea exists and has idea_document
    const idea = await getIdea(id);
    if (!idea) {
      res.status(404).json({ error: 'Idea not found' });
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
    await updateIdea(id, { status: 'evaluating' });

    // Run evaluation asynchronously with real AI agents
    runEvaluation(id, job.id, idea.idea_document);

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
 * Get evaluation status and progress
 */
evaluateRouter.get('/:id/evaluate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if idea exists
    const idea = await getIdea(id);
    if (!idea) {
      res.status(404).json({ error: 'Idea not found' });
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
  ideaDocument: string
) {
  try {
    console.log(`🚀 Starting evaluation for idea ${ideaId}`);

    // Update job: started
    await updateEvaluationJobStatus(jobId, {
      status: 'running',
      started_at: new Date().toISOString(),
    });

    // Update job: parallel agents running (market, product, business)
    await updateEvaluationJobStatus(jobId, {
      market_strategist_status: 'running',
      product_architect_status: 'running',
      business_critic_status: 'running',
    });

    // Run evaluation orchestrator (3 parallel agents + synthesizer)
    const results = await evaluateIdea(ideaDocument);

    // Update job: parallel agents completed, synthesizer running
    await updateEvaluationJobStatus(jobId, {
      market_strategist_status: 'completed',
      product_architect_status: 'completed',
      business_critic_status: 'completed',
      notes_synthesizer_status: 'running',
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
    });

    // Mark job as completed
    await updateEvaluationJobStatus(jobId, {
      status: 'completed',
      notes_synthesizer_status: 'completed',
      completed_at: new Date().toISOString(),
    });

    console.log(`✅ Evaluation completed for idea ${ideaId}`);
  } catch (error) {
    console.error('Evaluation failed:', error);

    // Mark job as failed
    await updateEvaluationJobStatus(jobId, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      completed_at: new Date().toISOString(),
    });

    // Update idea status back to draft
    await updateIdea(ideaId, { status: 'draft' });
  }
}
