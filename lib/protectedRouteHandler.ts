import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Get user session from request
 * @param request - Next.js request object
 * @returns User session or null if not authenticated
 */
export async function getUserSession(request: NextRequest) {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * Get user profile with role
 * @param userId - User ID
 * @returns User profile or null if not found
 */
export async function getUserProfile(userId: string) {
  const supabase = createSupabaseServerClient()
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  return profile
}

/**
 * Check if user has required role
 * @param userRole - User's role
 * @param requiredRoles - Array of roles that are allowed
 * @returns boolean indicating if user has required role
 */
export function hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole)
}

/**
 * Create a protected API route handler
 * @param handler - Original handler function
 * @param requiredRoles - Array of roles that are allowed to access this route
 * @returns Protected handler function
 */
export function withRoleProtection(
  handler: (request: NextRequest, context: { user: {id: string, email?: string}, profile: {id: string, role: string}, params?: {[key: string]: string} }) => Promise<NextResponse>,
  requiredRoles: string[] = []
) {
  return async function protectedHandler(request: NextRequest, context?: { params: {[key: string]: string} }): Promise<NextResponse> {
    try {
      // Get session
      const session = await getUserSession(request)
      
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Get user profile
      const profile = await getUserProfile(session.user.id)
      
      if (!profile) {
        return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
      }

      // Check role requirements
      if (requiredRoles.length > 0 && !hasRequiredRole(profile.role, requiredRoles)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      // Call original handler with user context
      return handler(request, { user: session.user, profile, params: context?.params })
    } catch (error) {
      console.error('Error in protected route:', error)
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
  }
}