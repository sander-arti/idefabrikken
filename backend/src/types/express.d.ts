/**
 * Express type extensions for authentication
 *
 * This file extends the Express Request interface to include
 * the authenticated user information set by the auth middleware.
 */

declare namespace Express {
  export interface Request {
    /**
     * Authenticated user information
     * Set by the requireAuth middleware after JWT verification
     */
    user?: {
      /** User ID from auth.users table */
      id: string;
      /** User email address */
      email?: string;
      /** User role (e.g., 'authenticated', 'service_role') */
      role?: string;
    };
  }
}
