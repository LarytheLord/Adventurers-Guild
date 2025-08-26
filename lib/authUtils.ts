import { Database } from '@/types/supabase'

type UserProfile = Database['public']['Tables']['users']['Row']

/**
 * Get the appropriate dashboard path based on user role
 * @param profile - User profile object
 * @returns Dashboard path for the user's role
 */
export function getDashboardPath(profile: UserProfile | null): string {
  if (!profile) {
    return '/login'
  }

  switch (profile.role) {
    case 'student':
      return '/dashboard/adventurer'
    case 'company':
      return '/company/dashboard'
    case 'admin':
      return '/admin/dashboard'
    case 'client':
      return '/client/dashboard'
    default:
      return '/dashboard/adventurer' // Default fallback
  }
}

/**
 * Check if user has completed the rank test
 * @returns boolean indicating if user has completed the rank test
 */
export function hasCompletedRankTest(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('hasCompletedRankTest') === 'true'
}

/**
 * Mark that user has completed the rank test
 */
export function markRankTestCompleted(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('hasCompletedRankTest', 'true')
}