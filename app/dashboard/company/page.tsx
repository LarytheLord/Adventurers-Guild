'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Users, TrendingUp, Plus, Coins } from 'lucide-react';
import Link from 'next/link';

interface Quest {
  id: string;
  title: string;
  description: string;
 difficulty: string;
 xp_reward: number;
  skill_points_reward: number;
 monetary_reward?: number;
  status: string;
  applicants: number;
}

export default function CompanyDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and has company role
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated' && session?.user?.role !== 'company') {
      // Redirect non-companies to their appropriate dashboard
      if (session.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      return;
    }

    // Fetch company quests
    const fetchQuests = async () => {
      try {
        // In a real implementation, this would fetch from an API
        // For now, using mock data
        const mockQuests: Quest[] = [
          {
            id: '1',
            title: 'Build Authentication System',
            description: 'Create a secure authentication system with OAuth integration',
            difficulty: 'B',
            xp_reward: 1200,
            skill_points_reward: 200,
            monetary_reward: 500,
            status: 'active',
            applicants: 3
          },
          {
            id: '2',
            title: 'API Documentation',
            description: 'Document existing REST API endpoints with examples',
            difficulty: 'C',
            xp_reward: 600,
            skill_points_reward: 100,
            status: 'draft',
            applicants: 0
          },
          {
            id: '3',
            title: 'UI Redesign',
            description: 'Redesign the user dashboard with modern UX principles',
            difficulty: 'A',
            xp_reward: 2000,
            skill_points_reward: 300,
            monetary_reward: 1200,
            status: 'completed',
            applicants: 1
          }
        ];
        
        setQuests(mockQuests);
      } catch (error) {
        console.error('Error fetching quests:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchQuests();
    }
  }, [status, session, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate company stats
 const totalQuests = quests.length;
  const activeQuests = quests.filter(q => q.status === 'active').length;
  const completedQuests = quests.filter(q => q.status === 'completed').length;
  const totalSpent = quests.reduce((sum, quest) => sum + (quest.monetary_reward || 0), 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Company Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage your quests and connect with adventurers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quests</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuests}</div>
            <p className="text-xs text-muted-foreground">+{totalQuests} this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Quests</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeQuests}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Quests</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedQuests}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">On platform</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button asChild>
          <Link href="/dashboard/company/create-quest">
            <Plus className="w-4 h-4 mr-2" />
            Create New Quest
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/company/analytics">View Analytics</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/company/profile">Company Profile</Link>
        </Button>
      </div>

      {/* Recent Quests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Quests</CardTitle>
              <CardDescription>Your latest posted quests</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/company/quests">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {quests.length === 0 ? (
            <div className="text-center py-8">
              <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No quests yet</h3>
              <p className="text-muted-foreground">Create your first quest to get started</p>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/company/create-quest">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Quest
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {quests.slice(0, 3).map((quest) => (
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
                      <span className="text-sm text-muted-foreground">
                        {quest.applicants} applicant{quest.applicants !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{quest.xp_reward} XP</div>
                    <div className="text-sm text-muted-foreground">
                      {quest.skill_points_reward} SP
                    </div>
                    {quest.monetary_reward && (
                      <div className="text-sm font-medium text-primary">
                        ${quest.monetary_reward}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Features */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Analytics</CardTitle>
          <CardDescription>Insights about your quest performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Completion Rate</span>
                <span className="text-sm font-medium">76%</span>
              </div>
              <Progress value={76} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Average Response Time</span>
                <span className="text-sm font-medium">2.3 days</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}