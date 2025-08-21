'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Shield, 
  Users, 
  Briefcase, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Activity,
  FileText,
  Search,
  Filter,
  Download,
  Settings,
  Ban,
  UserCheck,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  PieChart,
  Database,
  Server
} from 'lucide-react'
import { toast } from 'sonner'

// Mock data for admin dashboard
const mockPlatformStats = {
  totalUsers: 2547,
  activeUsers: 1823,
  totalQuests: 428,
  activeQuests: 156,
  completedQuests: 234,
  totalRevenue: 325000,
  monthlyRevenue: 45000,
  growthRate: 23.5,
  newUsersToday: 12,
  questsToday: 5,
  applicationsToday: 34,
  flaggedContent: 3
}

const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'adventurer',
    rank: 'Gold',
    status: 'active',
    joinedDate: '2024-01-15',
    questsCompleted: 12,
    rating: 4.8
  },
  {
    id: 2,
    name: 'TechCorp Inc.',
    email: 'contact@techcorp.com',
    role: 'company',
    rank: null,
    status: 'active',
    joinedDate: '2024-01-20',
    questsPosted: 8,
    totalSpent: 45000
  },
  {
    id: 3,
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'adventurer',
    rank: 'Platinum',
    status: 'suspended',
    joinedDate: '2023-12-10',
    questsCompleted: 25,
    rating: 4.9
  },
  {
    id: 4,
    name: 'Mike Chen',
    email: 'mike@example.com',
    role: 'adventurer',
    rank: 'Silver',
    status: 'active',
    joinedDate: '2024-02-01',
    questsCompleted: 5,
    rating: 4.5
  }
]

const mockQuests = [
  {
    id: 1,
    title: 'Build E-commerce Platform',
    company: 'TechCorp Inc.',
    status: 'active',
    budget: 5000,
    applications: 8,
    created: '2024-02-15',
    flagged: false
  },
  {
    id: 2,
    title: 'Mobile App Development',
    company: 'StartupXYZ',
    status: 'under_review',
    budget: 8000,
    applications: 12,
    created: '2024-02-20',
    flagged: true
  },
  {
    id: 3,
    title: 'API Integration Project',
    company: 'FinanceApp',
    status: 'completed',
    budget: 3000,
    applications: 5,
    created: '2024-01-25',
    flagged: false
  }
]

const mockDisputes = [
  {
    id: 1,
    questTitle: 'Website Redesign',
    complainant: 'John Doe',
    respondent: 'DesignCo',
    type: 'Payment Issue',
    status: 'pending',
    priority: 'high',
    createdDate: '2024-02-22'
  },
  {
    id: 2,
    questTitle: 'Data Analysis Project',
    complainant: 'DataCorp',
    respondent: 'Alice Smith',
    type: 'Quality Issue',
    status: 'investigating',
    priority: 'medium',
    createdDate: '2024-02-20'
  }
]

