'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Code, Github, ExternalLink, Plus, X } from 'lucide-react'

interface StudentExperienceStepProps {
  onComplete: (data: any) => void
  onSkip: () => void
  canSkip: boolean
  isLoading: boolean
  initialData?: any
}

export default function StudentExperienceStep({ 
  onComplete, 
  onSkip, 
  canSkip, 
  isLoading, 
  initialData 
}: StudentExperienceStepProps) {
  const [formData, setFormData] = useState({
    programmingExperience: initialData?.programmingExperience || '',
    yearsOfExperience: initialData?.yearsOfExperience || 0,
    portfolioUrl: initialData?.portfolioUrl || '',
    githubUrl: initialData?.githubUrl || '',
    linkedinUrl: initialData?.linkedinUrl || '',
    previousProjects: initialData?.previousProjects || []
  })

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    technologies: [],
    url: ''
  })

  const [newTech, setNewTech] = useState('')

  const addTechnology = () => {
    if (newTech.trim() && !newProject.technologies.includes(newTech.trim())) {
      setNewProject(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTech.trim()]
      }))
      setNewTech('')
    }
  }

  const removeTechnology = (tech: string) => {
    setNewProject(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }))
  }

  const addProject = () => {
    if (newProject.name.trim() && newProject.description.trim()) {
      setFormData(prev => ({
        ...prev,
        previousProjects: [...prev.previousProjects, newProject]
      }))
      setNewProject({
        name: '',
        description: '',
        technologies: [],
        url: ''
      })
    }
  }

  const removeProject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      previousProjects: prev.previousProjects.filter((_: any, i: number) => i !== index)
    }))
  }

  const handleSubmit = () => {
    onComplete({ experience: formData })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Code className="w-12 h-12 text-purple-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Experience & Portfolio</h3>
        <p className="text-muted-foreground">
          Showcase your coding experience and projects to help companies find you.
        </p>
      </div>

      <div className="space-y-6">
        {/* Experience Level */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Programming Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>How would you describe your programming experience?</Label>
              <Select
                value={formData.programmingExperience}
                onValueChange={(value) => setFormData(prev => ({ ...prev, programmingExperience: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (Just starting out)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (1-2 years experience)</SelectItem>
                  <SelectItem value="advanced">Advanced (3-5 years experience)</SelectItem>
                  <SelectItem value="expert">Expert (5+ years experience)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Years of Programming Experience</Label>
              <Input
                type="number"
                min="0"
                max="20"
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Portfolio & Profiles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="portfolioUrl">Portfolio Website</Label>
              <div className="flex">
                <div className="flex items-center bg-muted px-3 rounded-l-md border border-r-0">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <Input
                  id="portfolioUrl"
                  className="rounded-l-none"
                  value={formData.portfolioUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub Profile</Label>
              <div className="flex">
                <div className="flex items-center bg-muted px-3 rounded-l-md border border-r-0">
                  <Github className="w-4 h-4" />
                </div>
                <Input
                  id="githubUrl"
                  className="rounded-l-none"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                  placeholder="https://github.com/yourusername"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
              <div className="flex">
                <div className="flex items-center bg-muted px-3 rounded-l-md border border-r-0">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <Input
                  id="linkedinUrl"
                  className="rounded-l-none"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Previous Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing Projects */}
            {formData.previousProjects.map((project: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{project.name}</h4>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                    {project.url && (
                      <a 
                        href={project.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View Project
                      </a>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProject(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {project.technologies.map((tech: string) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}

            {/* Add New Project */}
            <div className="p-4 border-2 border-dashed rounded-lg space-y-4">
              <h4 className="font-medium">Add a Project</h4>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input
                    value={newProject.name}
                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Awesome App"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Project URL (Optional)</Label>
                  <Input
                    value={newProject.url}
                    onChange={(e) => setNewProject(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://myproject.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of what this project does..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Technologies Used</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    placeholder="React"
                    onKeyPress={(e) => e.key === 'Enter' && addTechnology()}
                  />
                  <Button onClick={addTechnology} type="button">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {newProject.technologies.map((tech: string) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                      <button 
                        onClick={() => removeTechnology(tech)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                onClick={addProject}
                disabled={!newProject.name.trim() || !newProject.description.trim()}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
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
