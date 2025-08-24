'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Star, Target } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Database } from '@/types/supabase'

type UserProfile = Database['public']['Tables']['users']['Row']

export function StudentDashboard() {
  const { profile, loading } = useAuth()

  if (loading || !profile) {
    return <div>Loading...</div>
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* User Profile Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profile</CardTitle>
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback>{profile.name?.substring(0, 2) || ''}</AvatarFallback>
          </Avatar>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{profile.name}</div>
          <p className="text-xs text-muted-foreground">
            {profile.rank}-Rank Adventurer
          </p>
        </CardContent>
      </Card>

      {/* XP Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Experience Points</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{profile.xp?.toLocaleString()}</div>
          <Progress value={((profile.xp || 0) / 25000) * 100} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {25000 - (profile.xp || 0)} XP to next rank
          </p>
        </CardContent>
      </Card>

      {/* Current Rank */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{profile.rank}-Rank</div>
          <p className="text-xs text-muted-foreground">
            {profile.role === 'student' ? 'Adventurer' : 'Company'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}