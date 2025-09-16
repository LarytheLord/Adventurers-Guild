'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Code } from 'lucide-react'

interface CompanyTechStackStepProps {
  onComplete: (data: any) => void
  onSkip: () => void
  canSkip: boolean
  isLoading: boolean
  initialData?: any
}

export default function CompanyTechStackStep({ 
  onComplete, 
  onSkip, 
  canSkip, 
  isLoading, 
  initialData 
}: CompanyTechStackStepProps) {
  const [formData, setFormData] = useState({
    primaryTechnologies: initialData?.primaryTechnologies || [],
    frameworks: initialData?.frameworks || [],
    databases: initialData?.databases || [],
    cloudPlatforms: initialData?.cloudPlatforms || []
  })

  const technologies = {
    primaryTechnologies: ['JavaScript', 'Python', 'Java', 'TypeScript', 'C#', 'PHP', 'Go', 'Rust'],
    frameworks: ['React', 'Vue.js', 'Angular', 'Next.js', 'Express', 'Django', 'Spring', '.NET'],
    databases: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'DynamoDB'],
    cloudPlatforms: ['AWS', 'Google Cloud', 'Azure', 'Vercel', 'Netlify', 'Heroku']
  }

  const handleTechChange = (category: keyof typeof formData, tech: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [category]: checked 
        ? [...prev[category], tech]
        : prev[category].filter((t: string) => t !== tech)
    }))
  }

  const handleSubmit = () => {
    onComplete({ techStack: formData })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Code className="w-12 h-12 text-purple-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Technology Stack</h3>
        <p className="text-muted-foreground">
          Tell us about the technologies your company uses to help match with the right developers.
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(technologies).map(([category, techs]) => (
          <Card key={category}>
            <CardContent className="pt-6">
              <h4 className="font-medium mb-4 capitalize">
                {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h4>
              <div className="grid md:grid-cols-3 gap-3">
                {techs.map((tech) => (
                  <div key={tech} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${category}-${tech}`}
                      checked={formData[category as keyof typeof formData].includes(tech)}
                      onCheckedChange={(checked) => handleTechChange(category as keyof typeof formData, tech, checked as boolean)}
                    />
                    <Label htmlFor={`${category}-${tech}`} className="text-sm cursor-pointer">
                      {tech}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
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
