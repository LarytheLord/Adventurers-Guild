'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Star,
  TrendingUp,
  Target,
  Clock,
  CheckCircle,
  Award,
  ArrowRight,
  RefreshCw,
  BarChart3,
  Brain,
  Code,
  Zap,
  Activity,
  Lightbulb,
  Users,
  DollarSign,
  Calendar,
  Download
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Enhanced mock results data with AI analysis
const mockResults = {
  overallScore: 756,
  rank: 'Gold',
  percentile: 78,
  timeSpent: 28, // minutes
  problemsSolved: 3,
  totalProblems: 5,
  accuracy: 89,
  efficiency: 76,
  breakdown: {
    'Algorithmic Thinking': 85,
    'Data Structures': 72,
    'Code Quality': 88,
    'Problem Solving': 91,
    'Time Complexity': 68,
    'Space Optimization': 74
  },
  aiAnalysis: {
    codingStyle: 'Clean and readable with consistent formatting',
    problemApproach: 'Methodical problem decomposition with logical flow',
    efficiency: 'Good time complexity awareness, room for space optimization',
    bestPractices: 'Follows naming conventions and includes helpful comments'
  },
  performanceMetrics: {
    keystrokesPerMinute: 45,
    averageThinkingTime: '2.3 minutes',
    codeExecutionSuccess: '94%',
    testCasesPassed: '17/19'
  },
  strengths: [
    'Excellent algorithmic problem-solving approach',
    'Clean, readable code with good variable naming',
    'Strong understanding of time complexity analysis',
    'Efficient debugging and error correction skills',
    'Good use of built-in data structures and methods'
  ],
  improvements: [
    'Focus on space complexity optimization techniques',
    'Practice more advanced data structures (trees, graphs)',
    'Improve handling of edge cases and boundary conditions',
    'Work on dynamic programming concepts',
    'Enhance system design thinking for scalable solutions'
  ],
  nextSteps: [
    {
      title: 'Master Advanced Data Structures',
      description: 'Study binary trees, graphs, and hash maps in depth',
      timeEstimate: '2-3 weeks',
      resources: ['LeetCode medium problems', 'Algorithm textbooks']
    },
    {
      title: 'Dynamic Programming Practice',
      description: 'Learn memoization and tabulation techniques',
      timeEstimate: '3-4 weeks', 
      resources: ['DP pattern problems', 'Online courses']
    },
    {
      title: 'System Design Fundamentals',
      description: 'Understand scalability and architecture concepts',
      timeEstimate: '4-6 weeks',
      resources: ['System design interviews', 'Architecture blogs']
    }
  ],
  questRecommendations: [
    {
      type: 'Web Development',
      budgetRange: '$1,500 - $4,000',
      difficulty: 'Intermediate',
      description: 'Full-stack applications with modern frameworks'
    },
    {
      type: 'API Development', 
      budgetRange: '$800 - $2,500',
      difficulty: 'Intermediate',
      description: 'RESTful services and database integration'
    },
    {
      type: 'Mobile Apps',
      budgetRange: '$2,000 - $5,000', 
      difficulty: 'Intermediate',
      description: 'Cross-platform mobile application development'
    }
  ]
}

const rankDetails = {
  'Bronze': { 
    color: 'bg-gradient-to-br from-amber-600 to-amber-700', 
    textColor: 'text-amber-600',
    name: 'Bronze Adventurer', 
    range: '0-299',
    icon: '🥉',
    description: 'Entry-level adventurer ready for basic quests'
  },
  'Silver': { 
    color: 'bg-gradient-to-br from-gray-400 to-gray-500', 
    textColor: 'text-gray-500',
    name: 'Silver Adventurer', 
    range: '300-599',
    icon: '🥈', 
    description: 'Competent adventurer capable of intermediate challenges'
  },
  'Gold': { 
    color: 'bg-gradient-to-br from-yellow-500 to-yellow-600', 
    textColor: 'text-yellow-600',
    name: 'Gold Adventurer', 
    range: '600-799',
    icon: '🥇',
    description: 'Skilled adventurer trusted with complex projects'
  },
  'Platinum': { 
    color: 'bg-gradient-to-br from-blue-500 to-blue-600', 
    textColor: 'text-blue-600',
    name: 'Platinum Adventurer', 
    range: '800-949',
    icon: '💎',
    description: 'Expert adventurer sought after for premium quests'
  },
  'Diamond': { 
    color: 'bg-gradient-to-br from-purple-600 to-purple-700', 
    textColor: 'text-purple-600',
    name: 'Diamond Adventurer', 
    range: '950-1000',
    icon: '👑',
    description: 'Elite adventurer capable of the most challenging quests'
  }
}

