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
  
  // Check for exact matches first
 const exactMatch = protectedRoutes[pathname];
  if (exactMatch) {
    return await checkAuthAndRole(request, exactMatch);
  }
  
  // Check for partial matches (e.g., /dashboard/*)
  const basePath = pathname.split('/')[1] ? `/${pathname.split('/')[1]}` : '/';
  const partialMatch = protectedRoutes[basePath];
  if (partialMatch) {
    return await checkAuthAndRole(request, partialMatch);
  }

  // If not a protected route, continue
  return NextResponse.next();
}

async function checkAuthAndRole(request: NextRequest, requiredRoles: UserRole[]) {
  try {
    // Get the token from the request
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    if (!token) {
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