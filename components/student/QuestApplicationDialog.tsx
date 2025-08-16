'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DollarSign, Trophy, Clock, Users, Send } from 'lucide-react'
import { MockAuthService } from '@/lib/mockAuth'
import { MockDataService, Quest } from '@/lib/mockData'

interface QuestApplicationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quest: Quest | null
  onApplicationSubmitted: () => void
}

export function QuestApplicationDialog({ 
  open, 
  onOpenChange, 
  quest, 
  onApplicationSubmitted 
}: QuestApplicationDialogProps) {
  const [coverLetter, setCoverLetter] = useState('')
  const [proposedTimeline, setProposedTimeline] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!quest) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const user = MockAuthService.getCurrentUser()
      if (!user) throw new Error('Not authenticated')

      const application = MockDataService.applyToQuest({
        quest_id: quest.id,
        user_id: user.id,
        user_name: user.name,
        user_rank: user.rank || 'F',
        cover_letter: coverLetter,
        proposed_timeline: proposedTimeline,
        status: 'pending'
      })

      console.log('Application submitted:', application)
      
      // Reset form
      setCoverLetter('')
      setProposedTimeline('')
      
      onApplicationSubmitted()
    } catch (error) {
      console.error('Failed to submit application:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRankColor = (rank: string) => {
    const colors = {
      S: 'bg-yellow-500 text-black',
      A: 'bg-red-500 text-white',
      B: 'bg-blue-500 text-white',
      C: 'bg-green-500 text-white',
      D: 'bg-gray-500 text-white',
      F: 'bg-gray-400 text-white'
    }
    return colors[rank as keyof typeof colors] || 'bg-gray-400 text-white'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for Quest</DialogTitle>
          <DialogDescription>
            Submit your application to work on this quest
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quest Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{quest.title}</CardTitle>
                  <CardDescription className="mt-2">
                    by {quest.company_name}
                  </CardDescription>
                </div>
                <Badge className={getRankColor(quest.difficulty)}>
                  {quest.difficulty}-Rank
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {quest.description}
              </p>
              
              {quest.requirements && (
                <div>
                  <h4 className="font-medium mb-2">Requirements</h4>
                  <p className="text-sm text-muted-foreground">
                    {quest.requirements}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {quest.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Separator />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>${quest.budget}</span>
                </div>
                <div className="flex items-center">
                  <Trophy className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{quest.xp_reward} XP</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{quest.applications_count} applications</span>
                </div>
                {quest.deadline && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{new Date(quest.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cover-letter">Cover Letter *</Label>
              <Textarea
                id="cover-letter"
                placeholder="Tell the company why you're the right person for this quest. Highlight your relevant experience, skills, and what you can bring to the project..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                Tip: Mention specific technologies from the requirements and any relevant projects you've worked on.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeline">Proposed Timeline *</Label>
              <Textarea
                id="timeline"
                placeholder="How long do you think this project will take? Break down your approach and timeline..."
                value={proposedTimeline}
                onChange={(e) => setProposedTimeline(e.target.value)}
                rows={3}
                required
              />
              <p className="text-xs text-muted-foreground">
                Be realistic about your timeline. Consider the complexity and your other commitments.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !coverLetter.trim() || !proposedTimeline.trim()}
              >
                {isSubmitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}