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
 * @param title - Idea title (required)
 * @param description - Optional short description
 * @param created_by - Optional user ID (when auth is implemented)
 * @returns Created idea with generated ID
 */
export async function createIdea(data: {
  title: string;
  description?: string;
  created_by?: string;
}) {
  const { data: idea, error } = await supabase
    .from('ideas')
    .insert({
      title: data.title,
      description: data.description || null,
      created_by: data.created_by || null,
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
 * List ideas with optional status filter
 *
 * @param status - Optional status filter (draft/evaluating/evaluated/go/hold/reject)
 * @returns Array of ideas ordered by updated_at DESC
 */
export async function listIdeas(status?: string) {
  let query = supabase
    .from('ideas')
    .select('*')
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
 * @returns Updated idea
 */
export async function updateIdea(
  id: string,
  data: TablesUpdate<'ideas'>
) {
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
 * Delete an idea (only allowed for drafts)
 *
 * @param id - Idea UUID
 * @throws Error if idea is not in draft status
 */
export async function deleteIdea(id: string) {
  // First check if idea is in draft status
  const idea = await getIdea(id);

  if (!idea) {
    throw new Error('Idea not found');
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
 * @param decided_by - Optional user ID
 */
export async function recordDecision(
  id: string,
  decision: 'go' | 'hold' | 'reject',
  reason: string,
  decided_by?: string
) {
  const { data: idea, error } = await supabase
    .from('ideas')
    .update({
      decision,
      decision_reason: reason,
      decision_at: new Date().toISOString(),
      decision_by: decided_by || null,
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
