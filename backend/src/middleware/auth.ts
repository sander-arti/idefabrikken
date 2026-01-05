import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

/**
 * Supabase client for JWT verification
 * Uses service role key to verify user tokens
 */
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

/**
 * Custom error class for authentication failures
 */
export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Middleware to authenticate JWT tokens from Supabase Auth
 *
 * Verifies the Bearer token in the Authorization header and
 * attaches the user information to req.user.
 *
 * Uses Supabase's built-in verification which supports both HS256 and ES256 algorithms.
 *
 * Usage:
 *   router.get('/protected', requireAuth, handler)
 */
export async function authenticateToken(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthError('Missing or invalid Authorization header');
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    // Verify token using Supabase (supports ES256 and HS256)
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new AuthError('Invalid token');
    }

    // Attach user info to request
    req.user = {
      id: data.user.id,
      email: data.user.email,
      role: data.user.role,
    };

    next();
  } catch (error) {
    if (error instanceof AuthError) {
      return next(error);
    }
    return next(new AuthError('Invalid token'));
  }
}

/**
 * Alias for authenticateToken for more readable route definitions
 *
 * Usage:
 *   router.get('/protected', requireAuth, handler)
 */
export const requireAuth = authenticateToken;
