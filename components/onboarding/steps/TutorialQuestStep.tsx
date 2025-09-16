'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sword, CheckCircle, ExternalLink, Github, Trophy } from 'lucide-react'

interface TutorialQuestStepProps {
  onComplete: (data: any) => void
  onSkip: () => void
  canSkip: boolean
  isLoading: boolean
  initialData?: any
}

export default function TutorialQuestStep({ 
  onComplete, 
  onSkip, 
  canSkip, 
  isLoading, 
  initialData 
}: TutorialQuestStepProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [submission, setSubmission] = useState({
    githubRepo: '',
    demoUrl: '',
    description: '',
    challenges: '',
    learnings: ''
  })

  const tutorialSteps = [
    {
      title: 'Welcome to Your First Quest!',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Sword className="w-8 h-8 mr-3" />
              <div>
                <h3 className="text-xl font-bold">Tutorial Quest: Personal Portfolio</h3>
                <Badge className="bg-white/20 text-white mt-1">Beginner • 50 XP</Badge>
              </div>
            </div>
            <p>Create a personal portfolio website to showcase your skills and projects.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  About section with your bio
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Skills section
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Projects showcase
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Contact information
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Responsive design
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Technologies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Choose any of these:</p>
                <div className="flex flex-wrap gap-1">
                  {['HTML/CSS', 'React', 'Vue.js', 'Angular', 'Next.js', 'Svelte'].map(tech => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: 'Getting Started',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Step-by-Step Guide</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium">1. Plan Your Portfolio</h4>
              <p className="text-sm text-muted-foreground">
                Sketch out the layout and decide what content to include. Think about your personal brand.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium">2. Set Up Your Project</h4>
              <p className="text-sm text-muted-foreground">
                Create a new repository on GitHub and set up your development environment.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium">3. Build Your Portfolio</h4>
              <p className="text-sm text-muted-foreground">
                Implement the design using your chosen technology. Focus on clean, readable code.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium">4. Deploy Your Site</h4>
              <p className="text-sm text-muted-foreground">
                Use platforms like Netlify, Vercel, or GitHub Pages to make your portfolio live.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Helpful Resources</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• <a href="#" className="underline">Portfolio design inspiration</a></li>
              <li>• <a href="#" className="underline">Free CSS templates</a></li>
              <li>• <a href="#" className="underline">Deployment guides</a></li>
              <li>• <a href="#" className="underline">Best practices checklist</a></li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: 'Submit Your Work',
      content: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Submit Your Portfolio</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="githubRepo">GitHub Repository URL *</Label>
              <div className="flex">
                <div className="flex items-center bg-muted px-3 rounded-l-md border border-r-0">
                  <Github className="w-4 h-4" />
                </div>
                <Input
                  id="githubRepo"
                  className="rounded-l-none"
                  value={submission.githubRepo}
                  onChange={(e) => setSubmission(prev => ({ ...prev, githubRepo: e.target.value }))}
                  placeholder="https://github.com/username/portfolio"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="demoUrl">Live Demo URL *</Label>
              <div className="flex">
                <div className="flex items-center bg-muted px-3 rounded-l-md border border-r-0">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <Input
                  id="demoUrl"
                  className="rounded-l-none"
                  value={submission.demoUrl}
                  onChange={(e) => setSubmission(prev => ({ ...prev, demoUrl: e.target.value }))}
                  placeholder="https://yourportfolio.netlify.app"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Project Description *</Label>
              <Textarea
                id="description"
                value={submission.description}
                onChange={(e) => setSubmission(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your portfolio, technologies used, and key features..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="challenges">Challenges Faced (Optional)</Label>
              <Textarea
                id="challenges"
                value={submission.challenges}
                onChange={(e) => setSubmission(prev => ({ ...prev, challenges: e.target.value }))}
                placeholder="What difficulties did you encounter and how did you solve them?"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="learnings">What Did You Learn? (Optional)</Label>
              <Textarea
                id="learnings"
                value={submission.learnings}
                onChange={(e) => setSubmission(prev => ({ ...prev, learnings: e.target.value }))}
                placeholder="What new skills or concepts did you learn while building this?"
                rows={2}
              />
            </div>
          </div>
        </div>
      )
    }
  ]

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    if (!submission.githubRepo || !submission.demoUrl || !submission.description) {
      return
    }
    
    onComplete({
      tutorialQuest: {
        completed: true,
        submission,
        completedAt: new Date().toISOString()
      }
    })
  }

  const isSubmissionValid = submission.githubRepo && submission.demoUrl && submission.description.length >= 20

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <Trophy className="w-12 h-12 text-yellow-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Complete Your First Quest</h3>
        <p className="text-muted-foreground">
          Build a portfolio website to earn your first 50 XP and unlock basic skills!
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
          <span>{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}% Complete</span>
        </div>
        <Progress value={((currentStep + 1) / tutorialSteps.length) * 100} className="h-2" />
      </div>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{tutorialSteps[currentStep].title}</CardTitle>
        </CardHeader>
        <CardContent>
          {tutorialSteps[currentStep].content}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          {canSkip && currentStep === 0 && (
            <Button variant="outline" onClick={onSkip} disabled={isLoading}>
              Skip Tutorial
            </Button>
          )}
        </div>

        <div>
          {currentStep < tutorialSteps.length - 1 ? (
            <Button onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={!isSubmissionValid || isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Submitting...' : 'Complete Quest'}
            </Button>
          )}
        </div>
      </div>

      {currentStep === tutorialSteps.length - 1 && !isSubmissionValid && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Please fill in all required fields to complete your first quest
          </p>
        </div>
      )}
    </div>
  )
}
