'use client';

import { useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApiFetch } from '@/lib/hooks';
import {
  Users,
  Target,
  TrendingUp,
  Shield,
  Activity,
  DollarSign,
  Plus,
  ClipboardList,
  ArrowRight,
  Loader2,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalQuests: number;
  activeQuests: number;
  completedQuests: number;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  rank: string;
  xp: number;
  level: number;
}

interface QuestItem {
  status: string;
}

interface AdminUsersResponse {
  success: boolean;
  users: UserItem[];
  error?: string;
}

interface AdminQuestsResponse {
  success: boolean;
  quests: QuestItem[];
  error?: string;
}

const EMPTY_USERS: UserItem[] = [];
const EMPTY_QUESTS: QuestItem[] = [];

const RANK_COLORS: Record<string, string> = {
  S: 'bg-amber-100 text-amber-800',
  A: 'bg-violet-100 text-violet-800',
  B: 'bg-blue-100 text-blue-800',
  C: 'bg-green-100 text-green-800',
  D: 'bg-slate-100 text-slate-800',
  E: 'bg-purple-100 text-purple-800',
  F: 'bg-gray-100 text-gray-800',
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const shouldFetch = status === 'authenticated' && session?.user?.role === 'admin';

  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
  } = useApiFetch<AdminUsersResponse>('/api/admin/users', {
    skip: !shouldFetch,
  });
  const {
    data: questsData,
    loading: questsLoading,
    error: questsError,
  } = useApiFetch<AdminQuestsResponse>('/api/admin/quests?limit=200', {
    skip: !shouldFetch,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [router, session, status]);

  const allUsers = usersData?.users ?? EMPTY_USERS;
  const users = allUsers.slice(0, 10);
  const questList = questsData?.quests ?? EMPTY_QUESTS;
  const fetchError = usersError ?? questsError;

  const stats = useMemo<AdminStats>(
    () => ({
      totalUsers: allUsers.length,
      totalQuests: questList.length,
      activeQuests: questList.filter(
        (quest) => quest.status === 'available' || quest.status === 'in_progress'
      ).length,
      completedQuests: questList.filter((quest) => quest.status === 'completed').length,
    }),
    [allUsers, questList]
  );

  if (status === 'loading' || (shouldFetch && (usersLoading || questsLoading))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (status !== 'authenticated' || session?.user?.role !== 'admin') {
    return null;
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive text-sm">{fetchError}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl space-y-8 px-4 py-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform overview and management</p>
          </div>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Phase 1 Quick Actions</CardTitle>
            <CardDescription>Create and manage quests for intern pilots</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/dashboard/company/create-quest">
                <Plus className="h-4 w-4" />
                Create Quest
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/quests">
                <ClipboardList className="h-4 w-4" />
                Manage Quests
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10">
              <Link href="/admin/qa-queue">
                <Shield className="h-4 w-4" />
                QA Queue
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/quests">
                <Target className="h-4 w-4" />
                Quest Board (Adventurer view)
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/api-budgets">
                <DollarSign className="h-4 w-4" />
                API Budgets
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quests</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Quests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeQuests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedQuests}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Phase 1 Pilot Checklist
            </CardTitle>
            <CardDescription>Steps to run the first intern cohort</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                done: stats.totalQuests > 0,
                label: 'Create at least one quest for interns',
                link: '/dashboard/company/create-quest',
              },
              { done: stats.totalUsers > 1, label: 'Interns have registered accounts', link: null },
              {
                done: stats.activeQuests > 0,
                label: 'At least one quest is live and available',
                link: '/admin/quests',
              },
              { done: false, label: 'Walk interns through quest selection', link: '/dashboard/quests' },
              { done: false, label: 'Add observation notes after first session', link: '/admin/quests' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                {item.done ? (
                  <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
                ) : (
                  <Clock className="h-5 w-5 shrink-0 text-muted-foreground" />
                )}
                <span
                  className={`flex-1 text-sm ${
                    item.done ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  {item.label}
                </span>
                {item.link && !item.done && (
                  <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                    <Link href={item.link}>
                      Go <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest registered users on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">No users found</p>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{user.name}</div>
                      <div className="truncate text-sm text-muted-foreground">{user.email}</div>
                    </div>
                    <div className="ml-3 flex shrink-0 items-center gap-2">
                      <Badge variant="outline">{user.role}</Badge>
                      <Badge className={RANK_COLORS[user.rank] ?? RANK_COLORS.F}>
                        {user.rank}-Rank
                      </Badge>
                      <span className="hidden text-sm text-muted-foreground sm:inline">
                        Lv.{user.level} | {user.xp} XP
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
