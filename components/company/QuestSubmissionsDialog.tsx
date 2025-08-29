
'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, X, Clock, User, Star, ExternalLink } from 'lucide-react'
import { Database } from '@/types/supabase'
import { toast } from "sonner"
import { useState } from "react"

type Quest = Database['public']['Tables']['quests']['Row'];
type QuestSubmission = Database['public']['Tables']['quest_submissions']['Row'] & { users: Database['public']['Tables']['users']['Row'] };

interface QuestSubmissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quest: Quest | null
  submissions: QuestSubmission[]
  onSubmissionStatusChange: (submissionId: string, newStatus: 'pending' | 'approved' | 'rejected' | 'revision_requested') => void
}

export function QuestSubmissionsDialog({
  open,
  onOpenChange,
  quest,
  submissions,
  onSubmissionStatusChange
}: QuestSubmissionsDialogProps) {
  if (!quest) return null

  const updateSubmissionStatus = async (submissionId: string, status: 'pending' | 'approved' | 'rejected' | 'revision_requested') => {
    try {
      const response = await fetch(`/api/quest_submissions/${submissionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update submission status to ${status}`)
      }

      toast({
        title: "Success",
        description: `Submission ${status} successfully.`,
      })
      onSubmissionStatusChange(submissionId, status)
    } catch (error: unknown) {
      console.error(error)
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to update submission status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleApproveSubmission = (submission: QuestSubmission) => {
    updateSubmissionStatus(submission.id, 'approved')
  }

  const handleRejectSubmission = (submission: QuestSubmission) => {
    updateSubmissionStatus(submission.id, 'rejected')
  }

  const handleRequestRevision = (submission: QuestSubmission) => {
    updateSubmissionStatus(submission.id, 'revision_requested')
  }

  const handleRateSubmission = async (submissionId: string, rating: number) => {
    try {
      const response = await fetch(`/api/quest_submissions/${submissionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      })

      if (!response.ok) {
        throw new Error(`Failed to rate submission`)
      }

      toast({
        title: "Success",
        description: `Submission rated ${rating} stars successfully.`,
      })
      // Optionally update the local state to reflect the new rating
    } catch (error: unknown) {
      console.error(error)
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to rate submission. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'revision_requested': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submissions for: {quest.title}</DialogTitle>
          <DialogDescription>
            Review and manage submissions from adventurers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quest Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quest Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Difficulty:</span>
                  <Badge className={`ml-2 ${getRankColor(quest.difficulty)}`}>
                    {quest.difficulty}-Rank
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Budget:</span>
                  <span className="ml-2 font-medium">${quest.budget}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">XP Reward:</span>
                  <span className="ml-2 font-medium">{quest.xp_reward} XP</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Submissions:</span>
                  <span className="ml-2 font-medium">{submissions.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submissions */}
          {submissions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <User className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                <p className="text-muted-foreground text-center">
                  Adventurers haven&apos;t submitted work for this quest yet. Check back later!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Submissions ({submissions.length})</h3>
              {submissions.map((submission) => (
                <Card key={submission.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {submission.users?.name?.substring(0, 2) || ''}
                          </AvatarFallback>
                          <AvatarImage src={submission.users?.avatar_url || undefined} />
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{submission.users?.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getRankColor(submission.users?.rank || 'F')}>
                              {submission.users?.rank}-Rank
                            </Badge>
                            <Badge className={getStatusColor(submission.status)}>
                              {submission.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {submission.description}
                      </p>
                    </div>
                    
                    {(submission.submission_url || submission.github_repo || submission.demo_url) && (
                      <div>
                        <h4 className="font-medium mb-2">Links</h4>
                        <div className="flex flex-wrap gap-2">
                          {submission.submission_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={submission.submission_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Submission
                              </a>
                            </Button>
                          )}
                          {submission.github_repo && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={submission.github_repo} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                GitHub Repo
                              </a>
                            </Button>
                          )}
                          {submission.demo_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={submission.demo_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Live Demo
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {submission.status === 'pending' && (
                      <>
                        <Separator />
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRequestRevision(submission)}
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Request Revision
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleRejectSubmission(submission)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleApproveSubmission(submission)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      </>
                    )}

                    {submission.status === 'approved' && !submission.rating && (
                      <>
                        <Separator />
                        <div className="flex justify-end space-x-2">
                          <h4 className="font-medium">Rate Submission:</h4>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-6 h-6 cursor-pointer ${star <= (submission.rating || 0) ? 'text-yellow-400' : 'text-muted-foreground'}`}
                              onClick={() => handleRateSubmission(submission.id, star)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
