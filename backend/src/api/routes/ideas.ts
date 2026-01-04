import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import {
  createIdea,
  listIdeas,
  getIdea,
  updateIdea,
  deleteIdea,
  recordDecision,
} from '../../lib/db/queries/index.js';

export const ideasRouter: Router = Router();

/**
 * Input validation schemas
 */

const createIdeaSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  created_by: z.string().optional(),
});

const updateIdeaSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  idea_document: z.string().optional(),
  market_report: z.string().optional(),
  prd: z.string().optional(),
  risk_assessment: z.string().optional(),
  evaluation_summary: z.string().optional(),
  score_market: z.number().min(0).max(10).optional(),
  score_buildability: z.number().min(0).max(10).optional(),
  score_business: z.number().min(0).max(10).optional(),
  score_total: z.number().min(0).max(10).optional(),
  recommendation: z.enum(['go', 'hold', 'reject']).optional(),
  recommendation_reason: z.string().optional(),
  status: z
    .enum(['draft', 'evaluating', 'evaluated', 'go', 'hold', 'reject'])
    .optional(),
});

const recordDecisionSchema = z.object({
  decision: z.enum(['go', 'hold', 'reject']),
  reason: z.string().min(1, 'Decision reason is required'),
  decided_by: z.string().optional(),
});

/**
 * POST /api/ideas
 * Create a new idea
 */
ideasRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = createIdeaSchema.parse(req.body);

    const idea = await createIdea(data);

    res.status(201).json(idea);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
      return;
    }

    console.error('Failed to create idea:', error);
    res.status(500).json({
      error: 'Failed to create idea',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/ideas
 * List all ideas (with optional status filter)
 */
ideasRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const status = req.query.status as string | undefined;

    // Validate status if provided
    if (status) {
      const validStatuses = [
        'draft',
        'evaluating',
        'evaluated',
        'go',
        'hold',
        'reject',
      ];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          error: 'Invalid status filter',
          validValues: validStatuses,
        });
        return;
      }
    }

    const ideas = await listIdeas(status);

    res.json(ideas);
  } catch (error) {
    console.error('Failed to list ideas:', error);
    res.status(500).json({
      error: 'Failed to list ideas',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/ideas/:id
 * Get a single idea by ID
 */
ideasRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const idea = await getIdea(id);

    if (!idea) {
      res.status(404).json({
        error: 'Idea not found',
      });
      return;
    }

    res.json(idea);
  } catch (error) {
    console.error('Failed to get idea:', error);
    res.status(500).json({
      error: 'Failed to get idea',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PATCH /api/ideas/:id
 * Update an idea (partial update)
 */
ideasRouter.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = updateIdeaSchema.parse(req.body);

    // Check if idea exists
    const existing = await getIdea(id);
    if (!existing) {
      res.status(404).json({
        error: 'Idea not found',
      });
      return;
    }

    const updated = await updateIdea(id, data);

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
      return;
    }

    console.error('Failed to update idea:', error);
    res.status(500).json({
      error: 'Failed to update idea',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/ideas/:id
 * Delete an idea (only drafts)
 */
ideasRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await deleteIdea(id);

    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Idea not found') {
        res.status(404).json({ error: 'Idea not found' });
        return;
      }
      if (error.message.includes('Only drafts can be deleted')) {
        res.status(400).json({
          error: 'Cannot delete idea',
          message: error.message,
        });
        return;
      }
    }

    console.error('Failed to delete idea:', error);
    res.status(500).json({
      error: 'Failed to delete idea',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/ideas/:id/decision
 * Record a decision on an idea
 */
ideasRouter.post('/:id/decision', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = recordDecisionSchema.parse(req.body);

    // Check if idea exists
    const existing = await getIdea(id);
    if (!existing) {
      res.status(404).json({
        error: 'Idea not found',
      });
      return;
    }

    const updated = await recordDecision(
      id,
      data.decision,
      data.reason,
      data.decided_by
    );

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
      return;
    }

    console.error('Failed to record decision:', error);
    res.status(500).json({
      error: 'Failed to record decision',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
