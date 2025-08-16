'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Users, 
  Clock,
  TrendingUp,
  BookOpen,
  Award,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Sword
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { ThemeToggle } from '@/components/ui/theme-toggle'

// XP thresholds for ranks
const XP_THRESHOLDS = {
  F: 0,
  D: 1000,
  C: 5000,
  B: 15000,
  A: 35000,
  S: 75000
}

export default function AdventurerDashboard() {
  const router = useRouter()
  const { profile, loading, signOut } = useAuth()
  const [activeQuests, setActiveQuests] = useState([])
  const [completedQuests, setCompletedQuests] = useState(0)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (!loading && !profile) {
      router.push('/login')
    }
  }, [loading, profile, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!profile || profile.role !== 'student') {
    return null
  }

  const currentRankThreshold = XP_THRESHOLDS[profile.rank as keyof typeof XP_THRESHOLDS] || 0
  const nextRank = Object.entries(XP_THRESHOLDS).find(([_, threshold]) => threshold > (profile.xp || 0))
  const nextRankThreshold = nextRank ? nextRank[1] : 100000
  const progressToNextRank = ((profile.xp || 0) - currentRankThreshold) / (nextRankThreshold - currentRankThreshold) * 100

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Sword className="w-8 h-8 text-primary" />
                <span className="text-xl font-bold">Adventurer Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <ThemeToggle />
              <Avatar>
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback>{profile.name?.charAt(0) || 'A'}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {profile.name || 'Adventurer'}!</h1>
          <p className="text-muted-foreground">
            Your journey continues. Complete quests to earn XP and rank up!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.rank}-Rank</div>
              <p className="text-xs text-muted-foreground">Adventurer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total XP</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(profile.xp || 0).toLocaleString()}</div>
              <Progress value={progressToNextRank} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {nextRankThreshold - (profile.xp || 0)} XP to {nextRank?.[0]}-Rank
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Quests</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeQuests.length}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedQuests}</div>
              <p className="text-xs text-muted-foreground">Total quests</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quests">My Quests</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Jump into your adventure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/quests">
                    <Button className="w-full justify-between" variant="outline">
                      Browse Available Quests
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/adventurer/my-quests">
                    <Button className="w-full justify-between" variant="outline">
                      View Active Quests
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/adventurer/profile">
                    <Button className="w-full justify-between" variant="outline">
                      Edit Profile
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/ai-rank-test/welcome">
                    <Button className="w-full justify-between" variant="outline">
                      Take Rank Test
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest adventures</CardDescription>
                </CardHeader>
                <CardContent>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent activity. Start by browsing available quests!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map((notification, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-muted">
                          <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{notification}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
                <CardDescription>Track your journey to becoming a legendary adventurer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Rank Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {profile.rank}-Rank → {nextRank?.[0]}-Rank
                      </span>
                    </div>
                    <Progress value={progressToNextRank} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {profile.xp?.toLocaleString()} / {nextRankThreshold.toLocaleString()} XP
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quests">
            <Card>
              <CardHeader>
                <CardTitle>My Quests</CardTitle>
                <CardDescription>Manage your active and completed quests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Quests</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't started any quests yet.
                  </p>
                  <Link href="/quests">
                    <Button>Browse Available Quests</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle>Skill Tree</CardTitle>
                <CardDescription>Your skill progression and unlocked abilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Skills System Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Track your skill development and unlock new abilities.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Your badges and accomplishments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Achievements Yet</h3>
                  <p className="text-muted-foreground">
                    Complete quests and challenges to earn achievements.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
