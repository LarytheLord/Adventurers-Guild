import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export type UserRole = 'adventurer' | 'company' | 'admin';

interface SessionUser {
  id: string;
  role: UserRole;
  email: string;
  name: string;
}

/**
 * Get the authenticated user from the session.
 * Returns null if not authenticated.
 */
export async function getAuthUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user as SessionUser;
}

/**
 * Check if the authenticated user has one of the required roles.
 * Returns the user if authorized, null otherwise.
 */
export async function requireAuth(...roles: UserRole[]): Promise<SessionUser | null> {
  const user = await getAuthUser();
  if (!user) return null;
  if (roles.length > 0 && !roles.includes(user.role)) return null;
  return user;
}
