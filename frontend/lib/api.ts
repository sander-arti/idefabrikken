/**
 * API Client for Idéfabrikken Backend
 *
 * Provides typed fetch wrappers for all backend endpoints.
 * Automatically maps between frontend (camelCase) and backend (snake_case) conventions.
 */

import type { Idea, ChatMessage, IdeaScores } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Backend API types (snake_case as returned from database)
 */
interface BackendIdea {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  idea_document: string | null;
  market_report: string | null;
  prd: string | null;
  risk_assessment: string | null;
  evaluation_summary: string | null;
  score_market: number | null;
  score_buildability: number | null;
  score_business: number | null;
  score_total: number | null;
  recommendation: 'go' | 'hold' | 'reject' | null;
  recommendation_reason: string | null;
  decision: 'go' | 'hold' | 'reject' | null;
  decision_reason: string | null;
  decision_at: string | null;
  decision_by: string | null;
}

interface BackendChatMessage {
  id: string;
  idea_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface BackendEvaluationJob {
  id: string;
  idea_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  market_strategist_status: string | null;
  product_architect_status: string | null;
  business_critic_status: string | null;
  notes_synthesizer_status: string | null;
  started_at: string | null;
  completed_at: string | null;
  error: string | null;
  created_at: string;
}

/**
 * Map backend idea to frontend format
 */
function mapBackendIdea(backendIdea: BackendIdea): Idea {
  const scores: IdeaScores | undefined =
    backendIdea.score_total !== null
      ? {
          market: backendIdea.score_market || 0,
          buildability: backendIdea.score_buildability || 0,
          business: backendIdea.score_business || 0,
          total: backendIdea.score_total,
        }
      : undefined;

  return {
    id: backendIdea.id,
    title: backendIdea.title,
    description: backendIdea.description || '',
    status: backendIdea.status as Idea['status'],
    createdAt: backendIdea.created_at,
    scores,
    recommendation: backendIdea.recommendation || undefined,
    idea_document: backendIdea.idea_document || undefined,
    market_report: backendIdea.market_report || undefined,
    prd: backendIdea.prd || undefined,
    risk_assessment: backendIdea.risk_assessment || undefined,
    evaluation_summary: backendIdea.evaluation_summary || undefined,
  };
}

/**
 * Map backend chat message to frontend format
 */
function mapBackendChatMessage(backendMessage: BackendChatMessage): ChatMessage {
  return {
    id: backendMessage.id,
    role: backendMessage.role,
    content: backendMessage.content,
    timestamp: new Date(backendMessage.created_at).getTime(),
  };
}

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Unknown error',
      }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * IDEAS API
 */

export async function createIdea(data: {
  title: string;
  description?: string;
}): Promise<Idea> {
  const backendIdea = await apiFetch<BackendIdea>('/ideas', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return mapBackendIdea(backendIdea);
}

export async function listIdeas(status?: string): Promise<Idea[]> {
  const queryParams = status ? `?status=${encodeURIComponent(status)}` : '';
  const backendIdeas = await apiFetch<BackendIdea[]>(`/ideas${queryParams}`);
  return backendIdeas.map(mapBackendIdea);
}

export async function getIdea(id: string): Promise<Idea> {
  const backendIdea = await apiFetch<BackendIdea>(`/ideas/${id}`);
  return mapBackendIdea(backendIdea);
}

export async function updateIdea(
  id: string,
  data: Partial<Omit<Idea, 'id' | 'createdAt'>>
): Promise<Idea> {
  // Map frontend camelCase to backend snake_case
  const backendData: Record<string, unknown> = {};
  if (data.title !== undefined) backendData.title = data.title;
  if (data.description !== undefined) backendData.description = data.description;
  if (data.status !== undefined) backendData.status = data.status;
  if (data.idea_document !== undefined)
    backendData.idea_document = data.idea_document;
  if (data.market_report !== undefined)
    backendData.market_report = data.market_report;
  if (data.prd !== undefined) backendData.prd = data.prd;
  if (data.risk_assessment !== undefined)
    backendData.risk_assessment = data.risk_assessment;
  if (data.evaluation_summary !== undefined)
    backendData.evaluation_summary = data.evaluation_summary;

  const backendIdea = await apiFetch<BackendIdea>(`/ideas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(backendData),
  });
  return mapBackendIdea(backendIdea);
}

export async function deleteIdea(id: string): Promise<void> {
  await apiFetch<void>(`/ideas/${id}`, {
    method: 'DELETE',
  });
}

export async function recordDecision(
  id: string,
  decision: 'go' | 'hold' | 'reject',
  reason: string
): Promise<Idea> {
  const backendIdea = await apiFetch<BackendIdea>(`/ideas/${id}/decision`, {
    method: 'POST',
    body: JSON.stringify({ decision, reason }),
  });
  return mapBackendIdea(backendIdea);
}

/**
 * CHAT API
 */

export async function getChatMessages(ideaId: string): Promise<ChatMessage[]> {
  const backendMessages = await apiFetch<BackendChatMessage[]>(
    `/ideas/${ideaId}/chat`
  );
  return backendMessages.map(mapBackendChatMessage);
}

export async function sendChatMessage(
  ideaId: string,
  message: string
): Promise<{
  message: ChatMessage;
  idea_document: string;
  is_ready_for_evaluation: boolean;
}> {
  const response = await apiFetch<{
    message: BackendChatMessage;
    idea_document: string;
    is_ready_for_evaluation: boolean;
  }>(`/ideas/${ideaId}/chat`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });

  return {
    message: mapBackendChatMessage(response.message),
    idea_document: response.idea_document,
    is_ready_for_evaluation: response.is_ready_for_evaluation,
  };
}

/**
 * EVALUATION API
 */

export async function startEvaluation(ideaId: string): Promise<{
  job_id: string;
  status: string;
}> {
  return await apiFetch(`/ideas/${ideaId}/evaluate`, {
    method: 'POST',
  });
}

export async function getEvaluationStatus(
  ideaId: string
): Promise<BackendEvaluationJob> {
  return await apiFetch(`/ideas/${ideaId}/evaluate`);
}

/**
 * Helper to check if evaluation is complete
 */
export function isEvaluationComplete(job: BackendEvaluationJob): boolean {
  return job.status === 'completed' || job.status === 'failed';
}

/**
 * Helper to get evaluation progress percentage
 */
export function getEvaluationProgress(job: BackendEvaluationJob): number {
  if (job.status === 'pending') return 0;
  if (job.status === 'completed') return 100;
  if (job.status === 'failed') return 0;

  // Count completed agents
  let completed = 0;
  let total = 4; // market, product, business, synthesizer

  if (job.market_strategist_status === 'completed') completed++;
  if (job.product_architect_status === 'completed') completed++;
  if (job.business_critic_status === 'completed') completed++;
  if (job.notes_synthesizer_status === 'completed') completed++;

  return Math.round((completed / total) * 100);
}
