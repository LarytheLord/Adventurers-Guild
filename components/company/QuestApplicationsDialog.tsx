'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, X, Clock, User } from 'lucide-react'
import { Database } from '@/types/supabase'
import { toast } from "sonner"

type Quest = Database['public']['Tables']['quests']['Row'];
type QuestApplication = Database['public']['Tables']['quest_applications']['Row'] & { users: Database['public']['Tables']['users']['Row'] };

interface QuestApplicationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quest: Quest | null
  applications: QuestApplication[]
  onApplicationStatusChange: (applicationId: string, newStatus: 'approved' | 'rejected') => void
}

export function QuestApplicationsDialog({ 
  open, 
  onOpenChange, 
  quest, 
  applications,
  onApplicationStatusChange
}: QuestApplicationsDialogProps) {
  if (!quest) return null

  const updateApplicationStatus = async (applicationId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/quest_applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update application status to ${status}`)
      }

      toast({
        title: "Success",
        description: `Application ${status} successfully.`,
      })
      onApplicationStatusChange(applicationId, status)
    } catch (error: unknown) {
      console.error(error)
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to update application status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAcceptApplication = (application: QuestApplication) => {
    updateApplicationStatus(application.id, 'approved')
  }

  const handleRejectApplication = (application: QuestApplication) => {
    updateApplicationStatus(application.id, 'rejected')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
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
          <DialogTitle>Applications for: {quest.title}</DialogTitle>
          <DialogDescription>
            Review and manage applications from adventurers
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
                  <span className="text-muted-foreground">Applications:</span>
                  <span className="ml-2 font-medium">{applications.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applications */}
          {applications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <User className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                <p className="text-muted-foreground text-center">
                  Adventurers haven&apos;t applied to this quest yet. Check back later!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Applications ({applications.length})</h3>
              {applications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {application.users?.name?.substring(0, 2) || ''}
                          </AvatarFallback>
                          <AvatarImage src={application.users?.avatar_url || undefined} />
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{application.users?.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getRankColor(application.users?.rank || 'F')}>
                              {application.users?.rank}-Rank
                            </Badge>
                            <Badge className={getStatusColor(application.status)}>
                              {application.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Applied {new Date(application.applied_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Cover Letter</h4>
                      <p className="text-sm text-muted-foreground">
                        {application.cover_letter}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Proposed Timeline</h4>
                      <p className="text-sm text-muted-foreground">
                        {application.proposed_timeline}
                      </p>
                    </div>

                    {application.status === 'pending' && (
                      <>
                        <Separator />
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRejectApplication(application)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleAcceptApplication(application)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept & Assign
                          </Button>
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