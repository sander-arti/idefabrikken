import { z } from 'zod';
import { config } from 'dotenv';

// Load .env file before validation
config();

/**
 * Environment Variable Schema
 *
 * Validates required environment variables on startup.
 * Server will not start if any variable is missing or invalid.
 */
const envSchema = z.object({
  // Supabase
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_KEY: z.string().min(1, 'SUPABASE_SERVICE_KEY is required'),

  // OpenAI
  OPENAI_API_KEY: z.string().startsWith('sk-', 'OPENAI_API_KEY must start with sk-'),

  // Server
  PORT: z.string().regex(/^\d+$/, 'PORT must be a number').transform(Number).default('4000'),
  ALLOWED_ORIGINS: z.string().min(1, 'ALLOWED_ORIGINS is required'),

  // Node environment (optional)
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Validated environment variables
 *
 * @throws {Error} If any required environment variable is missing or invalid
 */
export const env = envSchema.parse(process.env);

/**
 * Type for environment variables
 */
export type Env = z.infer<typeof envSchema>;
