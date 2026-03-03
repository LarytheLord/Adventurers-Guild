import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from '@/types';

// Define protected routes and their required roles
const protectedRoutes: { [key: string]: UserRole[] } = {
  '/dashboard': ['adventurer', 'company'],
  '/dashboard/quests': ['adventurer', 'company'],
  '/dashboard/my-quests': ['adventurer'],
  '/dashboard/completed-quests': ['adventurer'],
  '/dashboard/skill-tree': ['adventurer'],
  '/dashboard/teams': ['adventurer', 'company'],
  '/dashboard/leaderboard': ['adventurer', 'company'],
  '/dashboard/profile': ['adventurer', 'company'],
  '/dashboard/company': ['company'],
  '/dashboard/company/quests': ['company'],
  '/dashboard/company/create-quest': ['company'],
  '/dashboard/company/analytics': ['company'],
  '/dashboard/company/profile': ['company'],
  '/admin': ['admin'],
};

export async function middleware(request: NextRequest) {
  // Check if the route is protected
  const pathname = request.nextUrl.pathname;
  
  // Find the most specific matching route (Longest Prefix Match)
  // This prevents /dashboard (adventurer) from overriding /dashboard/company (company only)
  const sortedRoutes = Object.keys(protectedRoutes).sort((a, b) => b.length - a.length);

  for (const route of sortedRoutes) {
    // Match if exact path OR if path starts with route + '/' (to avoid /dash matching /dashboard)
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return await checkAuthAndRole(request, protectedRoutes[route]);
    }
  }

  // If not a protected route, continue
  return NextResponse.next();
}

async function checkAuthAndRole(request: NextRequest, requiredRoles: UserRole[]) {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      throw new Error('NEXTAUTH_SECRET is not configured');
    }

    // Try all common cookie modes to avoid secure-cookie mismatches on Edge.
    const token =
      (await getToken({ req: request, secret })) ??
      (await getToken({ req: request, secret, secureCookie: true })) ??
      (await getToken({ req: request, secret, secureCookie: false })) ??
      (await getToken({
        req: request,
        secret,
        cookieName: '__Secure-next-auth.session-token',
      })) ??
      (await getToken({
        req: request,
        secret,
        cookieName: 'next-auth.session-token',
      }));
    
    if (!token) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Middleware] No token found, redirecting to login:', request.url);
      }
      // Redirect to login if not authenticated
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(url);
    }

    // Check if user has required role
    const userRole = token.role as UserRole;
    
    if (!userRole) {
      // User role not found in token
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(url);
    }

    // Check if user has required role
    if (!requiredRoles.includes(userRole)) {
      // User doesn't have required role, redirect to home
      return NextResponse.redirect(new URL('/home', request.url));
    }

    // User is authenticated and authorized, continue
    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    // On error, redirect to login
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(url);
  }
}

// Define which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
