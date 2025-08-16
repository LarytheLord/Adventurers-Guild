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
import { MockAuthService, User } from '@/lib/mockAuth'
import { MockDataService, Quest, QuestApplication } from '@/lib/mockData'
import { CreateQuestDialog } from '@/components/company/CreateQuestDialog'
import { QuestApplicationsDialog } from '@/components/company/QuestApplicationsDialog'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Link from 'next/link'
import Image from 'next/image'

export default function CompanyDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [quests, setQuests] = useState<Quest[]>([])
  const [applications, setApplications] = useState<QuestApplication[]>([])
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [showCreateQuest, setShowCreateQuest] = useState(false)
  const [showApplications, setShowApplications] = useState(false)

  useEffect(() => {
    const currentUser = MockAuthService.getCurrentUser()
    if (!currentUser || currentUser.role !== 'company') {
      window.location.href = '/login'
      return
    }
    
    setUser(currentUser)
    
    // Load company's quests
    const companyQuests = MockDataService.getQuestsByCompany(currentUser.id)
    setQuests(companyQuests)
  }, [])

  const handleViewApplications = (quest: Quest) => {
    setSelectedQuest(quest)
    const questApplications = MockDataService.getApplicationsForQuest(quest.id)
    setApplications(questApplications)
    setShowApplications(true)
  }

  const handleLogout = () => {
    MockAuthService.signOut()
    window.location.href = '/'
  }

  const stats = {
    totalQuests: quests.length,
    activeQuests: quests.filter(q => q.status === 'active').length,
    completedQuests: quests.filter(q => q.status === 'completed').length,
    totalApplications: quests.reduce((sum, q) => sum + q.applications_count, 0)
  }

  if (!user) {
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
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
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
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user.company_name || user.name}!</h2>
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
            <Button onClick={() => setShowCreateQuest(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Quest
            </Button>
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
                      <div className="flex items-center justify-between">
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
                            {quest.applications_count} applications
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
                        </div>
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
      <CreateQuestDialog 
        open={showCreateQuest}
        onOpenChange={setShowCreateQuest}
        onQuestCreated={(quest) => {
          setQuests([quest, ...quests])
          setShowCreateQuest(false)
        }}
      />

      <QuestApplicationsDialog
        open={showApplications}
        onOpenChange={setShowApplications}
        quest={selectedQuest}
        applications={applications}
      />
    </div>
  )
}