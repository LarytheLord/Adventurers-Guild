'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { AdminService, PlatformStats, UserAnalytics, QuestAnalytics } from "@/lib/adminService"
import { useEffect, useState } from "react"
import { Toaster } from "@/components/ui/sonner"
import { toast } from 'sonner'
import { 
  Users, 
  DollarSign, 
  Activity, 
  TrendingUp, 
  Eye, 
  Settings, 
  Download, 
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
  Clock,
  Star
} from 'lucide-react'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics[]>([])
  const [questAnalytics, setQuestAnalytics] = useState<QuestAnalytics[]>([])
  const [activityLogs, setActivityLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Announcement dialog state
  const [announcementOpen, setAnnouncementOpen] = useState(false)
  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [announcementMessage, setAnnouncementMessage] = useState('')
  const [announcementTarget, setAnnouncementTarget] = useState('all')

  useEffect(() => {
    if (user?.role === 'admin') {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [stats, users, quests, logs] = await Promise.all([
        AdminService.getPlatformStats(),
        AdminService.getUserAnalytics(20),
        AdminService.getQuestAnalytics(20),
        AdminService.getActivityLogs(50)
      ])

      setPlatformStats(stats)
      setUserAnalytics(users.users)
      setQuestAnalytics(quests.quests)
      setActivityLogs(logs)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleUserModeration = async (userId: string, action: string, reason?: string) => {
    try {
      const result = await AdminService.moderateUser(userId, action as any, reason)
      if (result.success) {
        toast.success(result.message)
        await loadDashboardData()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Moderation action failed')
    }
  }

  const handleQuestModeration = async (questId: string, action: string, reason?: string) => {
    try {
      const result = await AdminService.moderateQuest(questId, action as any, reason)
      if (result.success) {
        toast.success(result.message)
        await loadDashboardData()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Moderation action failed')
    }
  }

  const handleSendAnnouncement = async () => {
    if (!announcementTitle || !announcementMessage) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const result = await AdminService.sendAnnouncement(
        announcementTitle,
        announcementMessage,
        announcementTarget as any
      )
      
      if (result.success) {
        toast.success(result.message)
        setAnnouncementOpen(false)
        setAnnouncementTitle('')
        setAnnouncementMessage('')
        setAnnouncementTarget('all')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to send announcement')
    }
  }

  const handleExportData = async (type: string) => {
    try {
      const result = await AdminService.exportData(type as any)
      if (result.success) {
        toast.success(result.message)
        if (result.downloadUrl) {
          window.open(result.downloadUrl, '_blank')
        }
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Export failed')
    }
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>Access Denied</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">You don't have permission to access the admin dashboard.</p>
            <Button className="mt-4" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading || !platformStats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <Eye className="w-3 h-3 mr-1" />
              Admin Access
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={announcementOpen} onOpenChange={setAnnouncementOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Announcement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Platform Announcement</DialogTitle>
                  <DialogDescription>
                    Send a notification to all users or specific user groups
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input 
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      placeholder="Announcement title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <Textarea 
                      value={announcementMessage}
                      onChange={(e) => setAnnouncementMessage(e.target.value)}
                      placeholder="Announcement message"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Target Audience</label>
                    <Select value={announcementTarget} onValueChange={setAnnouncementTarget}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="student">Students Only</SelectItem>
                        <SelectItem value="company">Companies Only</SelectItem>
                        <SelectItem value="admin">Admins Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSendAnnouncement} className="w-full">
                    Send Announcement
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={loadDashboardData}>
              <Activity className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="quests">Quests</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformStats.users.total}</div>
                  <p className="text-xs text-muted-foreground">
                    +{platformStats.users.newThisMonth} this month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${platformStats.revenue.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    ${platformStats.revenue.pendingRevenue.toLocaleString()} pending
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Quests</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformStats.quests.active}</div>
                  <p className="text-xs text-muted-foreground">
                    {platformStats.quests.completed} completed
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformStats.engagement.completionRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {platformStats.engagement.avgRating.toFixed(1)} avg rating
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* User Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Students</span>
                    <span className="text-sm font-medium">{platformStats.users.students}</span>
                  </div>
                  <Progress value={(platformStats.users.students / platformStats.users.total) * 100} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Companies</span>
                    <span className="text-sm font-medium">{platformStats.users.companies}</span>
                  </div>
                  <Progress value={(platformStats.users.companies / platformStats.users.total) * 100} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Admins</span>
                    <span className="text-sm font-medium">{platformStats.users.admins}</span>
                  </div>
                  <Progress value={(platformStats.users.admins / platformStats.users.total) * 100} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quest Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {platformStats.quests.active}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completed</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {platformStats.quests.completed}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Draft</span>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      {platformStats.quests.draft}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Budget</span>
                    <span className="text-sm font-medium">${platformStats.quests.totalBudget.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" onClick={() => handleExportData('users')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Users
                  </Button>
                  <Button variant="outline" onClick={() => handleExportData('quests')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Quests
                  </Button>
                  <Button variant="outline" onClick={() => handleExportData('transactions')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Payments
                  </Button>
                  <Link href="/admin/waitlist">
                    <Button variant="outline" className="w-full">
                      <Users className="w-4 h-4 mr-2" />
                      View Waitlist
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage platform users and their permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Stats</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userAnalytics.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              user.role === 'admin' ? 'bg-red-50 text-red-700' :
                              user.role === 'company' ? 'bg-blue-50 text-blue-700' :
                              'bg-green-50 text-green-700'
                            }>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.role === 'student' && (
                              <div className="text-sm">
                                <div>Rank: {user.rank || 'F'}</div>
                                <div>XP: {user.xp || 0}</div>
                                <div>Quests: {user.questsCompleted || 0}</div>
                              </div>
                            )}
                            {(user.role === 'company' || user.role === 'client') && (
                              <div className="text-sm">
                                <div>Quests Posted: {user.questsPosted || 0}</div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.isActive ? 'default' : 'secondary'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {user.isActive ? (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleUserModeration(user.id, 'deactivate')}
                                >
                                  <XCircle className="w-3 h-3" />
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleUserModeration(user.id, 'activate')}
                                >
                                  <CheckCircle className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quest Management</CardTitle>
                <CardDescription>Monitor and moderate platform quests</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quest</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Applications</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questAnalytics.map((quest) => (
                        <TableRow key={quest.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{quest.title}</div>
                              <Badge variant="outline" className="mt-1">
                                {quest.difficulty}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{quest.companyName}</TableCell>
                          <TableCell>
                            <Badge variant={
                              quest.status === 'completed' ? 'default' :
                              quest.status === 'active' ? 'secondary' :
                              quest.status === 'in_progress' ? 'outline' :
                              'destructive'
                            }>
                              {quest.status}
                            </Badge>
                          </TableCell>
                          <TableCell>${quest.budget.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{quest.applicationsCount} applications</div>
                              {quest.rating && (
                                <div className="flex items-center">
                                  <Star className="w-3 h-3 mr-1" />
                                  {quest.rating.toFixed(1)}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {quest.status === 'draft' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleQuestModeration(quest.id, 'approve')}
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleQuestModeration(quest.id, 'reject')}
                                  >
                                    <XCircle className="w-3 h-3" />
                                  </Button>
                                </>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleQuestModeration(quest.id, 'feature')}
                              >
                                <Star className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Revenue Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Revenue</span>
                    <span className="font-bold">${platformStats.revenue.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Revenue</span>
                    <span className="font-bold">${platformStats.revenue.pendingRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaction Count</span>
                    <span className="font-bold">{platformStats.revenue.transactionCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Transaction</span>
                    <span className="font-bold">${platformStats.revenue.avgTransactionValue.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Engagement Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Completion Rate</span>
                    <span className="font-bold">{platformStats.engagement.completionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Rating</span>
                    <span className="font-bold">{platformStats.engagement.avgRating.toFixed(1)}/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Quests/User</span>
                    <span className="font-bold">{platformStats.engagement.avgQuestsPerUser.toFixed(1)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Platform activity and system events</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {activityLogs.map((log) => (
                      <div key={log.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">{log.description}</h4>
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {log.userName} • {log.type}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  )
}