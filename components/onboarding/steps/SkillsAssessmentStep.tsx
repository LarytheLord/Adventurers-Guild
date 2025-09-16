'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { 
  Code, 
  Database, 
  Brain, 
  Server, 
  Smartphone, 
  Trophy,
  Timer,
  CheckCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'

interface SkillsAssessmentStepProps {
  onComplete: (data: any) => void
  onSkip: () => void
  canSkip: boolean
  isLoading: boolean
  initialData?: any
}

interface Question {
  id: string
  category: string
  question: string
  options: string[]
  correctAnswer: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  explanation?: string
}

const assessmentQuestions: Question[] = [
  // Frontend Development
  {
    id: 'fe-1',
    category: 'Frontend',
    question: 'What does HTML stand for?',
    options: [
      'Hypertext Markup Language',
      'High-Tech Modern Language',
      'Home Tool Markup Language',
      'Hyperlink and Text Markup Language'
    ],
    correctAnswer: 0,
    difficulty: 'beginner'
  },
  {
    id: 'fe-2',
    category: 'Frontend',
    question: 'Which CSS property is used to change the text color?',
    options: ['text-color', 'color', 'font-color', 'text-style'],
    correctAnswer: 1,
    difficulty: 'beginner'
  },
  {
    id: 'fe-3',
    category: 'Frontend',
    question: 'What is the purpose of the useState hook in React?',
    options: [
      'To manage component state',
      'To handle side effects',
      'To optimize performance',
      'To connect to APIs'
    ],
    correctAnswer: 0,
    difficulty: 'intermediate'
  },
  {
    id: 'fe-4',
    category: 'Frontend',
    question: 'Which of these is a valid way to center a div horizontally in CSS?',
    options: [
      'margin: 0 auto;',
      'text-align: center;',
      'position: center;',
      'display: center;'
    ],
    correctAnswer: 0,
    difficulty: 'intermediate'
  },

  // Backend Development
  {
    id: 'be-1',
    category: 'Backend',
    question: 'What does API stand for?',
    options: [
      'Application Programming Interface',
      'Advanced Programming Instructions',
      'Automated Program Integration',
      'Application Process Integration'
    ],
    correctAnswer: 0,
    difficulty: 'beginner'
  },
  {
    id: 'be-2',
    category: 'Backend',
    question: 'Which HTTP method is typically used to create a new resource?',
    options: ['GET', 'POST', 'PUT', 'DELETE'],
    correctAnswer: 1,
    difficulty: 'beginner'
  },
  {
    id: 'be-3',
    category: 'Backend',
    question: 'What is the purpose of middleware in Express.js?',
    options: [
      'To handle database connections',
      'To process requests before they reach route handlers',
      'To render HTML templates',
      'To manage user sessions only'
    ],
    correctAnswer: 1,
    difficulty: 'intermediate'
  },

  // Database
  {
    id: 'db-1',
    category: 'Database',
    question: 'What does SQL stand for?',
    options: [
      'Structured Query Language',
      'Simple Query Language',
      'Standard Query Language',
      'Sequential Query Language'
    ],
    correctAnswer: 0,
    difficulty: 'beginner'
  },
  {
    id: 'db-2',
    category: 'Database',
    question: 'Which SQL command is used to retrieve data from a database?',
    options: ['GET', 'SELECT', 'RETRIEVE', 'FETCH'],
    correctAnswer: 1,
    difficulty: 'beginner'
  },

  // Programming Fundamentals
  {
    id: 'pf-1',
    category: 'Programming',
    question: 'What is a variable in programming?',
    options: [
      'A fixed value that never changes',
      'A storage location with an associated name',
      'A type of loop structure',
      'A debugging tool'
    ],
    correctAnswer: 1,
    difficulty: 'beginner'
  },
  {
    id: 'pf-2',
    category: 'Programming',
    question: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correctAnswer: 1,
    difficulty: 'advanced'
  },
  {
    id: 'pf-3',
    category: 'Programming',
    question: 'What is the difference between == and === in JavaScript?',
    options: [
      'No difference',
      '== checks type and value, === checks only value',
      '=== checks type and value, == checks only value',
      '== is for numbers, === is for strings'
    ],
    correctAnswer: 2,
    difficulty: 'intermediate'
  }
]

