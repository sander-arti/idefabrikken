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
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_JWT_SECRET: z.string().min(1, 'SUPABASE_JWT_SECRET is required'),

  // OpenAI
  OPENAI_API_KEY: z.string().startsWith('sk-', 'OPENAI_API_KEY must start with sk-'),

  // Perplexity
  PERPLEXITY_API_KEY: z.string().min(1, 'PERPLEXITY_API_KEY is required'),
  PERPLEXITY_BASE_URL: z.string().url().default('https://api.perplexity.ai'),
  PERPLEXITY_RESEARCH_DEPTH: z.enum(['low', 'medium', 'high']).default('medium'),

  // AI Models
  RESEARCH_MODEL: z.string().default('sonar-deep-research'),
  SYNTHESIS_MODEL: z.string().default('gpt-4o'), // Will be gpt-5.2 when available

  // Feature Flags
  USE_TWO_STEP_EVALUATION: z.enum(['true', 'false']).default('true').transform((val) => val === 'true'),
  RESEARCH_FAILURE_MODE: z.enum(['degrade', 'fail']).default('fail'),

  // Rate Limiting
  PERPLEXITY_MAX_CONCURRENT: z.string().regex(/^\d+$/).transform(Number).default('3'),
  PERPLEXITY_REQUESTS_PER_MINUTE: z.string().regex(/^\d+$/).transform(Number).default('20'),

  // Timeouts (in milliseconds)
  // Note: Perplexity Deep Research can take 3-10 minutes per query
  PERPLEXITY_TIMEOUT_MS: z.string().regex(/^\d+$/).transform(Number).default('600000'), // 10 minutes
  SYNTHESIS_TIMEOUT_MS: z.string().regex(/^\d+$/).transform(Number).default('300000'),  // 5 minutes

  // HTTP server timeout (should be higher than longest operation)
  SERVER_TIMEOUT_MS: z.string().regex(/^\d+$/).transform(Number).default('900000'),     // 15 minutes

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
