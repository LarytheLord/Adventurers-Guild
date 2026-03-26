import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { authOptions } from '@/lib/auth';
import type { UserRole } from '@prisma/client';
import type { NextRequest } from 'next/server';

export interface SessionUser {
  id: string;
  role: UserRole;
  email?: string | null;
  name?: string | null;
  rank?: string;
  xp?: number;
}

/**
 * Get the authenticated user from the session.
 * Returns null if not authenticated.
 */
export async function getAuthUser(request?: NextRequest): Promise<SessionUser | null> {
  if (request) {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) return null;

    // Try multiple cookie modes — mirrors middleware.ts to prevent
    // "middleware passes but API returns 401" mismatch
    const token =
      (await getToken({ req: request, secret })) ??
      (await getToken({ req: request, secret, secureCookie: true })) ??
      (await getToken({ req: request, secret, secureCookie: false })) ??
      (await getToken({ req: request, secret, cookieName: '__Secure-next-auth.session-token' })) ??
      (await getToken({ req: request, secret, cookieName: 'next-auth.session-token' }));
    if (!token) return null;

    const id = typeof token.id === 'string' ? token.id : token.sub;
    const role = token.role as UserRole | undefined;
    if (!id || !role) return null;

    return {
      id,
      role,
      email: token.email,
      name: token.name,
      rank: typeof token.rank === 'string' ? token.rank : undefined,
      xp: typeof token.xp === 'number' ? token.xp : undefined,
    };
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user as SessionUser;
}

/**
 * Check if the authenticated user has one of the required roles.
 * Returns the user if authorized, null otherwise.
 */
export async function requireAuth(...roles: UserRole[]): Promise<SessionUser | null>;
export async function requireAuth(request: NextRequest, ...roles: UserRole[]): Promise<SessionUser | null>;
export async function requireAuth(
  requestOrRole?: NextRequest | UserRole,
  ...roles: UserRole[]
): Promise<SessionUser | null> {
  const hasRequest =
    !!requestOrRole &&
    typeof requestOrRole === 'object' &&
    'headers' in requestOrRole &&
    'nextUrl' in requestOrRole;

  const request = hasRequest ? (requestOrRole as NextRequest) : undefined;
  const requiredRoles = hasRequest
    ? roles
    : ([requestOrRole, ...roles].filter(Boolean) as UserRole[]);

  const user = await getAuthUser(request);
  if (!user) return null;
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) return null;
  return user;
}
