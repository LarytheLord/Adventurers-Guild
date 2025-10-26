/**
 * Authentication middleware for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuthenticationError, AuthorizationError } from '@/lib/errors';
import type { UserRole } from '@/types';

type ApiHandler = (
  req: NextRequest,
  context: { session: any; params?: any }
) => Promise<NextResponse>;

/**
 * Wraps an API route handler with authentication
 * @param handler - The API route handler
 * @param options - Configuration options
 */
export function withAuth(
  handler: ApiHandler,
  options?: {
    requiredRole?: UserRole | UserRole[];
  }
) {
  return async (req: NextRequest, context?: any) => {
    try {
      // Get session - cast authOptions to any to avoid type issues with next-auth v4
      const session = await getServerSession(authOptions as any) as any;

      // Check if user is authenticated
      if (!session || !session.user) {
        throw new AuthenticationError('You must be logged in to access this resource');
      }

      // Check role-based access if required
      if (options?.requiredRole) {
        const requiredRoles = Array.isArray(options.requiredRole)
          ? options.requiredRole
          : [options.requiredRole];

        if (!requiredRoles.includes(session.user.role)) {
          throw new AuthorizationError(
            `This resource requires one of the following roles: ${requiredRoles.join(', ')}`
          );
        }
      }

      // Call the handler with session
      return await handler(req, { session, params: context?.params });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 401 }
        );
      }

      if (error instanceof AuthorizationError) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 403 }
        );
      }

      // Re-throw other errors to be handled by error handler
      throw error;
    }
  };
}

/**
 * Example usage:
 * 
 * export const GET = withAuth(
 *   async (req, { session }) => {
 *     // Your handler logic
 *     return NextResponse.json({ user: session.user });
 *   },
 *   { requiredRole: 'admin' }
 * );
 */
