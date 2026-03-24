'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Target,
  TrendingUp,
  Shield,
  Activity,
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

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, totalQuests: 0, activeQuests: 0, completedQuests: 0 });
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        const [usersRes, questsRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/quests?limit=200'),
        ]);

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          const userList = usersData.users || [];
          setUsers(userList.slice(0, 10));
          setStats(prev => ({ ...prev, totalUsers: userList.length }));
        }

        if (questsRes.ok) {
          const questsData = await questsRes.json();
          const questList: QuestItem[] = questsData.quests || [];
          setStats(prev => ({
            ...prev,
            totalQuests: questList.length,
            activeQuests: questList.filter((q) => q.status === 'available' || q.status === 'in_progress').length,
            completedQuests: questList.filter((q) => q.status === 'completed').length,
          }));
        }
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setFetchError('Failed to load admin data. Please refresh the page.');
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
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive text-sm">{fetchError}</p>
      </div>
    );
  }

  const RANK_COLORS: Record<string, string> = {
    S: 'bg-amber-100 text-amber-800',
    A: 'bg-violet-100 text-violet-800',
    B: 'bg-blue-100 text-blue-800',
    C: 'bg-green-100 text-green-800',
    D: 'bg-slate-100 text-slate-800',
    E: 'bg-purple-100 text-purple-800',
    F: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 space-y-8 max-w-7xl">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform overview and management</p>
          </div>
        </div>

        {/* Quick Actions (Phase 1 priorities) */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Phase 1 — Quick Actions</CardTitle>
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
          </CardContent>
        </Card>

        {/* Stats */}
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

        {/* Phase 1 Checklist */}
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
              { done: stats.totalQuests > 0, label: 'Create at least one quest for interns', link: '/dashboard/company/create-quest' },
              { done: stats.totalUsers > 1, label: 'Interns have registered accounts', link: null },
              { done: stats.activeQuests > 0, label: 'At least one quest is live and available', link: '/admin/quests' },
              { done: false, label: 'Walk interns through quest selection', link: '/dashboard/quests' },
              { done: false, label: 'Add observation notes after first session', link: '/admin/quests' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                {item.done
                  ? <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                  : <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                }
                <span className={`flex-1 text-sm ${item.done ? 'line-through text-muted-foreground' : ''}`}>
                  {item.label}
                </span>
                {item.link && !item.done && (
                  <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                    <Link href={item.link}>Go <ArrowRight className="h-3 w-3" /></Link>
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest registered users on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No users found</p>
            ) : (
              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{u.name}</div>
                      <div className="text-sm text-muted-foreground truncate">{u.email}</div>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <Badge variant="outline">{u.role}</Badge>
                      <Badge className={RANK_COLORS[u.rank] ?? RANK_COLORS['F']}>
                        {u.rank}-Rank
                      </Badge>
                      <span className="text-sm text-muted-foreground hidden sm:inline">
                        Lv.{u.level} | {u.xp} XP
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
