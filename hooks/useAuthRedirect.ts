import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getDashboardPath, hasCompletedRankTest } from '@/lib/authUtils'

/**
 * Hook to handle authentication redirects based on user role and state
 * @param options - Configuration options
 */
export function useAuthRedirect(options?: {
  requireAuth?: boolean
  redirectToDashboard?: boolean
  requireRankTest?: boolean
}) {
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  
  const {
    requireAuth = true,
    redirectToDashboard = false,
    requireRankTest = false
  } = options || {}

  useEffect(() => {
    // Don't do anything if still loading
    if (loading) return

    // If auth is required and user is not logged in, redirect to login
    if (requireAuth && !user) {
      router.push('/login')
      return
    }

    // If user is logged in but we want to redirect to dashboard
    if (user && redirectToDashboard && profile) {
      // For new student users, check if they need to take the rank test
      if (profile.role === 'student' && 
          requireRankTest && 
          !hasCompletedRankTest() && 
          process.env.NEXT_PUBLIC_ENABLE_AI_RANK_TEST === 'true') {
        router.push('/ai-rank-test/welcome')
      } else {
        const dashboardPath = getDashboardPath(profile)
        router.push(dashboardPath)
      }
      return
    }
  }, [user, profile, loading, requireAuth, redirectToDashboard, requireRankTest, router])

  return { user, profile, loading }
}