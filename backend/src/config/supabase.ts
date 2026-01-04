import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.js';
import type { Database } from '../lib/db/types.js';

/**
 * Supabase Client Singleton
 *
 * Provides a single instance of the Supabase client with typed database schema.
 * Uses service_role key for full database access (backend only).
 *
 * ⚠️ SECURITY: Never expose this client in frontend code.
 */
let supabaseInstance: SupabaseClient<Database> | null = null;

/**
 * Get or create Supabase client instance
 *
 * @returns Typed Supabase client with full database access
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  return supabaseInstance;
}

/**
 * Convenience export - use this in your code
 */
export const supabase = getSupabaseClient();
