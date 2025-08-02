'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Trophy, 
  Star, 
  CheckCircle, 
  Zap,
  Code,
  Database,
  Brain,
  Server,
  Award,
  Sparkles
} from 'lucide-react'

interface QuestReward {
  category: string
  skillPoints: number
  skillName: string
  icon: React.ReactNode
  color: string
}

interface Quest {
  id: string
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  rewards: QuestReward[]
  isCompleted: boolean
}

const sampleQuests: Quest[] = [
  {
    id: 'react-bug-fix',
    title: 'Fix React Component Bug',
    description: 'Debug and fix a critical issue in the user authentication component',
    difficulty: 'Medium',
    isCompleted: false,
    rewards: [
      {
        category: 'frontend',
        skillPoints: 150,
        skillName: 'React Mastery',
        icon: <Code className="w-4 h-4" />,
        color: 'bg-blue-500'
      },
      {
        category: 'frontend',
        skillPoints: 100,
        skillName: 'TypeScript',
        icon: <Code className="w-4 h-4" />,
        color: 'bg-blue-600'
      }
    ]
  },
  {
    id: 'api-endpoint',
    title: 'Create REST API Endpoint',
    description: 'Build a new API endpoint for user profile management',
    difficulty: 'Hard',
    isCompleted: false,
    rewards: [
      {
        category: 'backend',
        skillPoints: 200,
        skillName: 'Node.js',
        icon: <Server className="w-4 h-4" />,
        color: 'bg-green-500'
      },
      {
        category: 'backend',
        skillPoints: 150,
        skillName: 'Database Design',
        icon: <Database className="w-4 h-4" />,
        color: 'bg-green-600'
      }
    ]
  },
  {
    id: 'ml-model',
    title: 'Implement ML Model',
    description: 'Create a simple machine learning model for data classification',
    difficulty: 'Hard',
    isCompleted: false,
    rewards: [
      {
        category: 'ai',
        skillPoints: 300,
        skillName: 'Python for AI',
        icon: <Brain className="w-4 h-4" />,
        color: 'bg-purple-500'
      }
    ]
  }
]

export function QuestCompletion() {
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [completedQuests, setCompletedQuests] = useState<string[]>([])

  const handleQuestCompletion = (questId: string) => {
    setCompletedQuests(prev => [...prev, questId])
    // In a real implementation, this would update the skill tree data
    setTimeout(() => {
      setIsOpen(false)
    }, 2000)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'Hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg font-bold transition-all duration-300 ease-out shadow-lg hover:shadow-xl"
          onClick={() => setIsOpen(true)}
        >
          <Trophy className="w-5 h-5 mr-2" />
          Complete Quest
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center mb-6">
            🎯 Quest Completion
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {sampleQuests.map((quest) => (
            <Card 
              key={quest.id}
              className={`transition-all duration-300 hover:scale-105 ${
                completedQuests.includes(quest.id) 
                  ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                  : 'border-border'
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary text-white">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{quest.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{quest.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getDifficultyColor(quest.difficulty)}>
                      {quest.difficulty}
                    </Badge>
                    {completedQuests.includes(quest.id) && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Skill Rewards:</h4>
                    <div className="grid gap-3">
                      {quest.rewards.map((reward, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${reward.color} text-white`}>
                              {reward.icon}
                            </div>
                            <div>
                              <div className="font-medium">{reward.skillName}</div>
                              <div className="text-sm text-muted-foreground">{reward.category}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">+{reward.skillPoints} SP</div>
                            <div className="text-xs text-muted-foreground">Skill Points</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {!completedQuests.includes(quest.id) && (
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={() => handleQuestCompletion(quest.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Quest
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Completion Summary */}
        {completedQuests.length > 0 && (
          <div className="mt-8">
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Award className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="text-xl font-bold">Quest Completion Summary</h3>
                    <p className="text-muted-foreground">Your skill points have been awarded!</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Frontend', points: 250, color: 'bg-blue-500' },
                    { name: 'Backend', points: 350, color: 'bg-green-500' },
                    { name: 'AI', points: 300, color: 'bg-purple-500' },
                    { name: 'Total', points: 900, color: 'bg-yellow-500' }
                  ].map((category, index) => (
                    <div key={index} className="text-center">
                      <div className={`w-12 h-12 rounded-full ${category.color} text-white flex items-center justify-center mx-auto mb-2`}>
                        <Star className="w-6 h-6" />
                      </div>
                      <div className="font-bold">{category.points} SP</div>
                      <div className="text-sm text-muted-foreground">{category.name}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 