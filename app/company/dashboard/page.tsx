'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Eye, 
  Users, 
  Clock, 
  CheckCircle, 
  DollarSign,
  TrendingUp,
  FileText,
  Settings,
  LogOut
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { CreateQuestDialog } from '@/components/company/CreateQuestDialog'
import { QuestApplicationsDialog } from '@/components/company/QuestApplicationsDialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { EditQuestDialog } from '@/components/company/EditQuestDialog';
import { QuestSubmissionsDialog } from '@/components/company/QuestSubmissionsDialog';
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from "@/components/ui/use-toast";
import { Database } from '@/types/supabase'

type Quest = Database['public']['Tables']['quests']['Row'];
type QuestApplication = Database['public']['Tables']['quest_applications']['Row'] & { profiles: Database['public']['Tables']['users']['Row'] };

export default function CompanyDashboard() {
  const { profile, loading, signOut } = useAuth()
  const [quests, setQuests] = useState<Quest[]>([])
  const [applications, setApplications] = useState<QuestApplication[]>([])
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [showSubmissions, setShowSubmissions] = useState(false)
  const [selectedSubmissionQuest, setSelectedSubmissionQuest] = useState<Quest | null>(null)
  
  const [showApplications, setShowApplications] = useState(false)

  const handleQuestUpdated = (updatedQuest: Quest) => {
    setQuests(quests.map(q => q.id === updatedQuest.id ? updatedQuest : q));
  };

  const handleQuestDeleted = async (questId: string) => {
    try {
      const response = await fetch(`/api/quests/delete/${questId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete quest');
      }

      setQuests(quests.filter(q => q.id !== questId));
      toast({ title: 'Success', description: 'Quest deleted successfully.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to delete quest. Please try again.', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!profile || profile.role !== 'company') {
      window.location.href = '/login'
      return
    }

    const fetchQuests = async () => {
      const response = await fetch(`/api/company/${profile.id}/quests`)
      const data = await response.json()
      setQuests(data.quests)
    }

    fetchQuests()
  }, [profile, loading])

  const handleViewApplications = async (quest: Quest) => {
    setSelectedQuest(quest)
    const response = await fetch(`/api/quests/${quest.id}/applications`)
    const data = await response.json()
    setApplications(data)
    setShowApplications(true)
  }

  const handleViewSubmissions = async (quest: Quest) => {
    setSelectedSubmissionQuest(quest)
    const response = await fetch(`/api/quests/${quest.id}/submissions`)
    const data = await response.json()
    // Assuming data is an array of submissions
    setApplications(data) // Reusing applications state for simplicity, ideally would have separate state for submissions
    setShowSubmissions(true)
  }

  const handleLogout = () => {
    signOut()
    window.location.href = '/'
  }

  const stats = {
    totalQuests: quests.length,
    activeQuests: quests.filter(q => q.status === 'active').length,
    completedQuests: quests.filter(q => q.status === 'completed').length,
    totalApplications: quests.reduce((sum, q) => sum + (q.max_applicants || 0), 0)
  }

  if (loading || !profile) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Image src="/images/guild-logo.png" alt="The Adventurers Guild" width={32} height={32} className="w-8 h-8" />
            </Link>
            <h1 className="text-2xl font-bold">Company Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Avatar>
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback>{profile.name?.substring(0, 2) || ''}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {profile.company_name || profile.name}!</h2>
          <p className="text-muted-foreground">Manage your quests and find talented adventurers.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuests}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Quests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeQuests}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedQuests}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="quests" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="quests">My Quests</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
                        <CreateQuestDialog onQuestCreated={(quest) => setQuests([quest, ...quests])} />
          </div>

          <TabsContent value="quests" className="space-y-6">
            {quests.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No quests yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first quest to start finding talented adventurers.
                  </p>
                  <Button onClick={() => setShowCreateQuest(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Quest
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {quests.map((quest) => (
                  <Card key={quest.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{quest.title}</CardTitle>
                          <CardDescription className="mt-2">
                            {quest.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={quest.status === 'active' ? 'default' : 'secondary'}>
                            {quest.status}
                          </Badge>
                          <Badge variant="outline">
                            {quest.difficulty}-Rank
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          ${quest.budget}
                        </span>
                        <span className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          {quest.xp_reward} XP
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {quest.max_applicants} applications
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewApplications(quest)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Applications
                        </Button>
                        <EditQuestDialog quest={quest} onQuestUpdated={handleQuestUpdated} />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">Delete</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the quest.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleQuestDeleted(quest.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewSubmissions(quest)}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Submissions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Quest Analytics</CardTitle>
                <CardDescription>
                  Track the performance of your quests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Detailed analytics and insights will be available here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      

      <QuestApplicationsDialog
        open={showApplications}
        onOpenChange={setShowApplications}
        quest={selectedQuest}
        applications={applications}
        onApplicationStatusChange={(applicationId, newStatus) => {
          setApplications(prev => prev.map(app => app.id === applicationId ? { ...app, status: newStatus } : app));
          if (newStatus === 'approved') {
            // Optionally update the assigned_to field of the quest if an application is approved
            // This would require another API call to update the quest itself
          }
        }}
      />

      <QuestSubmissionsDialog
        open={showSubmissions}
        onOpenChange={setShowSubmissions}
        quest={selectedSubmissionQuest}
        submissions={applications} // Reusing applications state for simplicity
        onSubmissionStatusChange={(submissionId, newStatus) => {
          setApplications(prev => prev.map(sub => sub.id === submissionId ? { ...sub, status: newStatus } : sub));
        }}
      />
    </div>
  )
}