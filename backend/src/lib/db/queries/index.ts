/**
 * Database Query Functions
 *
 * Central export point for all database operations.
 * Import from this file to access any query function.
 *
 * Example:
 *   import { createIdea, addChatMessage, startEvaluationJob } from '@/lib/db/queries';
 */

// Ideas
export {
  createIdea,
  listIdeas,
  getIdea,
  updateIdea,
  deleteIdea,
  recordDecision,
} from './ideas.js';

// Chat messages
export {
  getChatMessages,
  addChatMessage,
  getRecentChatMessages,
  deleteChatMessages,
} from './chat.js';

// Evaluation jobs
export {
  createEvaluationJob,
  getEvaluationJob,
  getEvaluationJobById,
  updateEvaluationJobStatus,
  startEvaluationJob,
  completeEvaluationJob,
  failEvaluationJob,
  deleteEvaluationJob,
} from './evaluation.js';
