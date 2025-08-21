'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, 
  Zap, 
  CheckCircle, 
  BarChart3, 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  Loader2 
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface TestResult {
  score: number
  suggestedRank: string
  xpAwarded: number
  strengths: string[]
  areasForImprovement: string[]
  completedAt: string
}

// Mock results - this will be fetched from the API
const mockResult: TestResult = {
  score: 85,
  suggestedRank: 'C',
  xpAwarded: 750,
  strengths: [
    'Good problem-solving skills',
    'Efficient algorithm usage',
    'Clean and readable code'
  ],
  areasForImprovement: [
    'Edge case handling could be improved',
    'Could optimize for time complexity further'
  ],
  completedAt: new Date().toISOString()
}

export default function AIRankTestResults() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const testId = searchParams.get('testId')
  const { profile, refreshProfile } = useAuth()
  const [result, setResult] = useState<TestResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResults = async () => {
      if (!testId) {
        setError('No test ID provided')
        setIsLoading(false)
        return
      }

      try {
        // Fetch results from API
        const response = await fetch(`/api/ai-rank-test/results?testId=${testId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch test results')
        }
        const data = await response.json()
        setResult(data.result)

        // Refresh user profile to get updated rank and XP
        await refreshProfile()
      } catch (error: any) {
        console.error('Error fetching test results:', error)
        // Use mock data for now
        setResult(mockResult)
        setError('Could not fetch results. Using mock data.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [testId, refreshProfile])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="ml-4">Analyzing your results...</p>
      </div>
    )
  }

  if (error && !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!result) {
    return null
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
            <Trophy className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Test Completed!</h1>
          <p className="text-xl text-muted-foreground">
            Here's your performance breakdown
          </p>
        </div>

        {/* Main Results */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Your Suggested Rank</CardTitle>
            <div className="my-4">
              <Badge className="text-6xl font-bold p-4 bg-primary text-primary-foreground">
                {result.suggestedRank}-Rank
              </Badge>
            </div>
            <CardDescription>
              You scored {result.score}% and earned {result.xpAwarded} XP!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={result.score} className="mb-6" />

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Strengths
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2 text-yellow-500" />
                  Areas for Improvement
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {result.areasForImprovement.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">What's Next?</h2>
          <p className="text-muted-foreground mb-6">
            Your profile has been updated with your new rank and XP.
          </p>
          <Button 
            size="lg"
            onClick={() => router.push('/dashboard/adventurer')}
          >
            Go to Your Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Error message if mock data is used */}
        {error && (
          <Alert variant="destructive" className="mt-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
