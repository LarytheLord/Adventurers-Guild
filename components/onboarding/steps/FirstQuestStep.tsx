'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sword, Sparkles, CheckCircle } from 'lucide-react'

interface FirstQuestStepProps {
  onComplete: (data: any) => void
  onSkip: () => void
  canSkip: boolean
  isLoading: boolean
  initialData?: any
}

export default function FirstQuestStep({ 
  onComplete, 
  onSkip, 
  canSkip, 
  isLoading, 
  initialData 
}: FirstQuestStepProps) {
  const [questCreated, setQuestCreated] = useState(false)

  const handleCreateQuest = () => {
    // In a real implementation, this would redirect to the quest creation page
    // For now, we'll just simulate quest creation
    setQuestCreated(true)
    setTimeout(() => {
      onComplete({
        firstQuest: {
          created: true,
          createdAt: new Date().toISOString()
        }
      })
    }, 2000)
  }

  const handleSkipQuest = () => {
    onComplete({
      firstQuest: {
        created: false,
        skipped: true
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Sword className="w-12 h-12 text-purple-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Post Your First Quest</h3>
        <p className="text-muted-foreground">
          Create your first coding quest to start connecting with talented developers.
        </p>
      </div>

      {!questCreated ? (
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg mb-6">
                <Sparkles className="w-12 h-12 mx-auto mb-4" />
                <h4 className="text-xl font-bold mb-2">Ready to Create Your First Quest?</h4>
                <p className="opacity-90">
                  Our guided quest creator will help you write an effective project description
                  and set appropriate budgets and timelines.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h5 className="font-medium">Describe Your Project</h5>
                  <p className="text-sm text-muted-foreground">
                    Write a clear description of what you need built
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <h5 className="font-medium">Set Budget & Timeline</h5>
                  <p className="text-sm text-muted-foreground">
                    Define fair compensation and realistic deadlines
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <h5 className="font-medium">Review Applications</h5>
                  <p className="text-sm text-muted-foreground">
                    Choose from qualified developer applications
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg mb-6">
                <h5 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                  Tips for Your First Quest
                </h5>
                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 text-left">
                  <li>• Start with a smaller project to test the waters</li>
                  <li>• Be specific about requirements and expectations</li>
                  <li>• Include relevant files, designs, or documentation</li>
                  <li>• Set realistic timelines with some buffer</li>
                  <li>• Budget fairly - quality developers deserve good compensation</li>
                </ul>
              </div>

              <div className="space-x-4">
                <Button 
                  onClick={handleCreateQuest}
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isLoading ? 'Creating...' : 'Create My First Quest'}
                </Button>
                
                {canSkip && (
                  <Button variant="outline" onClick={handleSkipQuest}>
                    I'll Create a Quest Later
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h4 className="text-xl font-bold text-green-800 dark:text-green-200">
                Quest Created Successfully! 🎉
              </h4>
              <p className="text-green-700 dark:text-green-300">
                Your first quest is now live and developers can start applying.
                You'll receive notifications when applications come in.
              </p>
              
              <div className="flex justify-center space-x-2 mt-4">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Quest Active
                </Badge>
                <Badge variant="outline">
                  Ready for Applications
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {questCreated && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Completing onboarding...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      )}
    </div>
  )
}
