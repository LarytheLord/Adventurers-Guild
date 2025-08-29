'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Code, Zap, Brain, Target, Shield, Trophy, Lightbulb, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function AIRankTestWelcome() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)
  const [hasCompletedTest, setHasCompletedTest] = useState(false);

  useEffect(() => {
    if (!loading && !profile) {
      router.push('/login')
    }
    setHasCompletedTest(localStorage.getItem('hasCompletedRankTest') === 'true');
  }, [loading, profile, router]);

  const handleStartTest = async () => {
    setIsStarting(true)
    // Simulate AI system preparation
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.success('Initializing AI Assessment System...')
    router.push('/ai-rank-test/assessment')
  }

  const handleSkipTest = async () => {
    if (confirm('Are you sure you want to skip the rank test? You will start at Bronze rank.')) {
      localStorage.setItem('hasCompletedRankTest', 'true')
      localStorage.setItem('rankTestSkipped', 'true')
      localStorage.setItem('currentRank', 'Bronze')
      toast.info('Starting at Bronze rank - you can improve through quest completion!')
      router.push('/dashboard/adventurer')
    }
  }

  const handleRetakeTest = () => {
    if (confirm('Are you sure you want to retake the test? This will override your current rank.')) {
      localStorage.removeItem('hasCompletedRankTest')
      localStorage.removeItem('currentRank')
      handleStartTest()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AI-Powered Skill Assessment
          </h1>
          <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            Unlock your true potential with our advanced AI evaluation system. Get ranked based on your actual skills, not just experience.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className="text-sm">
              <Shield className="w-3 h-3 mr-1" />
              Secure & Fair
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Trophy className="w-3 h-3 mr-1" />
              Industry Standard
            </Badge>
          </div>
        </div>

        {/* Status Alert */}
        {hasCompletedTest && (
          <Alert className="mb-8 border-green-200 bg-green-50 dark:bg-green-900/10">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              You&apos;ve already completed your rank test! Your current rank is <strong>{localStorage.getItem('currentRank') || 'Bronze'}</strong>. 
              You can retake the test to potentially improve your rank.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* How It Works */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                Advanced AI Assessment Process
              </CardTitle>
              <CardDescription>
                Our proprietary AI system evaluates multiple aspects of your coding abilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Dynamic Problem Generation</h4>
                      <p className="text-sm text-muted-foreground">
                        AI creates personalized coding challenges based on your responses
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Real-time Code Analysis</h4>
                      <p className="text-sm text-muted-foreground">
                        Every keystroke is analyzed for patterns, efficiency, and best practices
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Multi-dimensional Scoring</h4>
                      <p className="text-sm text-muted-foreground">
                        Algorithm efficiency, code quality, problem-solving approach
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <Lightbulb className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Adaptive Difficulty</h4>
                      <p className="text-sm text-muted-foreground">
                        Problems adjust in real-time based on your performance
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                Test Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border">
                  <div className="text-3xl font-bold text-primary mb-1">45</div>
                  <div className="text-sm text-muted-foreground">Minutes</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border">
                  <div className="text-3xl font-bold text-primary mb-1">5-8</div>
                  <div className="text-sm text-muted-foreground">Problems</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Supported Languages</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Badge variant="outline" className="justify-center py-2">
                    <Code className="w-3 h-3 mr-1" />
                    JavaScript
                  </Badge>
                  <Badge variant="outline" className="justify-center py-2">
                    <Code className="w-3 h-3 mr-1" />
                    Python
                  </Badge>
                  <Badge variant="outline" className="justify-center py-2">
                    <Code className="w-3 h-3 mr-1" />
                    TypeScript
                  </Badge>
                  <Badge variant="outline" className="justify-center py-2">
                    <Code className="w-3 h-3 mr-1" />
                    Java
                  </Badge>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Assessment Areas</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Algorithmic Thinking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Data Structures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Code Quality</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Problem Decomposition</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Optimization Skills</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ranking System */}
        <Card className="mt-8">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              Adventurer Ranking System
            </CardTitle>
            <CardDescription>
              Your rank determines quest accessibility and earning potential
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { 
                  rank: 'Bronze', 
                  color: 'bg-gradient-to-br from-amber-600 to-amber-700', 
                  range: '0-299',
                  icon: '🥉',
                  access: 'Basic quests, $10-50/hr'
                },
                { 
                  rank: 'Silver', 
                  color: 'bg-gradient-to-br from-gray-400 to-gray-500', 
                  range: '300-599',
                  icon: '🥈',
                  access: 'Intermediate quests, $25-75/hr'
                },
                { 
                  rank: 'Gold', 
                  color: 'bg-gradient-to-br from-yellow-500 to-yellow-600', 
                  range: '600-799',
                  icon: '🥇',
                  access: 'Advanced quests, $50-120/hr'
                },
                { 
                  rank: 'Platinum', 
                  color: 'bg-gradient-to-br from-blue-500 to-blue-600', 
                  range: '800-949',
                  icon: '💎',
                  access: 'Expert quests, $80-200/hr'
                },
                { 
                  rank: 'Diamond', 
                  color: 'bg-gradient-to-br from-purple-600 to-purple-700', 
                  range: '950-1000',
                  icon: '👑',
                  access: 'Elite quests, $150-500/hr'
                }
              ].map((tier) => (
                <div key={tier.rank} className="text-center group hover:scale-105 transition-transform">
                  <div className={`w-20 h-20 ${tier.color} rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:shadow-xl transition-shadow`}>
                    {tier.icon}
                  </div>
                  <div className="font-semibold text-lg">{tier.rank}</div>
                  <div className="text-xs text-muted-foreground mb-2">{tier.range} points</div>
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
                    {tier.access}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preparation Section */}
        <div className="grid gap-6 md:grid-cols-2 mt-8">
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                Prerequisites & Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm">Solid programming fundamentals (1+ years experience)</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm">Stable broadband internet (minimum 10 Mbps)</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm">Desktop/laptop with modern browser (Chrome recommended)</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm">Quiet environment for 45+ uninterrupted minutes</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm">Webcam access (for proctoring and identity verification)</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Lightbulb className="h-5 w-5" />
                Pro Tips for Maximum Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Start with brute force, then optimize - show your thought process</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Write clean, readable code with meaningful variable names</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Test with edge cases: empty inputs, single elements, large datasets</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Comment your approach for complex algorithms</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Time/space complexity analysis earns bonus points</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Don&apos;t get stuck - move to next problem and return later</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Important Notice */}
        <Alert className="mt-8 border-amber-200 bg-amber-50 dark:bg-amber-900/10">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>Important:</strong> This test uses advanced AI proctoring to ensure fairness. Any suspicious activity 
            (tab switching, copy-pasting, unauthorized tools) will result in automatic disqualification. 
            The test can only be retaken after a 7-day cooling period.
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="text-center mt-8">
          <div className="space-y-4">
            {hasCompletedTest ? (
              <div className="space-y-3">
                <Button 
                  size="lg" 
                  onClick={handleRetakeTest}
                  className="px-8 py-3 text-lg mr-4"
                >
                  Retake Assessment
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => router.push('/dashboard/adventurer')}
                  className="px-8 py-3 text-lg"
                >
                  Go to Dashboard
                </Button>
                <p className="text-sm text-muted-foreground">
                  Retaking will replace your current rank. Consider this carefully!
                </p>
              </div>
            ) : (
              <>
                <div className="space-x-4">
                  <Button 
                    size="lg" 
                    onClick={handleStartTest}
                    disabled={isStarting}
                    className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
                  >
                    {isStarting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Initializing AI System...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5 mr-2" />
                        Begin AI Assessment
                      </>
                    )}
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={handleSkipTest}
                    className="px-8 py-4 text-lg"
                  >
                    Skip to Bronze Rank
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  By starting this assessment, you agree to our AI proctoring terms and 
                  fair use policy. Your session will be monitored for integrity.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}