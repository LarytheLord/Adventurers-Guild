'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Brain, 
  Code, 
  Trophy, 
  Zap, 
  ChevronRight, 
  Info,
  Timer,
  Target,
  Award,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export default function AIRankTestWelcome() {
  const router = useRouter()
  const { profile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleStartTest = () => {
    setIsLoading(true)
    router.push('/ai-rank-test/assessment')
  }

  const handleSkipTest = async () => {
    setIsLoading(true)
    // Store that user skipped the test
    localStorage.setItem('hasCompletedRankTest', 'true')
    localStorage.setItem('rankTestSkipped', 'true')
    
    // Redirect to dashboard
    router.push('/dashboard/adventurer')
  }

  const benefits = [
    {
      icon: <Trophy className="w-5 h-5" />,
      title: 'Start at a Higher Rank',
      description: 'Skip the grind and begin your journey at a rank that matches your skills'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Unlock Better Quests',
      description: 'Access higher-paying and more challenging quests immediately'
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: 'Earn Bonus XP',
      description: 'Get up to 1000 XP based on your test performance'
    }
  ]

  const testInfo = {
    duration: '30-60 minutes',
    questions: '3-5 coding challenges',
    languages: ['JavaScript', 'TypeScript', 'Python'],
    difficulty: 'Adaptive based on performance'
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">AI-Powered Rank Assessment</h1>
          <p className="text-xl text-muted-foreground">
            Let our AI evaluate your skills and place you at the right rank
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {benefit.icon}
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Test Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Test Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Timer className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">{testInfo.duration}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Code className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Format</p>
                    <p className="text-sm text-muted-foreground">{testInfo.questions}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Difficulty</p>
                    <p className="text-sm text-muted-foreground">{testInfo.difficulty}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Code className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Languages</p>
                    <div className="flex gap-2 mt-1">
                      {testInfo.languages.map((lang) => (
                        <Badge key={lang} variant="secondary">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> This test is optional. You can skip it and start at F-rank, 
            working your way up through completing quests. The test is designed to help experienced 
            developers start at an appropriate level.
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={handleStartTest}
            disabled={isLoading}
            className="min-w-[200px]"
          >
            Start Assessment
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={handleSkipTest}
            disabled={isLoading}
            className="min-w-[200px]"
          >
            Skip to F-Rank
          </Button>
        </div>

        {/* Current Rank Display */}
        {profile && (
          <div className="text-center mt-8 text-sm text-muted-foreground">
            Current Rank: <Badge variant="outline">{profile.rank || 'F'}-Rank</Badge>
          </div>
        )}
      </div>
    </div>
  )
}
