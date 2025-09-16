'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Settings, Target, Clock, DollarSign } from 'lucide-react'

interface StudentPreferencesStepProps {
  onComplete: (data: any) => void
  onSkip: () => void
  canSkip: boolean
  isLoading: boolean
  initialData?: any
}

export default function StudentPreferencesStep({ 
  onComplete, 
  onSkip, 
  canSkip, 
  isLoading, 
  initialData 
}: StudentPreferencesStepProps) {
  const [formData, setFormData] = useState({
    availableHours: initialData?.availableHours || [10],
    preferredDifficulty: initialData?.preferredDifficulty || '',
    interestedCategories: initialData?.interestedCategories || [],
    questTypes: initialData?.questTypes || [],
    budgetExpectation: initialData?.budgetExpectation || { min: 100, max: 1000 },
    learningGoals: initialData?.learningGoals || []
  })

  const categories = [
    'Frontend Development',
    'Backend Development', 
    'Full Stack Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'DevOps',
    'UI/UX Design',
    'Database Design',
    'API Development'
  ]

  const questTypes = [
    'Bug Fixes',
    'Feature Development',
    'Code Review',
    'Testing',
    'Documentation',
    'Prototyping',
    'Research',
    'Consulting'
  ]

  const learningGoals = [
    'Learn new technologies',
    'Build portfolio projects',
    'Gain work experience',
    'Earn money while learning',
    'Network with professionals',
    'Improve coding skills',
    'Understand business requirements',
    'Work with real codebases'
  ]

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interestedCategories: checked 
        ? [...prev.interestedCategories, category]
        : prev.interestedCategories.filter(c => c !== category)
    }))
  }

  const handleQuestTypeChange = (type: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      questTypes: checked 
        ? [...prev.questTypes, type]
        : prev.questTypes.filter(t => t !== type)
    }))
  }

  const handleLearningGoalChange = (goal: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      learningGoals: checked 
        ? [...prev.learningGoals, goal]
        : prev.learningGoals.filter(g => g !== goal)
    }))
  }

  const handleSubmit = () => {
    onComplete({ preferences: formData })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Settings className="w-12 h-12 text-purple-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Preferences & Goals</h3>
        <p className="text-muted-foreground">
          Help us match you with the perfect quests by sharing your preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Hours available per week</Label>
              <div className="px-3">
                <Slider
                  value={formData.availableHours}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, availableHours: value }))}
                  max={40}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="text-center text-sm text-muted-foreground">
                {formData.availableHours[0]} hours per week
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preferred difficulty level</Label>
              <Select
                value={formData.preferredDifficulty}
                onValueChange={(value) => setFormData(prev => ({ ...prev, preferredDifficulty: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy (Perfect for learning)</SelectItem>
                  <SelectItem value="medium">Medium (Some challenge)</SelectItem>
                  <SelectItem value="hard">Hard (Push my limits)</SelectItem>
                  <SelectItem value="expert">Expert (Bring the challenge!)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Budget Expectations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Budget Expectations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum budget per quest</Label>
                <Input
                  type="number"
                  value={formData.budgetExpectation.min}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    budgetExpectation: { ...prev.budgetExpectation, min: parseInt(e.target.value) || 0 }
                  }))}
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label>Maximum budget per quest</Label>
                <Input
                  type="number"
                  value={formData.budgetExpectation.max}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    budgetExpectation: { ...prev.budgetExpectation, max: parseInt(e.target.value) || 0 }
                  }))}
                  placeholder="1000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interested Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Areas of Interest</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={formData.interestedCategories.includes(category)}
                    onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                  />
                  <Label htmlFor={category} className="text-sm cursor-pointer">
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quest Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preferred Quest Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {questTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={formData.questTypes.includes(type)}
                    onCheckedChange={(checked) => handleQuestTypeChange(type, checked as boolean)}
                  />
                  <Label htmlFor={type} className="text-sm cursor-pointer">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Learning Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Learning Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {learningGoals.map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={goal}
                    checked={formData.learningGoals.includes(goal)}
                    onCheckedChange={(checked) => handleLearningGoalChange(goal, checked as boolean)}
                  />
                  <Label htmlFor={goal} className="text-sm cursor-pointer">
                    {goal}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        {canSkip && (
          <Button variant="outline" onClick={onSkip} disabled={isLoading}>
            Skip for now
          </Button>
        )}
        
        <div className="ml-auto">
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}