export default function AIRankTestResults() {
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(true)
  const [animatedScore, setAnimatedScore] = useState(0)
  const [showDetails, setShowDetails] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // Get stored results or use mock data
    const storedScore = localStorage.getItem('testScore')
    const finalScore = storedScore ? parseInt(storedScore) : mockResults.overallScore
    
    // Determine rank based on score
    let rank = 'Bronze'
    if (finalScore >= 950) rank = 'Diamond'
    else if (finalScore >= 800) rank = 'Platinum' 
    else if (finalScore >= 600) rank = 'Gold'
    else if (finalScore >= 300) rank = 'Silver'
    
    // Update mockResults with actual data
    mockResults.overallScore = finalScore
    mockResults.rank = rank
    
    // Animate score counter
    const interval = setInterval(() => {
      setAnimatedScore(prev => {
        if (prev >= finalScore) {
          clearInterval(interval)
          setTimeout(() => setShowDetails(true), 500)
          return finalScore
        }
        return prev + Math.ceil((finalScore - prev) / 15)
      })
    }, 50)

    setIsLoading(false)
    
    return () => clearInterval(interval)
  }, [])

  const handleReturnToDashboard = () => {
    toast.success(`Congratulations! You've achieved ${mockResults.rank} rank! 🎉`, {
      description: 'Your new rank unlocks better quests and higher pay rates.'
    })
    router.push('/dashboard/adventurer')
  }

  const handleRetakeTest = () => {
    if (confirm('Are you sure you want to retake the test? This will replace your current score and rank.')) {
      localStorage.removeItem('hasCompletedRankTest')
      localStorage.removeItem('testScore')
      localStorage.removeItem('currentRank')
      router.push('/ai-rank-test/welcome')
    }
  }

  const handleDownloadReport = () => {
    toast.success('Detailed report downloaded!', {
      description: 'Check your downloads folder for the PDF report.'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
              <Brain className="absolute inset-0 m-auto h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Analysis in Progress</h3>
            <p className="text-muted-foreground mb-4">
              Our advanced AI is analyzing your code quality, problem-solving approach, and technical skills...
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>✓ Code execution analysis complete</div>
              <div>✓ Algorithm efficiency evaluated</div>
              <div>⏳ Ranking calculation in progress...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  type Rank = keyof typeof rankDetails;

  const rankDetail = rankDetails[mockResults.rank as Rank] || rankDetails['Bronze']

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Celebration Header */}
        <div className="text-center mb-8">
          <div className="relative mb-6">
            <div className="absolute inset-0 animate-ping">
              <div className={`w-24 h-24 rounded-full ${rankDetail.color} opacity-20 mx-auto`}></div>
            </div>
            <div className={`relative w-24 h-24 rounded-full ${rankDetail.color} flex items-center justify-center text-4xl mx-auto shadow-2xl`}>
              {rankDetail.icon}
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            🎉 Assessment Complete!
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Your AI-powered skill evaluation is ready
          </p>
          <Badge variant="secondary" className="px-4 py-2">
            <Brain className="w-4 h-4 mr-2" />
            Analyzed by Advanced AI
          </Badge>
        </div>

        {/* Main Results Card */}
        <Card className="mb-8 border-2 shadow-2xl">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Score Display */}
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${rankDetail.color} text-white text-4xl font-bold mb-4 shadow-xl`}>
                  {rankDetail.icon}
                </div>
                <h2 className="text-3xl font-bold mb-2">{rankDetail.name}</h2>
                <p className="text-muted-foreground mb-4">{rankDetail.description}</p>
                <Badge variant="outline" className="mb-4">
                  {rankDetail.range} points range
                </Badge>
              </div>
              
              {/* Score Metrics */}
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary mb-2">
                    {animatedScore}
                  </div>
                  <p className="text-lg text-muted-foreground">Final Score</p>
                </div>

                {showDetails && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{mockResults.percentile}%</div>
                      <div className="text-sm text-muted-foreground">Percentile</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{mockResults.problemsSolved}/{mockResults.totalProblems}</div>
                      <div className="text-sm text-muted-foreground">Problems</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{mockResults.accuracy}%</div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{mockResults.timeSpent}m</div>
                      <div className="text-sm text-muted-foreground">Time Used</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {showDetails && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
              <TabsTrigger value="improvement">Growth Plan</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Skill Assessment Breakdown
                  </CardTitle>
                  <CardDescription>
                    Your performance across key technical areas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {Object.entries(mockResults.breakdown).map(([skill, score]) => (
                      <div key={skill} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{skill}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono">{score}/100</span>
                            <Badge 
                              variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"}
                              className="text-xs"
                            >
                              {score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Work"}
                            </Badge>
                          </div>
                        </div>
                        <div className="relative">
                          <Progress value={score} className="h-3" />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-green-200 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      Key Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {mockResults.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Star className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 dark:border-orange-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                      <TrendingUp className="w-5 h-5" />
                      Growth Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {mockResults.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Target className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* AI Analysis Tab */}
            <TabsContent value="analysis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    Advanced AI Code Analysis
                  </CardTitle>
                  <CardDescription>
                    Deep insights from our proprietary AI evaluation system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    {Object.entries(mockResults.aiAnalysis).map(([category, analysis]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="font-semibold capitalize flex items-center gap-2">
                          {category === 'codingStyle' && <Code className="w-4 h-4" />}
                          {category === 'problemApproach' && <Lightbulb className="w-4 h-4" />}
                          {category === 'efficiency' && <Zap className="w-4 h-4" />}
                          {category === 'bestPractices' && <CheckCircle className="w-4 h-4" />}
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                          {analysis}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(mockResults.performanceMetrics).map(([metric, value]) => (
                      <div key={metric} className="text-center p-4 bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg">
                        <div className="font-bold text-lg">{value}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {metric.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Growth Plan Tab */}
            <TabsContent value="improvement" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="w-5 h-5" />
                    Personalized Learning Path
                  </CardTitle>
                  <CardDescription>
                    AI-curated recommendations based on your assessment results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {mockResults.nextSteps.map((step, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{step.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {step.timeEstimate}
                              </div>
                            </div>
                            <div className="mt-3">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Recommended Resources:</p>
                              <div className="flex flex-wrap gap-2">
                                {step.resources.map((resource, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {resource}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Opportunities Tab */}
            <TabsContent value="opportunities" className="space-y-6">
              <Alert>
                <Award className="h-4 w-4" />
                <AlertDescription>
                  <strong>Congratulations!</strong> Your {rankDetail.name} status unlocks access to premium quests 
                  with higher budgets and more challenging technical requirements. Companies actively seek 
                  adventurers with your skill level.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Quest Opportunities
                  </CardTitle>
                  <CardDescription>
                    Types of quests now available to you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {mockResults.questRecommendations.map((quest, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{quest.type}</h4>
                          <Badge>{quest.difficulty}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{quest.description}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-600">{quest.budgetRange}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Community & Network
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Badge className="bg-gradient-to-r from-primary to-primary/80">
                        {mockResults.rank}
                      </Badge>
                      <div>
                        <p className="font-medium text-sm">Join the {mockResults.rank} Adventurers Community</p>
                        <p className="text-xs text-muted-foreground">Connect with peers at your skill level</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="font-bold text-blue-600">156</div>
                        <div className="text-xs text-muted-foreground">Active {mockResults.rank} Members</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="font-bold text-green-600">42</div>
                        <div className="text-xs text-muted-foreground">Available Mentors</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {showDetails && (
          <div className="mt-8">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button 
                size="lg" 
                onClick={handleReturnToDashboard}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Explore Your Dashboard
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleDownloadReport}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleRetakeTest}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retake Assessment
              </Button>
            </div>

            {/* Footer Message */}
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardContent className="pt-6 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Keep Growing Your Skills!</h3>
                <p className="text-sm text-muted-foreground">
                  Complete quests to gain experience points and unlock new opportunities. 
                  You can retake this assessment every 30 days to improve your rank.
                </p>
                <div className="mt-4 text-xs text-muted-foreground">
                  Next assessment available: <span className="font-medium">{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}