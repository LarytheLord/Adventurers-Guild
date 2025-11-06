'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Users, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';

interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  xp_reward: number;
  status: string;
}

interface UserStats {
  xp: number;
  level: number;
 rank: string;
  questsCompleted: number;
  activeQuests: number;
  skillPoints: number;
}

export default function AdventurerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and has appropriate role
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated' && session?.user?.role === 'company') {
      // Redirect companies to their dashboard
      router.push('/dashboard/company');
      return;
    } else if (status === 'authenticated' && session?.user?.role === 'admin') {
      // Redirect admins to their dashboard
      router.push('/admin');
      return;
    }

    // Fetch user stats and quests
    const fetchData = async () => {
      try {
        // In a real implementation, this would fetch from an API
        // For now, using mock data
        const mockStats: UserStats = {
          xp: 2450,
          level: 5,
          rank: 'C',
          questsCompleted: 12,
          activeQuests: 3,
          skillPoints: 150
        };

        const mockQuests: Quest[] = [
          {
            id: '1',
            title: 'Build Authentication System',
            description: 'Create a secure authentication system with OAuth integration',
            difficulty: 'B',
            xp_reward: 1200,
            status: 'in_progress'
          },
          {
            id: '2',
            title: 'API Documentation',
            description: 'Document existing REST API endpoints with examples',
            difficulty: 'C',
            xp_reward: 600,
            status: 'assigned'
          },
          {
            id: '3',
            title: 'UI Redesign',
            description: 'Redesign the user dashboard with modern UX principles',
            difficulty: 'A',
            xp_reward: 2000,
            status: 'completed'
          }
        ];
        
        setStats(mockStats);
        setQuests(mockQuests);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, session, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const xpToNextLevel = stats ? (stats.level + 1) * 1000 : 1000;
 const xpProgress = stats ? ((stats.xp % 1000) / 10) : 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
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
                <Target className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {quests.filter(q => q.status === 'in_progress' || q.status === 'assigned').length === 0 ? (
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
              {quests
                .filter(q => q.status === 'in_progress' || q.status === 'assigned')
                .map((quest) => (
                  <div
                    key={quest.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{quest.title}</h4>
                      <p className="text-sm text-muted-foreground truncate max-w-md">
                        {quest.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{quest.difficulty}-Rank</Badge>
                        <Badge variant="outline">{quest.status}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{quest.xp_reward} XP</div>
                      <Button asChild variant="ghost" size="sm" className="h-auto p-0 mt-1">
                        <Link href={`/dashboard/quests/${quest.id}`}>
                          View Quest
                        </Link>
                      </Button>
                    </div>
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
          <Link href="/dashboard/skill-tree">
            <CardHeader>
              <Zap className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Skill Tree</CardTitle>
              <CardDescription>
                Develop your abilities and expertise
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
