import { supabase } from '../../../config/supabase.js';
import type { TablesUpdate } from '../types.js';

/**
 * Ideas Query Functions
 *
 * CRUD operations for the ideas table.
 * All functions use the typed Supabase client for type safety.
 */

/**
 * Create a new idea with minimal required fields
 *
 * @param data - Idea data (title, description)
 * @param userId - User ID from JWT (automatically set, cannot be overridden)
 * @returns Created idea with generated ID
 */
export async function createIdea(
  data: {
    title: string;
    description?: string;
  },
  userId: string
) {
  const { data: idea, error } = await supabase
    .from('ideas')
    .insert({
      title: data.title,
      description: data.description || null,
      created_by: userId, // Auto-set from JWT
      status: 'draft',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create idea: ${error.message}`);
  }

  return idea;
}

/**
 * List ideas for a specific user with optional status filter
 *
 * @param userId - User ID to filter ideas by (from JWT)
 * @param status - Optional status filter (draft/evaluating/evaluated/go/hold/reject)
 * @returns Array of ideas owned by the user, ordered by updated_at DESC
 */
export async function listIdeas(userId: string, status?: string) {
  let query = supabase
    .from('ideas')
    .select('*')
    .eq('created_by', userId) // Only return user's own ideas
    .order('updated_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data: ideas, error } = await query;

  if (error) {
    throw new Error(`Failed to list ideas: ${error.message}`);
  }

  return ideas || [];
}

/**
 * Get a single idea by ID with all documents
 *
 * @param id - Idea UUID
 * @returns Full idea object or null if not found
 */
export async function getIdea(id: string) {
  const { data: idea, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    throw new Error(`Failed to get idea: ${error.message}`);
  }

  return idea;
}

/**
 * Update an idea with partial data
 *
 * @param id - Idea UUID
 * @param data - Partial idea data to update
 * @param userId - User ID from JWT (for permission check)
 * @returns Updated idea
 * @throws Error if user doesn't own the idea
 */
export async function updateIdea(
  id: string,
  data: TablesUpdate<'ideas'>,
  userId: string
) {
  // Permission check: verify user owns the idea
  const existing = await getIdea(id);
  if (!existing) {
    throw new Error('Idea not found');
  }

  if (existing.created_by !== userId && existing.created_by !== null) {
    throw new Error('Forbidden: You do not have permission to update this idea');
  }

  const { data: idea, error } = await supabase
    .from('ideas')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update idea: ${error.message}`);
  }

  return idea;
}

/**
 * Delete an idea (only allowed for drafts owned by the user)
 *
 * @param id - Idea UUID
 * @param userId - User ID from JWT (for permission check)
 * @throws Error if idea is not in draft status or user doesn't own it
 */
export async function deleteIdea(id: string, userId: string) {
  // First check if idea exists and user owns it
  const idea = await getIdea(id);

  if (!idea) {
    throw new Error('Idea not found');
  }

  // Permission check
  if (idea.created_by !== userId && idea.created_by !== null) {
    throw new Error('Forbidden: You do not have permission to delete this idea');
  }

  if (idea.status !== 'draft') {
    throw new Error(
      `Cannot delete idea with status "${idea.status}". Only drafts can be deleted.`
    );
  }

  const { error } = await supabase.from('ideas').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete idea: ${error.message}`);
  }

  return { success: true };
}

/**
 * Record a decision on an idea
 *
 * @param id - Idea UUID
 * @param decision - Decision type (go/hold/reject)
 * @param reason - Reason for the decision
 * @param decidedBy - User ID from JWT (automatically set, cannot be overridden)
 */
export async function recordDecision(
  id: string,
  decision: 'go' | 'hold' | 'reject',
  reason: string,
  decidedBy: string
) {
  const { data: idea, error } = await supabase
    .from('ideas')
    .update({
      decision,
      decision_reason: reason,
      decision_at: new Date().toISOString(),
      decision_by: decidedBy, // Auto-set from JWT
      status: decision, // Status follows decision
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to record decision: ${error.message}`);
  }

  return idea;
}
