import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import {
  getChatMessages,
  addChatMessage,
  getRecentChatMessages,
} from '../../lib/db/queries/index.js';
import { getIdea, updateIdea } from '../../lib/db/queries/index.js';
import { runAgent } from '../../lib/agents/runner.js';
import { IDEA_RECEIVER_PROMPT } from '../../lib/agents/prompts/idea-receiver.js';

export const chatRouter: Router = Router();

/**
 * Input validation
 */
const sendMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
});

/**
 * GET /api/ideas/:id/chat
 * Get all chat messages for an idea
 */
chatRouter.get('/:id/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if idea exists
    const idea = await getIdea(id);
    if (!idea) {
      res.status(404).json({ error: 'Idea not found' });
      return;
    }

    const messages = await getChatMessages(id);

    res.json(messages);
  } catch (error) {
    console.error('Failed to get chat messages:', error);
    res.status(500).json({
      error: 'Failed to get chat messages',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/ideas/:id/chat
 * Send a message and get AI response (OpenAI GPT-4o)
 */
chatRouter.post('/:id/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = sendMessageSchema.parse(req.body);

    // Check if idea exists
    const idea = await getIdea(id);
    if (!idea) {
      res.status(404).json({ error: 'Idea not found' });
      return;
    }

    // Save user message
    await addChatMessage(id, 'user', data.message);

    // Get recent conversation history (last 10 messages for context)
    const recentMessages = await getRecentChatMessages(id, 10);

    // Build conversation history for AI context
    const conversationHistory = recentMessages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Call AI agent with conversation context
    const agentResponse = await runAgent({
      systemPrompt: IDEA_RECEIVER_PROMPT,
      userMessage: data.message,
      conversationHistory,
      agentName: 'Idea Receiver',
    });

    // Save AI response to database
    const aiMessage = await addChatMessage(id, 'assistant', agentResponse.content);

    // Extract idea document from AI response
    // The agent includes the structured markdown in its response
    const ideaDocument = extractIdeaDocument(agentResponse.content, idea.title);

    // Update idea_document if we found structured content
    if (ideaDocument) {
      await updateIdea(id, { idea_document: ideaDocument });
    }

    // Check if AI signaled readiness for evaluation
    const isReadyForEvaluation = agentResponse.content.includes('READY_FOR_EVALUATION');

    res.json({
      message: aiMessage,
      idea_document: ideaDocument || idea.idea_document || '',
      is_ready_for_evaluation: isReadyForEvaluation,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
      return;
    }

    console.error('Failed to send chat message:', error);
    res.status(500).json({
      error: 'Failed to send chat message',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Extract structured idea document from AI response
 * The AI agent includes markdown-formatted IDÉUTKAST in its response
 */
function extractIdeaDocument(aiResponse: string, ideaTitle: string): string | null {
  // Look for markdown content that looks like a structured idea document
  // The agent includes sections like ## Problem, ## Målgruppe, etc.

  // Check if response contains structured sections
  const hasStructuredContent =
    aiResponse.includes('## Problem') ||
    aiResponse.includes('## Målgruppe') ||
    aiResponse.includes('## Jobs to Be Done');

  if (!hasStructuredContent) {
    // AI hasn't generated the document yet, just chatting
    return null;
  }

  // Extract the markdown document
  // It typically starts with # heading and contains the structured sections
  const lines = aiResponse.split('\n');
  const documentLines: string[] = [];
  let inDocument = false;

  for (const line of lines) {
    // Start capturing when we see a heading or structured section
    if (line.startsWith('# ') || line.startsWith('## Problem')) {
      inDocument = true;
    }

    if (inDocument) {
      documentLines.push(line);
    }

    // Stop capturing if we hit the READY_FOR_EVALUATION marker
    if (line.includes('READY_FOR_EVALUATION')) {
      break;
    }
  }

  if (documentLines.length === 0) {
    return null;
  }

  let document = documentLines.join('\n').trim();

  // Ensure document has a title
  if (!document.startsWith('# ')) {
    document = `# Idéutkast: ${ideaTitle}\n\n${document}`;
  }

  return document;
}
