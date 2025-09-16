'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { GraduationCap, School, Calendar } from 'lucide-react'

interface StudentEducationStepProps {
  onComplete: (data: any) => void
  onSkip: () => void
  canSkip: boolean
  isLoading: boolean
  initialData?: any
}

export default function StudentEducationStep({ 
  onComplete, 
  onSkip, 
  canSkip, 
  isLoading, 
  initialData 
}: StudentEducationStepProps) {
  const [formData, setFormData] = useState({
    currentLevel: initialData?.currentLevel || '',
    institution: initialData?.institution || '',
    major: initialData?.major || '',
    graduationYear: initialData?.graduationYear || '',
    gpa: initialData?.gpa || ''
  })

  const handleSubmit = () => {
    onComplete({ education: formData })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <GraduationCap className="w-12 h-12 text-purple-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Educational Background</h3>
        <p className="text-muted-foreground">
          Tell us about your educational journey to help us understand your background.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentLevel">Current Education Level</Label>
            <Select
              value={formData.currentLevel}
              onValueChange={(value) => setFormData(prev => ({ ...prev, currentLevel: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your current level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high_school">High School</SelectItem>
                <SelectItem value="undergraduate">Undergraduate</SelectItem>
                <SelectItem value="graduate">Graduate</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution">Institution</Label>
            <Input
              id="institution"
              value={formData.institution}
              onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
              placeholder="University or School name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="major">Major/Field of Study</Label>
            <Input
              id="major"
              value={formData.major}
              onChange={(e) => setFormData(prev => ({ ...prev, major: e.target.value }))}
              placeholder="Computer Science, Engineering, etc."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="graduationYear">Graduation Year</Label>
              <Input
                id="graduationYear"
                type="number"
                value={formData.graduationYear}
                onChange={(e) => setFormData(prev => ({ ...prev, graduationYear: e.target.value }))}
                placeholder="2024"
                min="2020"
                max="2030"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpa">GPA (Optional)</Label>
              <Input
                id="gpa"
                type="number"
                step="0.01"
                max="4.0"
                value={formData.gpa}
                onChange={(e) => setFormData(prev => ({ ...prev, gpa: e.target.value }))}
                placeholder="3.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

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
