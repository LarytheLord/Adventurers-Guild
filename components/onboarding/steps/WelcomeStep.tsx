'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Sword, 
  Trophy, 
  Users, 
  DollarSign, 
  Star, 
  BookOpen, 
  Zap,
  ArrowRight,
  Sparkles
} from 'lucide-react'

interface WelcomeStepProps {
  onComplete: (data: any) => void
  onSkip: () => void
  canSkip: boolean
  isLoading: boolean
  initialData?: any
}

export default function WelcomeStep({ onComplete, isLoading }: WelcomeStepProps) {
  const { user } = useAuth()
  const [currentSlide, setCurrentSlide] = useState(0)

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'student':
        return {
          title: 'Welcome, Future Adventurer!',
          subtitle: 'Your coding journey begins here',
          icon: <Sword className="w-12 h-12 text-blue-600" />,
          color: 'from-blue-600 to-purple-600',
          benefits: [
            { icon: <Trophy className="w-5 h-5" />, text: 'Earn XP and climb the ranks from F to S' },
            { icon: <DollarSign className="w-5 h-5" />, text: 'Get paid for completing coding quests' },
            { icon: <BookOpen className="w-5 h-5" />, text: 'Build real-world projects for companies' },
            { icon: <Star className="w-5 h-5" />, text: 'Unlock skills and advance your career' }
          ]
        }
      case 'company':
      case 'client':
        return {
          title: 'Welcome, Quest Giver!',
          subtitle: 'Connect with talented developers',
          icon: <Users className="w-12 h-12 text-green-600" />,
          color: 'from-green-600 to-blue-600',
          benefits: [
            { icon: <Users className="w-5 h-5" />, text: 'Access a pool of skilled developers' },
            { icon: <Zap className="w-5 h-5" />, text: 'Get projects completed efficiently' },
            { icon: <Star className="w-5 h-5" />, text: 'Rate and review developer work' },
            { icon: <DollarSign className="w-5 h-5" />, text: 'Secure escrow payment system' }
          ]
        }
      default:
        return {
          title: 'Welcome to The Adventurers Guild!',
          subtitle: 'Your journey starts here',
          icon: <Sparkles className="w-12 h-12 text-purple-600" />,
          color: 'from-purple-600 to-blue-600',
          benefits: []
        }
    }
  }

  const roleInfo = getRoleInfo(user?.role || 'student')

  const slides = [
    {
      title: roleInfo.title,
      content: (
        <div className="text-center space-y-6">
          <div className={`bg-gradient-to-r ${roleInfo.color} text-white p-6 rounded-2xl`}>
            <div className="flex justify-center mb-4">
              {roleInfo.icon}
            </div>
            <h2 className="text-2xl font-bold mb-2">{roleInfo.subtitle}</h2>
            <p className="text-lg opacity-90">
              Join thousands of developers and companies in our gamified coding community
            </p>
          </div>
          
          <div className="grid gap-4">
            {roleInfo.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-primary">
                  {benefit.icon}
                </div>
                <span className="text-sm font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'How It Works',
      content: (
        <div className="space-y-6">
          {user?.role === 'student' ? (
            <>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="text-center p-4">
                  <CardContent className="pt-6">
                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">1. Complete Quests</h3>
                    <p className="text-sm text-muted-foreground">Browse and apply for coding quests from real companies</p>
                  </CardContent>
                </Card>
                
                <Card className="text-center p-4">
                  <CardContent className="pt-6">
                    <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">2. Earn XP & Ranks</h3>
                    <p className="text-sm text-muted-foreground">Gain experience points and advance from rank F to S</p>
                  </CardContent>
                </Card>
                
                <Card className="text-center p-4">
                  <CardContent className="pt-6">
                    <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">3. Get Paid</h3>
                    <p className="text-sm text-muted-foreground">Receive payment for completed quests through secure escrow</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-6 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  Ranking System
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['F', 'D', 'C', 'B', 'A', 'S'].map((rank, index) => (
                    <Badge 
                      key={rank} 
                      variant={index === 0 ? 'default' : 'outline'}
                      className={index === 0 ? 'bg-gray-500' : ''}
                    >
                      Rank {rank}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Start at rank F and work your way up to the legendary S rank!
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="text-center p-4">
                  <CardContent className="pt-6">
                    <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <Sword className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">1. Post Quests</h3>
                    <p className="text-sm text-muted-foreground">Create coding challenges for your projects</p>
                  </CardContent>
                </Card>
                
                <Card className="text-center p-4">
                  <CardContent className="pt-6">
                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">2. Review Applications</h3>
                    <p className="text-sm text-muted-foreground">Choose from qualified developers</p>
                  </CardContent>
                </Card>
                
                <Card className="text-center p-4">
                  <CardContent className="pt-6">
                    <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <Star className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">3. Rate & Pay</h3>
                    <p className="text-sm text-muted-foreground">Review work and release secure payments</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 p-6 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                  Secure & Reliable
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Escrow payment protection</li>
                  <li>• Verified developer profiles</li>
                  <li>• Quality assurance through ratings</li>
                  <li>• Dedicated project management tools</li>
                </ul>
              </div>
            </>
          )}
        </div>
      )
    },
    {
      title: 'Ready to Begin?',
      content: (
        <div className="text-center space-y-6">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-2xl">
            <Sparkles className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Your Adventure Awaits!</h2>
            <p className="text-lg opacity-90 mb-6">
              {user?.role === 'student' 
                ? "Complete a few quick steps to set up your adventurer profile and start earning!"
                : "Set up your company profile and start posting your first quest!"
              }
            </p>
            <div className="flex justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-purple-600 hover:bg-gray-100"
                onClick={() => onComplete({ welcomed: true, timestamp: new Date().toISOString() })}
                disabled={isLoading}
              >
                {isLoading ? 'Starting...' : 'Start My Journey'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>This will take about 5-10 minutes to complete</p>
          </div>
        </div>
      )
    }
  ]

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Slide indicators */}
      <div className="flex justify-center space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>

      {/* Current slide */}
      <div className="min-h-[500px]">
        <h3 className="text-xl font-bold mb-6 text-center">{slides[currentSlide].title}</h3>
        {slides[currentSlide].content}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={prevSlide}
          disabled={currentSlide === 0}
        >
          Previous
        </Button>
        
        <div className="flex space-x-2">
          {currentSlide < slides.length - 1 ? (
            <Button onClick={nextSlide}>
              Next
            </Button>
          ) : (
            <Button 
              onClick={() => onComplete({ welcomed: true, timestamp: new Date().toISOString() })}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? 'Starting...' : 'Get Started'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
