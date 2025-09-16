'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/AuthContext"
import { SkillTreeService, SkillTreeData, SkillTreeNode, SkillTreeCategory } from "@/lib/skillTreeService"
import { toast } from "sonner"
import { 
  Code, 
  Database, 
  Brain, 
  Server, 
  Zap, 
  Trophy, 
  CheckCircle, 
  Lock,
  Award,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Smartphone,
  Shield
} from 'lucide-react'

const iconMap: Record<string, React.ReactNode> = {
  Code: <Code className="w-4 h-4" />,
  Database: <Database className="w-4 h-4" />,
  Brain: <Brain className="w-4 h-4" />,
  Server: <Server className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  Smartphone: <Smartphone className="w-4 h-4" />,
  Shield: <Shield className="w-4 h-4" />,
  Star: <Star className="w-4 h-4" />,
  Target: <Target className="w-4 h-4" />,
  TrendingUp: <TrendingUp className="w-4 h-4" />,
}

function SkillTree() {
  const { user } = useAuth()
  const [skillTreeData, setSkillTreeData] = useState<SkillTreeData | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<SkillTreeCategory | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<any[]>([])

  useEffect(() => {
    if (user && isOpen) {
      loadSkillTree()
      loadRecommendations()
    }
  }, [user, isOpen])

  const loadSkillTree = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const data = await SkillTreeService.getUserSkillTree(user.id)
      setSkillTreeData(data)
    } catch (error) {
      console.error('Failed to load skill tree:', error)
      toast.error('Failed to load skill tree')
    } finally {
      setLoading(false)
    }
  }

  const loadRecommendations = async () => {
    if (!user) return
    
    try {
      const recs = await SkillTreeService.getSkillRecommendations(user.id)
      setRecommendations(recs)
    } catch (error) {
      console.error('Failed to load recommendations:', error)
    }
  }

  const handleUnlockSkill = async (skillId: string) => {
    if (!user) return

    try {
      const result = await SkillTreeService.unlockSkill(user.id, skillId)
      if (result.success) {
        toast.success(result.message)
        if (result.newlyUnlocked && result.newlyUnlocked.length > 0) {
          toast.info(`${result.newlyUnlocked.length} additional skills unlocked!`)
        }
        await loadSkillTree()
        await loadRecommendations()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Failed to unlock skill:', error)
      toast.error('Failed to unlock skill')
    }
  }

  const getSkillIcon = (iconName: string) => {
    return iconMap[iconName] || <Code className="w-4 h-4" />
  }

  const getCategoryIcon = (iconName: string) => {
    const iconElement = iconMap[iconName] || <Code className="w-6 h-6" />
    return React.cloneElement(iconElement as React.ReactElement, { className: "w-6 h-6" })
  }

  if (!skillTreeData) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-bold transition-all duration-300 ease-out shadow-lg hover:shadow-xl"
            onClick={() => setIsOpen(true)}
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            View Skill Tree
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Loading Skill Tree...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const overallProgress = skillTreeData.totalSkillPoints > 0 
    ? (skillTreeData.totalSkillPoints / (skillTreeData.categories.reduce((sum, cat) => sum + cat.maxSkillPoints, 0))) * 100 
    : 0

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-bold transition-all duration-300 ease-out shadow-lg hover:shadow-xl"
          onClick={() => setIsOpen(true)}
        >
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          View Skill Tree
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl sm:max-w-5xl lg:max-w-6xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">
            🎮 Developer Skill Tree
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overall Progress */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-2 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4 sm:gap-0">
                  <div className="flex items-center space-x-3">
                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold">Overall Progress</h3>
                      <p className="text-muted-foreground text-sm sm:text-base">Your journey to becoming a legendary developer</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-xl sm:text-2xl font-bold text-purple-600">{skillTreeData.totalSkillPoints} SP</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{skillTreeData.totalXP} XP Total</div>
                  </div>
                </div>
                <Progress value={overallProgress} className="h-2 sm:h-3" />
                <div className="flex flex-col sm:flex-row sm:justify-between mt-2 text-xs sm:text-sm text-muted-foreground gap-1 sm:gap-0">
                  <span>{skillTreeData.unlockedSkills}/{skillTreeData.totalSkills} Skills Unlocked</span>
                  <span>{Math.round(overallProgress)}% Complete</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-blue-600">{skillTreeData.categories.length}</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-green-600">{skillTreeData.unlockedSkills}</div>
                <div className="text-sm text-muted-foreground">Unlocked</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-purple-600">{skillTreeData.totalSkillPoints}</div>
                <div className="text-sm text-muted-foreground">Skill Points</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-yellow-600">{skillTreeData.achievements.length}</div>
                <div className="text-sm text-muted-foreground">Achievements</div>
              </Card>
            </div>

            {/* Recent Achievements */}
            {skillTreeData.achievements.length > 0 && (
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Your Achievements
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {skillTreeData.achievements.slice(0, 4).map((achievement) => (
                    <Card key={achievement.id} className="text-center p-3 sm:p-4 hover:scale-105 transition-transform duration-300">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${achievement.badgeColor} text-white flex items-center justify-center mx-auto mb-2 text-lg sm:text-xl`}>
                        {achievement.icon}
                      </div>
                      <h4 className="font-semibold text-xs sm:text-sm">{achievement.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{achievement.xpReward} XP</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            {/* Skill Categories */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
              {skillTreeData.categories.map((category) => (
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${category.color} text-white`}>
                          {getCategoryIcon(category.icon)}
                        </div>
                        <div>
                          <CardTitle className="text-base sm:text-lg">{category.name}</CardTitle>
                          <p className="text-xs sm:text-sm text-muted-foreground">{category.description}</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-base sm:text-lg font-bold">{category.totalSkillPoints} SP</div>
                        <div className="text-xs text-muted-foreground">of {category.maxSkillPoints} SP</div>
                      </div>
                    </div>
                    <Progress value={category.progress} className="h-2" />
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Selected Category Skills */}
            {selectedCategory && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                  <div className={`p-2 sm:p-3 rounded-lg ${selectedCategory.color} text-white`}>
                    {getCategoryIcon(selectedCategory.icon)}
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold">{selectedCategory.name}</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">{selectedCategory.description}</p>
                  </div>
                </div>

                <ScrollArea className="h-[400px]">
                  <div className="grid gap-3 sm:gap-4 pr-4">
                    {selectedCategory.skills.map((skill) => (
                      <Card 
                        key={skill.id}
                        className={`transition-all duration-300 ${
                          skill.isUnlocked 
                            ? 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800' 
                            : 'border-gray-200 bg-gray-50 dark:bg-gray-900 dark:border-gray-800'
                        }`}
                      >
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${skill.color} text-white`}>
                                {skill.isUnlocked ? getSkillIcon(skill.icon) : <Lock className="w-4 h-4" />}
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                                  <h4 className="font-semibold text-sm sm:text-base">{skill.name}</h4>
                                  {skill.isUnlocked && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs w-fit">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Unlocked
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground">{skill.description}</p>
                                {skill.prerequisites.length > 0 && (
                                  <p className="text-xs text-amber-600 mt-1">
                                    Prerequisites: {skill.prerequisites.length} skills required
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-left sm:text-right flex-shrink-0">
                              <div className="text-base sm:text-lg font-bold">{skill.skillPoints} SP</div>
                              <div className="text-xs text-muted-foreground">
                                Level {skill.level}/{skill.maxLevel}
                              </div>
                              {skill.isUnlocked && skill.level < skill.maxLevel && (
                                <div className="text-xs text-blue-600 mt-1">
                                  {skill.pointsToNextLevel} SP to next level
                                </div>
                              )}
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
                              {!skill.isUnlocked && skill.prerequisites.length === 0 && (
                                <Button 
                                  size="sm" 
                                  className="mt-2"
                                  onClick={() => handleUnlockSkill(skill.id)}
                                  disabled={loading}
                                >
                                  Unlock
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Recommended Skills
              </h3>
              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <Card key={rec.skill.id} className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <div className={`p-2 rounded-lg ${rec.skill.color} text-white`}>
                                {getSkillIcon(rec.skill.icon)}
                              </div>
                              <div>
                                <h4 className="font-semibold">{rec.skill.name}</h4>
                                <p className="text-sm text-muted-foreground">{rec.reason}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">Priority {rec.priority}</Badge>
                            {!rec.skill.isUnlocked && (
                              <Button 
                                size="sm" 
                                onClick={() => handleUnlockSkill(rec.skill.id)}
                                disabled={loading}
                              >
                                Unlock
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center p-8">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h4 className="text-lg font-semibold mb-2">No Recommendations Available</h4>
                  <p className="text-muted-foreground">Complete more quests to unlock skill recommendations!</p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default SkillTree