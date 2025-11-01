'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Users, TrendingUp, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

interface UserStats {
  xp: number;
  level: number;
  rank: string;
  questsCompleted: number;
  activeQuests: number;
  skillPoints: number;
}

interface Quest {
  id: string;
  title: string;
  difficulty: string;
  xp_reward: number;
  status: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user stats
        const statsRes = await fetch('/api/users/me/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Fetch active quests
        const questsRes = await fetch('/api/users/me/quests?status=active&limit=3');
        if (questsRes.ok) {
          const questsData = await questsRes.json();
          setActiveQuests(questsData.quests || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const xpToNextLevel = stats ? (stats.level + 1) * 1000 : 1000;
  const xpProgress = stats ? (stats.xp % 1000) / 10 : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {session?.user?.name || 'Adventurer'}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your quests today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.xp || 0}</div>
            <p className="text-xs text-muted-foreground">
              Level {stats?.level || 1}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rank</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.rank || 'F'}</div>
            <p className="text-xs text-muted-foreground">
              Current ranking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quests Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.questsCompleted || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeQuests || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skill Points</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.skillPoints || 0}</div>
            <p className="text-xs text-muted-foreground">
              Available to spend
            </p>
          </CardContent>
        </Card>
      </div>

      {/* XP Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Level Progress</CardTitle>
          <CardDescription>
            {stats?.xp || 0} / {xpToNextLevel} XP to Level {(stats?.level || 1) + 1}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={xpProgress} className="h-2" />
        </CardContent>
      </Card>

      {/* Active Quests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Quests</CardTitle>
              <CardDescription>Your current ongoing adventures</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/my-quests">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeQuests.length === 0 ? (
            <div className="text-center py-8">
              <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No active quests. Start your adventure!
              </p>
              <Button asChild>
                <Link href="/dashboard/quests">Browse Quests</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeQuests.map((quest) => (
                <div
                  key={quest.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{quest.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{quest.difficulty}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {quest.xp_reward} XP
                      </span>
                    </div>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/dashboard/quests/${quest.id}`}>
                      View
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:border-primary transition-colors cursor-pointer">
          <Link href="/dashboard/quests">
            <CardHeader>
              <Target className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Browse Quests</CardTitle>
              <CardDescription>
                Find new adventures and challenges
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:border-primary transition-colors cursor-pointer">
          <Link href="/dashboard/teams">
            <CardHeader>
              <Users className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Join a Team</CardTitle>
              <CardDescription>
                Collaborate with other adventurers
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:border-primary transition-colors cursor-pointer">
          <Link href="/dashboard/leaderboard">
            <CardHeader>
              <Trophy className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>
                See how you rank against others
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </div>
  );
}
