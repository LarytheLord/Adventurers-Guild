'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Code, 
  Database, 
  Brain, 
  Server, 
  Zap, 
  Shield, 
  Star, 
  Trophy, 
  Target, 
  CheckCircle, 
  Lock,
  TrendingUp,
  Award,
  Sparkles,
  X
} from 'lucide-react'

interface Skill {
  id: string
  name: string
  description: string
  category: string
  level: number
  maxLevel: number
  skillPoints: number
  isUnlocked: boolean
  icon: React.ReactNode
  color: string
}

interface SkillCategory {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  totalSkillPoints: number
  maxSkillPoints: number
  skills: Skill[]
}

const skillCategories: SkillCategory[] = [
  {
    id: 'frontend',
    name: 'Frontend Development',
    description: 'Master the art of creating beautiful user interfaces',
    icon: <Code className="w-6 h-6" />,
    color: 'bg-blue-500',
    totalSkillPoints: 1250,
    maxSkillPoints: 3000,
    skills: [
      {
        id: 'react',
        name: 'React Mastery',
        description: 'Build dynamic user interfaces with React',
        category: 'frontend',
        level: 3,
        maxLevel: 5,
        skillPoints: 450,
        isUnlocked: true,
        icon: <Code className="w-4 h-4" />,
        color: 'bg-blue-500'
      },
      {
        id: 'typescript',
        name: 'TypeScript',
        description: 'Add type safety to your JavaScript code',
        category: 'frontend',
        level: 2,
        maxLevel: 5,
        skillPoints: 300,
        isUnlocked: true,
        icon: <Code className="w-4 h-4" />,
        color: 'bg-blue-600'
      },
      {
        id: 'tailwind',
        name: 'Tailwind CSS',
        description: 'Rapidly build custom user interfaces',
        category: 'frontend',
        level: 4,
        maxLevel: 5,
        skillPoints: 500,
        isUnlocked: true,
        icon: <Code className="w-4 h-4" />,
        color: 'bg-cyan-500'
      }
    ]
  },
  {
    id: 'backend',
    name: 'Backend Development',
    description: 'Build robust server-side applications',
    icon: <Server className="w-6 h-6" />,
    color: 'bg-green-500',
    totalSkillPoints: 800,
    maxSkillPoints: 3000,
    skills: [
      {
        id: 'nodejs',
        name: 'Node.js',
        description: 'Build scalable server applications',
        category: 'backend',
        level: 2,
        maxLevel: 5,
        skillPoints: 400,
        isUnlocked: true,
        icon: <Server className="w-4 h-4" />,
        color: 'bg-green-500'
      },
      {
        id: 'database',
        name: 'Database Design',
        description: 'Design and optimize database schemas',
        category: 'backend',
        level: 1,
        maxLevel: 5,
        skillPoints: 200,
        isUnlocked: true,
        icon: <Database className="w-4 h-4" />,
        color: 'bg-green-600'
      },
      {
        id: 'api',
        name: 'API Development',
        description: 'Create RESTful and GraphQL APIs',
        category: 'backend',
        level: 0,
        maxLevel: 5,
        skillPoints: 0,
        isUnlocked: false,
        icon: <Server className="w-4 h-4" />,
        color: 'bg-green-700'
      }
    ]
  },
  {
    id: 'ai',
    name: 'AI & Machine Learning',
    description: 'Explore the future of intelligent systems',
    icon: <Brain className="w-6 h-6" />,
    color: 'bg-purple-500',
    totalSkillPoints: 200,
    maxSkillPoints: 3000,
    skills: [
      {
        id: 'python',
        name: 'Python for AI',
        description: 'Master Python for machine learning',
        category: 'ai',
        level: 1,
        maxLevel: 5,
        skillPoints: 200,
        isUnlocked: true,
        icon: <Brain className="w-4 h-4" />,
        color: 'bg-purple-500'
      },
      {
        id: 'tensorflow',
        name: 'TensorFlow',
        description: 'Build and train neural networks',
        category: 'ai',
        level: 0,
        maxLevel: 5,
        skillPoints: 0,
        isUnlocked: false,
        icon: <Brain className="w-4 h-4" />,
        color: 'bg-purple-600'
      },
      {
        id: 'nlp',
        name: 'Natural Language Processing',
        description: 'Process and understand human language',
        category: 'ai',
        level: 0,
        maxLevel: 5,
        skillPoints: 0,
        isUnlocked: false,
        icon: <Brain className="w-4 h-4" />,
        color: 'bg-purple-700'
      }
    ]
  },
  {
    id: 'devops',
    name: 'DevOps & Infrastructure',
    description: 'Deploy and maintain production systems',
    icon: <Zap className="w-6 h-6" />,
    color: 'bg-orange-500',
    totalSkillPoints: 0,
    maxSkillPoints: 3000,
    skills: [
      {
        id: 'docker',
        name: 'Docker',
        description: 'Containerize your applications',
        category: 'devops',
        level: 0,
        maxLevel: 5,
        skillPoints: 0,
        isUnlocked: false,
        icon: <Zap className="w-4 h-4" />,
        color: 'bg-orange-500'
      },
      {
        id: 'kubernetes',
        name: 'Kubernetes',
        description: 'Orchestrate containerized applications',
        category: 'devops',
        level: 0,
        maxLevel: 5,
        skillPoints: 0,
        isUnlocked: false,
        icon: <Zap className="w-4 h-4" />,
        color: 'bg-orange-600'
      },
      {
        id: 'aws',
        name: 'AWS Cloud',
        description: 'Deploy applications on AWS infrastructure',
        category: 'devops',
        level: 0,
        maxLevel: 5,
        skillPoints: 0,
        isUnlocked: false,
        icon: <Zap className="w-4 h-4" />,
        color: 'bg-orange-700'
      }
    ]
  }
]

