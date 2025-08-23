'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Play, 
  ChevronRight, 
  Timer,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Monaco Editor (dynamically imported to avoid SSR issues)
import dynamic from 'next/dynamic'
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
)

interface TestCase {
  input: Record<string, unknown>
  expectedOutput: unknown
  isHidden?: boolean
}

interface Problem {
  id: string
  title: string
  description: string
  examples: { input: string; output: string; explanation?: string }[]
  testCases: TestCase[]
  starterCode: { [key: string]: string }
  hints?: string[]
}

// Sample problems - these will be fetched from the API
const sampleProblems: Problem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]'
      }
    ],
    testCases: [
      { input: { nums: [2,7,11,15], target: 9 }, expectedOutput: [0,1] },
      { input: { nums: [3,2,4], target: 6 }, expectedOutput: [1,2] },
      { input: { nums: [3,3], target: 6 }, expectedOutput: [0,1], isHidden: true }
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
    // Your code here
    
}`,
      python: `def two_sum(nums, target):
    # Your code here
    pass`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
    // Your code here
    
}`
    },
    hints: [
      'Consider using a hash map to store values',
      'Think about the time complexity'
    ]
  }
]

interface TestResult {
    testCase: number;
    passed: boolean;
    input: Record<string, unknown>;
    expectedOutput: unknown;
    actualOutput: unknown;
    error: string | null;
}

export default function AIRankTestAssessment() {
  const router = useRouter()
  const { profile } = useAuth()
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0)
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [code, setCode] = useState('')
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(60 * 60) // 60 minutes
  const [showHints, setShowHints] = useState(false)

  const currentProblem = sampleProblems[currentProblemIndex]
  const totalProblems = sampleProblems.length
  const progress = ((currentProblemIndex + 1) / totalProblems) * 100

  useEffect(() => {
    // Initialize with starter code
    setCode(currentProblem.starterCode[selectedLanguage] || '')
  }, [currentProblemIndex, selectedLanguage, currentProblem.starterCode])

  const handleSubmitTest = async () => {
    setIsSubmitting(true)

    try {
      // Final submission to AI service
      const response = await fetch('/api/ai-rank-test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile?.id,
          completedProblems: currentProblemIndex + 1,
          totalTime: 3600 - timeRemaining
        })
      })

      const result = await response.json()
      
      // Store completion status
      localStorage.setItem('hasCompletedRankTest', 'true')
      
      // Redirect to results page
      router.push(`/ai-rank-test/results?testId=${result.testId}`)
    } catch (error) {
      console.error('Error submitting test:', error)
      // Fallback to dashboard
      router.push('/dashboard/adventurer')
    }
  }

  useEffect(() => {
    // Timer countdown
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          handleSubmitTest()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [handleSubmitTest])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleRunTests = async () => {
    setIsRunningTests(true)
    setTestResults([])

    // Simulate running tests locally
    // In production, this would actually execute the code
    setTimeout(() => {
      const mockResults = currentProblem.testCases
        .filter(tc => !tc.isHidden)
        .map((tc, index) => ({
          testCase: index + 1,
          passed: Math.random() > 0.3,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: tc.expectedOutput, // In production, this would be the actual output
          error: null
        }))
      
      setTestResults(mockResults)
      setIsRunningTests(false)
    }, 2000)
  }

  const handleSubmitProblem = async () => {
    setIsSubmitting(true)

    try {
      // Call AI service API to evaluate the solution
      await fetch('/api/ai-rank-test/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: currentProblem.id,
          code,
          language: selectedLanguage,
          timeSpent: 3600 - timeRemaining
        })
      })

      // Move to next problem or finish
      if (currentProblemIndex < totalProblems - 1) {
        setCurrentProblemIndex(currentProblemIndex + 1)
        setTestResults([])
        setShowHints(false)
      } else {
        // All problems completed
        handleSubmitTest()
      }
    } catch (error) {
      console.error('Error submitting problem:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">AI Rank Assessment</h1>
              <Badge variant="outline">
                Problem {currentProblemIndex + 1} of {totalProblems}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={timeRemaining < 600 ? 'destructive' : 'default'}>
                <Timer className="w-3 h-3 mr-1" />
                {formatTime(timeRemaining)}
              </Badge>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleSubmitTest}
              >
                End Test
              </Button>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Problem Description */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{currentProblem.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{currentProblem.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Examples:</h4>
                  {currentProblem.examples.map((example, index) => (
                    <div key={index} className="mb-3 p-3 bg-muted rounded-lg">
                      <div className="font-mono text-sm">
                        <div><strong>Input:</strong> {example.input}</div>
                        <div><strong>Output:</strong> {example.output}</div>
                        {example.explanation && (
                          <div className="mt-2 text-muted-foreground">
                            {example.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hints */}
                {currentProblem.hints && (
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHints(!showHints)}
                    >
                      {showHints ? 'Hide' : 'Show'} Hints
                    </Button>
                    {showHints && (
                      <Alert className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <ul className="list-disc pl-4 mt-2">
                            {currentProblem.hints.map((hint, index) => (
                              <li key={index}>{hint}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Test Results */}
            {testResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-2 rounded ${
                          result.passed ? 'bg-green-500/10' : 'bg-red-500/10'
                        }`}
                      >
                        <span className="text-sm">Test Case {result.testCase}</span>
                        {result.passed ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Code Editor */}
          <div className="space-y-4">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Solution</CardTitle>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0 space-y-0">
                <div className="border rounded">
                  <MonacoEditor
                    height="400px"
                    language={selectedLanguage === 'typescript' ? 'typescript' : selectedLanguage}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: 'JetBrains Mono, Fira Code, Monaco, Consolas, monospace',
                      lineNumbers: 'on',
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: 'on'
                    }}
                  />
                </div>

                <div className="p-4 flex gap-2">
                  <Button
                    onClick={handleRunTests}
                    disabled={isRunningTests || isSubmitting || !code.trim()}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  >
                    {isRunningTests ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Running Tests...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run & Test
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleSubmitProblem}
                    disabled={isSubmitting}
                    variant="default"
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <ChevronRight className="w-4 h-4 mr-2" />
                        Submit Solution
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}