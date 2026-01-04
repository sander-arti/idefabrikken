import { supabase } from '../../../config/supabase.js';

/**
 * Chat Message Query Functions
 *
 * Operations for managing chat messages in the structuring conversation.
 */

/**
 * Get all chat messages for an idea, ordered chronologically
 *
 * @param ideaId - Idea UUID
 * @returns Array of messages ordered by created_at ASC
 */
export async function getChatMessages(ideaId: string) {
  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('idea_id', ideaId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to get chat messages: ${error.message}`);
  }

  return messages || [];
}

/**
 * Add a new chat message
 *
 * @param ideaId - Idea UUID
 * @param role - Message role (user or assistant)
 * @param content - Message content
 * @returns Created message
 */
export async function addChatMessage(
  ideaId: string,
  role: 'user' | 'assistant',
  content: string
) {
  const { data: message, error } = await supabase
    .from('chat_messages')
    .insert({
      idea_id: ideaId,
      role,
      content,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add chat message: ${error.message}`);
  }

  return message;
}

/**
 * Get the last N chat messages for context
 *
 * @param ideaId - Idea UUID
 * @param limit - Number of messages to retrieve (default: 10)
 * @returns Array of recent messages ordered by created_at ASC
 */
export async function getRecentChatMessages(ideaId: string, limit: number = 10) {
  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('idea_id', ideaId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get recent chat messages: ${error.message}`);
  }

  // Reverse to get chronological order (oldest to newest)
  return (messages || []).reverse();
}

/**
 * Delete all chat messages for an idea
 *
 * @param ideaId - Idea UUID
 */
export async function deleteChatMessages(ideaId: string) {
  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('idea_id', ideaId);

  if (error) {
    throw new Error(`Failed to delete chat messages: ${error.message}`);
  }

  return { success: true };
}
