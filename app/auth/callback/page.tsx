'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getDashboardPath, hasCompletedRankTest } from '@/lib/authUtils'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error] = useState<string | null>(null)

  const { profile } = useAuth()

  useEffect(() => {
    // For mock auth, we just redirect based on profile
    if (profile) {
      // Redirect based on role using our utility function
      const dashboardPath = getDashboardPath(profile)
      
      // Check if this is a new student user who needs to take the rank test
      if (profile.role === 'student' && 
          !hasCompletedRankTest() && 
          process.env.NEXT_PUBLIC_ENABLE_AI_RANK_TEST === 'true') {
        router.push('/ai-rank-test/welcome')
      } else {
        router.push(dashboardPath)
      }
    } else {
      // No session, redirect to login after a short delay
      setTimeout(() => {
        router.push('/login')
      }, 1000)
    }
  }, [profile, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {error ? 'Authentication Error' : 'Completing Sign In...'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <>
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p className="text-muted-foreground text-center">
                Please wait while we complete your sign in...
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