export default function SkillsAssessmentStep({ 
  onComplete, 
  onSkip, 
  canSkip, 
  isLoading, 
  initialData 
}: SkillsAssessmentStepProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30) // 30 seconds per question
  const [assessmentStarted, setAssessmentStarted] = useState(false)
  const [assessmentCompleted, setAssessmentCompleted] = useState(false)
  const [results, setResults] = useState<any>(null)

  const currentQuestion = assessmentQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex) / assessmentQuestions.length) * 100

  // Timer effect
  useEffect(() => {
    if (!assessmentStarted || assessmentCompleted || showExplanation) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleNextQuestion()
          return 30
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [assessmentStarted, assessmentCompleted, showExplanation, currentQuestionIndex])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Frontend':
        return <Code className="w-5 h-5" />
      case 'Backend':
        return <Server className="w-5 h-5" />
      case 'Database':
        return <Database className="w-5 h-5" />
      case 'Programming':
        return <Brain className="w-5 h-5" />
      case 'Mobile':
        return <Smartphone className="w-5 h-5" />
      default:
        return <Code className="w-5 h-5" />
    }
  }

  const startAssessment = () => {
    setAssessmentStarted(true)
    setTimeLeft(30)
    toast.success('Assessment started! Take your time and do your best.')
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null) return

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: selectedAnswer
    }))

    setShowExplanation(true)
  }

  const handleNextQuestion = () => {
    if (selectedAnswer !== null) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: selectedAnswer
      }))
    }

    setShowExplanation(false)
    setSelectedAnswer(null)
    setTimeLeft(30)

    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      completeAssessment()
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      setSelectedAnswer(answers[assessmentQuestions[currentQuestionIndex - 1].id] || null)
      setShowExplanation(false)
      setTimeLeft(30)
    }
  }

  const completeAssessment = () => {
    setAssessmentCompleted(true)
    
    // Calculate results
    const categoryScores: Record<string, { correct: number; total: number }> = {}
    let totalCorrect = 0

    assessmentQuestions.forEach(question => {
      const userAnswer = answers[question.id]
      const isCorrect = userAnswer === question.correctAnswer

      if (!categoryScores[question.category]) {
        categoryScores[question.category] = { correct: 0, total: 0 }
      }

      categoryScores[question.category].total++
      if (isCorrect) {
        categoryScores[question.category].correct++
        totalCorrect++
      }
    })

    const overallScore = Math.round((totalCorrect / assessmentQuestions.length) * 100)
    
    const skills = Object.entries(categoryScores).map(([category, scores]) => ({
      id: category.toLowerCase(),
      name: category,
      score: Math.round((scores.correct / scores.total) * 100),
      correct: scores.correct,
      total: scores.total
    }))

    const results = {
      overallScore,
      totalCorrect,
      totalQuestions: assessmentQuestions.length,
      skills,
      completedAt: new Date().toISOString()
    }

    setResults(results)
  }

  const handleCompleteOnboarding = () => {
    onComplete({
      assessmentResults: results,
      skills: results.skills,
      overallScore: results.overallScore
    })
  }

  if (!assessmentStarted) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Skills Assessment</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Take our quick skills assessment to help us understand your current level 
            and assign you an appropriate starting rank. This will help match you with 
            suitable quests and learning opportunities.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">What to expect:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    {assessmentQuestions.length} multiple choice questions
                  </li>
                  <li className="flex items-center">
                    <Timer className="w-4 h-4 mr-2 text-blue-500" />
                    30 seconds per question
                  </li>
                  <li className="flex items-center">
                    <Brain className="w-4 h-4 mr-2 text-purple-500" />
                    Covers multiple programming areas
                  </li>
                  <li className="flex items-center">
                    <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                    Determines your starting rank (F-S)
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Assessment Areas:</h4>
                <div className="space-y-2">
                  {['Frontend', 'Backend', 'Database', 'Programming'].map(category => (
                    <div key={category} className="flex items-center text-sm">
                      {getCategoryIcon(category)}
                      <span className="ml-2">{category} Development</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <h5 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                Tips for success:
              </h5>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                <li>• Read each question carefully</li>
                <li>• Don't worry if you don't know an answer - this helps us assess your level</li>
                <li>• Your starting rank can be improved by completing quests</li>
                <li>• Take your time but watch the timer</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          {canSkip && (
            <Button variant="outline" onClick={onSkip}>
              Skip Assessment
            </Button>
          )}
          
          <div className="ml-auto space-x-2">
            <Button onClick={startAssessment} className="bg-purple-600 hover:bg-purple-700">
              Start Assessment
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (assessmentCompleted && results) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Assessment Complete!</h3>
          <p className="text-muted-foreground">
            Great job! Here are your results:
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Overall Score: {results.overallScore}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {results.totalCorrect}/{results.totalQuestions}
              </div>
              <p className="text-muted-foreground">Questions Correct</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Skill Breakdown:</h4>
              {results.skills.map((skill: any) => (
                <div key={skill.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      {getCategoryIcon(skill.name)}
                      <span className="ml-2 font-medium">{skill.name}</span>
                    </div>
                    <Badge variant={skill.score >= 70 ? 'default' : 'secondary'}>
                      {skill.score}%
                    </Badge>
                  </div>
                  <Progress value={skill.score} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {skill.correct}/{skill.total} questions correct
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <h5 className="font-medium text-green-800 dark:text-green-200 mb-2">
                What's Next?
              </h5>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Your starting rank will be assigned based on this score</li>
                <li>• Complete quests to earn XP and improve your rank</li>
                <li>• Focus on areas where you scored lower for growth opportunities</li>
                <li>• Retake the assessment anytime to update your skills</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button 
            onClick={handleCompleteOnboarding}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? 'Processing...' : 'Continue to Next Step'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getCategoryIcon(currentQuestion.category)}
          <Badge variant="outline">{currentQuestion.category}</Badge>
          <Badge variant={currentQuestion.difficulty === 'beginner' ? 'default' : 
                        currentQuestion.difficulty === 'intermediate' ? 'secondary' : 'destructive'}>
            {currentQuestion.difficulty}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Timer className="w-4 h-4" />
          <span className={`font-mono ${timeLeft <= 10 ? 'text-red-500' : ''}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span>Question {currentQuestionIndex + 1} of {assessmentQuestions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent>
          {!showExplanation ? (
            <RadioGroup 
              value={selectedAnswer?.toString()} 
              onValueChange={(value) => handleAnswerSelect(parseInt(value))}
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border ${
                      index === currentQuestion.correctAnswer 
                        ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
                        : index === selectedAnswer 
                        ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' 
                        : 'bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {index === currentQuestion.correctAnswer && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {currentQuestion.explanation && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Explanation:</strong> {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {!showExplanation ? (
          <Button
            onClick={handleAnswerSubmit}
            disabled={selectedAnswer === null}
          >
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNextQuestion}>
            {currentQuestionIndex === assessmentQuestions.length - 1 ? 'Finish' : 'Next Question'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}