export function SkillTree() {
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const totalSkillPoints = skillCategories.reduce((sum, category) => sum + category.totalSkillPoints, 0)
  const maxTotalSkillPoints = skillCategories.reduce((sum, category) => sum + category.maxSkillPoints, 0)
  const overallProgress = (totalSkillPoints / maxTotalSkillPoints) * 100

  const unlockedSkills = skillCategories.flatMap(category => 
    category.skills.filter(skill => skill.isUnlocked)
  ).length

  const totalSkills = skillCategories.flatMap(category => category.skills).length

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-bold transition-all duration-300 ease-out shadow-lg hover:shadow-xl"
          onClick={() => setIsOpen(true)}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          View Skill Tree
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center mb-6">
            🎮 Developer Skill Tree
          </DialogTitle>
        </DialogHeader>

        {/* Overall Progress */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-2 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Trophy className="w-8 h-8 text-yellow-600" />
                  <div>
                    <h3 className="text-xl font-bold">Overall Progress</h3>
                    <p className="text-muted-foreground">Your journey to becoming a legendary developer</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{totalSkillPoints} SP</div>
                  <div className="text-sm text-muted-foreground">of {maxTotalSkillPoints} SP</div>
                </div>
              </div>
              <Progress value={overallProgress} className="h-3" />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>{unlockedSkills}/{totalSkills} Skills Unlocked</span>
                <span>{Math.round(overallProgress)}% Complete</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skill Categories */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {skillCategories.map((category) => (
            <Card 
              key={category.id}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 ${
                selectedCategory?.id === category.id 
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-950' 
                  : 'border-border'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${category.color} text-white`}>
                      {category.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{category.totalSkillPoints} SP</div>
                    <div className="text-xs text-muted-foreground">of {category.maxSkillPoints} SP</div>
                  </div>
                </div>
                <Progress 
                  value={(category.totalSkillPoints / category.maxSkillPoints) * 100} 
                  className="h-2" 
                />
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Selected Category Skills */}
        {selectedCategory && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`p-3 rounded-lg ${selectedCategory.color} text-white`}>
                {selectedCategory.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold">{selectedCategory.name}</h3>
                <p className="text-muted-foreground">{selectedCategory.description}</p>
              </div>
            </div>

            <div className="grid gap-4">
              {selectedCategory.skills.map((skill) => (
                <Card 
                  key={skill.id}
                  className={`transition-all duration-300 ${
                    skill.isUnlocked 
                      ? 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800' 
                      : 'border-gray-200 bg-gray-50 dark:bg-gray-900 dark:border-gray-800'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${skill.color} text-white`}>
                          {skill.isUnlocked ? skill.icon : <Lock className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold">{skill.name}</h4>
                            {skill.isUnlocked && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Unlocked
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{skill.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{skill.skillPoints} SP</div>
                        <div className="text-xs text-muted-foreground">
                          Level {skill.level}/{skill.maxLevel}
                        </div>
                        {skill.isUnlocked && (
                          <div className="flex space-x-1 mt-2">
                            {Array.from({ length: skill.maxLevel }, (_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < skill.level ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Achievement Badges */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Recent Achievements
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'First Quest', icon: '🎯', color: 'bg-blue-500' },
              { name: 'Frontend Pioneer', icon: '⚛️', color: 'bg-green-500' },
              { name: 'Code Warrior', icon: '⚔️', color: 'bg-purple-500' },
              { name: 'Skill Master', icon: '🏆', color: 'bg-yellow-500' }
            ].map((achievement, index) => (
              <Card key={index} className="text-center p-4 hover:scale-105 transition-transform duration-300">
                <div className={`w-12 h-12 rounded-full ${achievement.color} text-white flex items-center justify-center mx-auto mb-2 text-xl`}>
                  {achievement.icon}
                </div>
                <h4 className="font-semibold text-sm">{achievement.name}</h4>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 