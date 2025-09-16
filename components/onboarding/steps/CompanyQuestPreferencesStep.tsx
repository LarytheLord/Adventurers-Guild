'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Target } from 'lucide-react'

interface CompanyQuestPreferencesStepProps {
  onComplete: (data: any) => void
  onSkip: () => void
  canSkip: boolean
  isLoading: boolean
  initialData?: any
}

export default function CompanyQuestPreferencesStep({ 
  onComplete, 
  onSkip, 
  canSkip, 
  isLoading, 
  initialData 
}: CompanyQuestPreferencesStepProps) {
  const [formData, setFormData] = useState({
    typicalQuestTypes: initialData?.typicalQuestTypes || [],
    budgetRange: initialData?.budgetRange || { min: 500, max: 5000 },
    averageTimeframe: initialData?.averageTimeframe || '',
    preferredDifficultyLevels: initialData?.preferredDifficultyLevels || [],
    requiredSkillLevels: initialData?.requiredSkillLevels || []
  })

  const questTypes = [
    'Bug Fixes', 'Feature Development', 'Code Review', 'Testing', 
    'Documentation', 'API Development', 'UI/UX Implementation', 'Database Design'
  ]

  const difficulties = ['Easy', 'Medium', 'Hard', 'Expert']
  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

  const handleQuestTypeChange = (type: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      typicalQuestTypes: checked 
        ? [...prev.typicalQuestTypes, type]
        : prev.typicalQuestTypes.filter(t => t !== type)
    }))
  }

  const handleDifficultyChange = (level: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferredDifficultyLevels: checked 
        ? [...prev.preferredDifficultyLevels, level]
        : prev.preferredDifficultyLevels.filter(l => l !== level)
    }))
  }

  const handleSkillLevelChange = (level: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      requiredSkillLevels: checked 
        ? [...prev.requiredSkillLevels, level]
        : prev.requiredSkillLevels.filter(l => l !== level)
    }))
  }

  const handleSubmit = () => {
    onComplete({ questPreferences: formData })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Target className="w-12 h-12 text-purple-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Quest Preferences</h3>
        <p className="text-muted-foreground">
          Set your preferences for the types of quests you'll typically post.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h4 className="font-medium">Typical Quest Types</h4>
            <div className="grid md:grid-cols-2 gap-3">
              {questTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={formData.typicalQuestTypes.includes(type)}
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

        <Card>
          <CardContent className="pt-6 space-y-4">
            <h4 className="font-medium">Budget Range</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minBudget">Minimum Budget ($)</Label>
                <Input
                  id="minBudget"
                  type="number"
                  value={formData.budgetRange.min}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    budgetRange: { ...prev.budgetRange, min: parseInt(e.target.value) || 0 }
                  }))}
                  placeholder="500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxBudget">Maximum Budget ($)</Label>
                <Input
                  id="maxBudget"
                  type="number"
                  value={formData.budgetRange.max}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    budgetRange: { ...prev.budgetRange, max: parseInt(e.target.value) || 0 }
                  }))}
                  placeholder="5000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>Average Project Timeframe</Label>
              <Select
                value={formData.averageTimeframe}
                onValueChange={(value) => setFormData(prev => ({ ...prev, averageTimeframe: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select typical timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-3 days">1-3 days</SelectItem>
                  <SelectItem value="1 week">1 week</SelectItem>
                  <SelectItem value="2-3 weeks">2-3 weeks</SelectItem>
                  <SelectItem value="1 month">1 month</SelectItem>
                  <SelectItem value="2+ months">2+ months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <h4 className="font-medium">Preferred Difficulty Levels</h4>
            <div className="grid md:grid-cols-2 gap-3">
              {difficulties.map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={`difficulty-${level}`}
                    checked={formData.preferredDifficultyLevels.includes(level)}
                    onCheckedChange={(checked) => handleDifficultyChange(level, checked as boolean)}
                  />
                  <Label htmlFor={`difficulty-${level}`} className="text-sm cursor-pointer">
                    {level}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <h4 className="font-medium">Required Skill Levels</h4>
            <div className="grid md:grid-cols-2 gap-3">
              {skillLevels.map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={`skill-${level}`}
                    checked={formData.requiredSkillLevels.includes(level)}
                    onCheckedChange={(checked) => handleSkillLevelChange(level, checked as boolean)}
                  />
                  <Label htmlFor={`skill-${level}`} className="text-sm cursor-pointer">
                    {level}
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