export default function AdminDashboard() {
  const { profile, loading, signOut } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')

  // Redirect if not an admin user
  if (!loading && (!profile || profile.role !== 'admin')) {
    router.push('/login')
    return null
  }

  const handleUserAction = (action: string, userId: number) => {
    switch (action) {
      case 'suspend':
        toast.success('User suspended successfully')
        break
      case 'activate':
        toast.success('User activated successfully')
        break
      case 'delete':
        toast.success('User deleted successfully')
        break
      default:
        break
    }
  }

  const handleQuestAction = (action: string, questId: number) => {
    switch (action) {
      case 'approve':
        toast.success('Quest approved successfully')
        break
      case 'reject':
        toast.success('Quest rejected')
        break
      case 'flag':
        toast.warning('Quest flagged for review')
        break
      default:
        break
    }
  }

  const handleDisputeAction = (action: string, disputeId: number) => {
    toast.success(`Dispute ${action} successfully`)
  }

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Platform Administration</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Avatar>
                <AvatarImage src="/admin-avatar.png" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Platform Stats Overview */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockPlatformStats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{mockPlatformStats.newUsersToday} today
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Quests</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockPlatformStats.activeQuests}</div>
              <p className="text-xs text-muted-foreground">
                {mockPlatformStats.completedQuests} completed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${mockPlatformStats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{mockPlatformStats.growthRate}% growth
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.5%</div>
              <p className="text-xs text-muted-foreground">
                {mockPlatformStats.flaggedContent} flagged items
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alert Banner for Critical Issues */}
        {mockPlatformStats.flaggedContent > 0 && (
          <Card className="mb-8 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-base">Attention Required</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                There are {mockPlatformStats.flaggedContent} flagged items requiring review.
                {mockDisputes.filter(d => d.status === 'pending').length > 0 && 
                  ` Additionally, ${mockDisputes.filter(d => d.status === 'pending').length} disputes are pending resolution.`
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="quests">Quests</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest platform activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded">
                        <UserCheck className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New user registered</p>
                        <p className="text-xs text-muted-foreground">john.doe@example.com - 5 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                        <Briefcase className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Quest completed</p>
                        <p className="text-xs text-muted-foreground">API Integration Project - 1 hour ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Content flagged</p>
                        <p className="text-xs text-muted-foreground">Mobile App Development - 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded">
                        <DollarSign className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Payment processed</p>
                        <p className="text-xs text-muted-foreground">$5,000 - TechCorp Inc. - 3 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Metrics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">User Engagement</span>
                        <span className="text-sm font-medium">71%</span>
                      </div>
                      <Progress value={71} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Quest Success Rate</span>
                        <span className="text-sm font-medium">89%</span>
                      </div>
                      <Progress value={89} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Platform Uptime</span>
                        <span className="text-sm font-medium">99.9%</span>
                      </div>
                      <Progress value={99.9} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
                        <span className="text-sm font-medium">4.7/5.0</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-auto flex-col py-4">
                    <Users className="h-5 w-5 mb-2" />
                    <span className="text-xs">Manage Users</span>
                  </Button>
                  <Button variant="outline" className="h-auto flex-col py-4">
                    <Briefcase className="h-5 w-5 mb-2" />
                    <span className="text-xs">Review Quests</span>
                  </Button>
                  <Button variant="outline" className="h-auto flex-col py-4">
                    <AlertTriangle className="h-5 w-5 mb-2" />
                    <span className="text-xs">Handle Disputes</span>
                  </Button>
                  <Button variant="outline" className="h-auto flex-col py-4">
                    <Download className="h-5 w-5 mb-2" />
                    <span className="text-xs">Export Data</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-[300px]"
                  />
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="adventurer">Adventurers</SelectItem>
                    <SelectItem value="company">Companies</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Export Users
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.role}
                          </Badge>
                          {user.rank && (
                            <Badge variant="secondary" className="ml-2">
                              {user.rank}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.status === 'active' ? 'default' : 'destructive'}
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.joinedDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {user.role === 'adventurer' ? (
                            <span className="text-sm">
                              {user.questsCompleted} quests • ⭐ {user.rating}
                            </span>
                          ) : user.role === 'company' ? (
                            <span className="text-sm">
                              {user.questsPosted} posted • ${user.totalSpent?.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setIsUserDialogOpen(true)
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUserAction(user.status === 'active' ? 'suspend' : 'activate', user.id)}
                            >
                              {user.status === 'active' ? 
                                <Ban className="w-4 h-4 text-red-600" /> : 
                                <UserCheck className="w-4 h-4 text-green-600" />
                              }
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUserAction('delete', user.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quests Tab */}
          <TabsContent value="quests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quest Management</CardTitle>
                <CardDescription>Review and moderate posted quests</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quest</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Applications</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockQuests.map((quest) => (
                      <TableRow key={quest.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{quest.title}</p>
                            {quest.flagged && (
                              <Badge variant="destructive" className="mt-1">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Flagged
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{quest.company}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={quest.status === 'active' ? 'default' : 
                                    quest.status === 'completed' ? 'secondary' : 'outline'}
                          >
                            {quest.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>${quest.budget.toLocaleString()}</TableCell>
                        <TableCell>{quest.applications}</TableCell>
                        <TableCell>{new Date(quest.created).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {quest.status === 'under_review' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuestAction('approve', quest.id)}
                                >
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuestAction('reject', quest.id)}
                                >
                                  <XCircle className="w-4 h-4 text-red-600" />
                                </Button>
                              </>
                            )}
                            {!quest.flagged && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuestAction('flag', quest.id)}
                              >
                                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Disputes Tab */}
          <TabsContent value="disputes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dispute Resolution</CardTitle>
                <CardDescription>Manage disputes between users</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quest</TableHead>
                      <TableHead>Parties</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDisputes.map((dispute) => (
                      <TableRow key={dispute.id}>
                        <TableCell className="font-medium">{dispute.questTitle}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{dispute.complainant}</p>
                            <p className="text-muted-foreground">vs {dispute.respondent}</p>
                          </div>
                        </TableCell>
                        <TableCell>{dispute.type}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={dispute.priority === 'high' ? 'destructive' : 
                                    dispute.priority === 'medium' ? 'default' : 'secondary'}
                          >
                            {dispute.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {dispute.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(dispute.createdDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDisputeAction('resolved', dispute.id)}
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Monthly user registration trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Chart visualization coming soon
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Distribution</CardTitle>
                  <CardDescription>Revenue by quest category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center">
                    <PieChart className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Chart visualization coming soon
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Platform Statistics</CardTitle>
                <CardDescription>Detailed platform metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Avg. Quest Value</p>
                    <p className="text-2xl font-bold">$4,250</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold">89%</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Avg. Time to Complete</p>
                    <p className="text-2xl font-bold">7.2 days</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">User Retention</p>
                    <p className="text-2xl font-bold">76%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Infrastructure and performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">API Response Time</span>
                      </div>
                      <span className="text-sm font-medium">124ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Database Load</span>
                      </div>
                      <span className="text-sm font-medium">32%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">CPU Usage</span>
                      </div>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Memory Usage</span>
                      </div>
                      <span className="text-sm font-medium">2.8GB / 8GB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                  <CardDescription>Platform settings and features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">AI Rank Testing</p>
                        <p className="text-xs text-muted-foreground">Automated skill assessment</p>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Payment Processing</p>
                        <p className="text-xs text-muted-foreground">Stripe integration</p>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Email Notifications</p>
                        <p className="text-xs text-muted-foreground">SendGrid service</p>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Maintenance Mode</p>
                        <p className="text-xs text-muted-foreground">Disable platform access</p>
                      </div>
                      <input type="checkbox" className="toggle" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Backup & Recovery</CardTitle>
                <CardDescription>Data backup status and recovery options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Last Backup</p>
                      <p className="text-sm text-muted-foreground">February 24, 2024 at 3:00 AM</p>
                    </div>
                    <Button variant="outline">Run Backup</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Backup Storage</p>
                      <p className="text-sm text-muted-foreground">245 GB used of 500 GB</p>
                    </div>
                    <Progress value={49} className="w-[100px]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* User Details Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View and manage user information
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-sm font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label>Role</Label>
                  <p className="text-sm font-medium">{selectedUser.role}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={selectedUser.status === 'active' ? 'default' : 'destructive'}>
                    {selectedUser.status}
                  </Badge>
                </div>
                <div>
                  <Label>Joined</Label>
                  <p className="text-sm font-medium">{new Date(selectedUser.joinedDate).toLocaleDateString()}</p>
                </div>
                {selectedUser.rank && (
                  <div>
                    <Label>Rank</Label>
                    <p className="text-sm font-medium">{selectedUser.rank}</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Activity Summary</Label>
                {selectedUser.role === 'adventurer' ? (
                  <div className="text-sm space-y-1">
                    <p>Quests Completed: {selectedUser.questsCompleted}</p>
                    <p>Rating: ⭐ {selectedUser.rating}</p>
                  </div>
                ) : selectedUser.role === 'company' ? (
                  <div className="text-sm space-y-1">
                    <p>Quests Posted: {selectedUser.questsPosted}</p>
                    <p>Total Spent: ${selectedUser.totalSpent?.toLocaleString()}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No activity data</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
              Close
            </Button>
            <Button variant="destructive">
              Suspend User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
