'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { OnboardingService, OnboardingStep } from '@/lib/onboardingService'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  ArrowRight, 
  Trophy,
  Sparkles,
  Star,
  Users,
  Briefcase
} from 'lucide-react'

// Import step components
import WelcomeStep from './steps/WelcomeStep'
import StudentPersonalInfoStep from './steps/StudentPersonalInfoStep'
import StudentEducationStep from './steps/StudentEducationStep'
import StudentExperienceStep from './steps/StudentExperienceStep'
import SkillsAssessmentStep from './steps/SkillsAssessmentStep'
import StudentPreferencesStep from './steps/StudentPreferencesStep'
import TutorialQuestStep from './steps/TutorialQuestStep'
import CompanyInfoStep from './steps/CompanyInfoStep'
import CompanyContactStep from './steps/CompanyContactStep'
import CompanyTechStackStep from './steps/CompanyTechStackStep'
import CompanyVerificationStep from './steps/CompanyVerificationStep'
import CompanyQuestPreferencesStep from './steps/CompanyQuestPreferencesStep'
import FirstQuestStep from './steps/FirstQuestStep'

const StepComponents: Record<string, React.ComponentType<any>> = {
  WelcomeStep,
  StudentPersonalInfoStep,
  StudentEducationStep,
  StudentExperienceStep,
  SkillsAssessmentStep,
  StudentPreferencesStep,
  TutorialQuestStep,
  CompanyInfoStep,
  CompanyContactStep,
  CompanyTechStackStep,
  CompanyVerificationStep,
  CompanyQuestPreferencesStep,
  FirstQuestStep
}

interface OnboardingWizardProps {
  onComplete?: () => void
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [steps, setSteps] = useState<OnboardingStep[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [stepData, setStepData] = useState<Record<string, any>>({})
  const [isCompleting, setIsCompleting] = useState(false)

  useEffect(() => {
    if (user) {
      loadOnboardingProgress()
    }
  }, [user])

  const loadOnboardingProgress = async () => {
    if (!user) return

    setLoading(true)
    try {
      const progress = await OnboardingService.getUserOnboardingProgress(user.id)
      setSteps(progress.steps)
      setCompletionPercentage(progress.completionPercentage)
      
      // Find current step index
      const currentIndex = progress.steps.findIndex(step => !step.isCompleted)
      setCurrentStepIndex(currentIndex === -1 ? progress.steps.length - 1 : currentIndex)
    } catch (error) {
      console.error('Failed to load onboarding progress:', error)
      toast.error('Failed to load onboarding progress')
    } finally {
      setLoading(false)
    }
  }

  const handleStepComplete = async (stepId: string, data: any) => {
    setIsCompleting(true)
    try {
      const result = await OnboardingService.completeOnboardingStep(user!.id, stepId, data)
      
      if (result.success) {
        toast.success(result.message)
        
        // Update step data
        setStepData(prev => ({ ...prev, [stepId]: data }))
        
        // Reload progress
        await loadOnboardingProgress()
        
        // Move to next step if not completed
        if (result.nextStep) {
          const nextIndex = steps.findIndex(step => step.id === result.nextStep!.id)
          if (nextIndex !== -1) {
            setCurrentStepIndex(nextIndex)
          }
        } else if (onComplete) {
          onComplete()
        }
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Failed to complete step:', error)
      toast.error('Failed to complete step')
    } finally {
      setIsCompleting(false)
    }
  }

  const handleStepSkip = async (stepId: string) => {
    try {
      const result = await OnboardingService.skipOnboardingStep(user!.id, stepId)
      
      if (result.success) {
        toast.success(result.message)
        await loadOnboardingProgress()
        
        // Move to next step
        const nextIndex = currentStepIndex + 1
        if (nextIndex < steps.length) {
          setCurrentStepIndex(nextIndex)
        }
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Failed to skip step:', error)
      toast.error('Failed to skip step')
    }
  }

  const navigateToStep = (index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your onboarding...</p>
        </div>
      </div>
    )
  }

  if (!user || steps.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Onboarding Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Unable to load onboarding steps. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentStep = steps[currentStepIndex]
  const StepComponent = StepComponents[currentStep.component]

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student':
        return <Users className="w-5 h-5" />
      case 'company':
      case 'client':
        return <Briefcase className="w-5 h-5" />
      default:
        return <Star className="w-5 h-5" />
    }
  }

  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'student':
        return 'Adventurer'
      case 'company':
        return 'Quest Giver'
      case 'client':
        return 'Client'
      default:
        return 'Member'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-purple-600 text-white p-3 rounded-full mr-4">
              {getRoleIcon(user.role)}
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold">Welcome to The Adventurers Guild!</h1>
              <p className="text-lg text-muted-foreground">
                Setting up your {getRoleTitle(user.role)} profile
              </p>
            </div>
          </div>
          
          <Badge variant="outline" className="bg-white dark:bg-gray-800">
            <Trophy className="w-3 h-3 mr-1" />
            {Math.round(completionPercentage)}% Complete
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <div className="ml-auto text-sm text-muted-foreground">
              {steps.filter(s => s.isCompleted).length} completed
            </div>
          </div>
          <Progress value={completionPercentage} className="h-3" />
          
          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex flex-col items-center cursor-pointer transition-all duration-200 ${
                  index <= currentStepIndex ? 'text-primary' : 'text-muted-foreground'
                }`}
                onClick={() => navigateToStep(index)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  step.isCompleted 
                    ? 'bg-green-500 text-white' 
                    : index === currentStepIndex 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  {step.isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-xs mt-1 text-center max-w-20 truncate">
                  {step.title}
                </span>
                {!step.isRequired && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    Optional
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Step */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                {currentStep.title}
              </CardTitle>
              <CardDescription className="text-purple-100">
                {currentStep.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {StepComponent ? (
                <StepComponent
                  onComplete={(data: any) => handleStepComplete(currentStep.id, data)}
                  onSkip={() => handleStepSkip(currentStep.id)}
                  canSkip={!currentStep.isRequired}
                  isLoading={isCompleting}
                  initialData={stepData[currentStep.id]}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">This step component is not yet implemented.</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => handleStepComplete(currentStep.id, {})}
                    disabled={isCompleting}
                  >
                    Continue
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              onClick={() => navigateToStep(currentStepIndex - 1)}
              disabled={currentStepIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="text-sm text-muted-foreground">
              {currentStep.isRequired ? (
                <span className="flex items-center">
                  <Star className="w-3 h-3 mr-1 text-red-500" />
                  Required Step
                </span>
              ) : (
                <span className="flex items-center">
                  Optional Step
                </span>
              )}
            </div>

            <Button
              onClick={() => navigateToStep(currentStepIndex + 1)}
              disabled={currentStepIndex === steps.length - 1 || !currentStep.isCompleted}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Completion Message */}
          {completionPercentage === 100 && (
            <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
              <CardContent className="text-center py-8">
                <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
                  Onboarding Complete! 🎉
                </h3>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  Welcome to The Adventurers Guild! You're ready to start your journey.
                </p>
                <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Enter The Guild
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
