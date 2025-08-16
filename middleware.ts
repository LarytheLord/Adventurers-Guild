import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/auth/callback',
  '/auth/reset-password',
  '/auth/forgot-password',
  '/about',
  '/how-it-works',
  '/quests',
  '/contact',
  '/privacy-policy',
  '/terms-of-service',
  '/test'
]

// Define role-based route access
const roleBasedRoutes = {
  '/dashboard/adventurer': ['student', 'admin'],
  '/dashboard/quest-giver': ['company', 'admin'],
  '/company/dashboard': ['company', 'admin'],
  '/dashboard/admin': ['admin'],
  '/ai-rank-test': ['student', 'admin']
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Create a Supabase client configured for middleware
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // Allow public routes and static files
  if (isPublicRoute || pathname.startsWith('/_next') || pathname.startsWith('/api/public')) {
    return response
  }

  // Get the session
  const { data: { session }, error } = await supabase.auth.getSession()

  // If no session and trying to access protected route, redirect to login
  if (!session) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Get user profile with role
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!userProfile) {
    // User exists in auth but not in profiles table - redirect to complete profile
    if (pathname !== '/auth/complete-profile') {
      return NextResponse.redirect(new URL('/auth/complete-profile', request.url))
    }
    return response
  }

  // Check role-based access
  for (const [route, allowedRoles] of Object.entries(roleBasedRoutes)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(userProfile.role as string)) {
        // Redirect to appropriate dashboard based on role
        const redirectPath = userProfile.role === 'company' 
          ? '/company/dashboard' 
          : userProfile.role === 'admin'
          ? '/dashboard/admin'
          : '/dashboard/adventurer'
        
        return NextResponse.redirect(new URL(redirectPath, request.url))
      }
    }
  }

  // Add user role to request headers for use in API routes
  response.headers.set('x-user-role', userProfile.role as string)
  response.headers.set('x-user-id', session.user.id)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - images folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|images).*)',
  ],
}
