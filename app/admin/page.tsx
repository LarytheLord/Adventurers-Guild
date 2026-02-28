'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Target,
  TrendingUp,
  Shield,
  Activity,
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

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, totalQuests: 0, activeQuests: 0, completedQuests: 0 });
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        const [usersRes, questsRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/quests'),
        ]);

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          const userList = usersData.users || [];
          setUsers(userList.slice(0, 10));
          setStats(prev => ({ ...prev, totalUsers: userList.length }));
        }

        if (questsRes.ok) {
          const questsData = await questsRes.json();
          const questList = questsData.quests || [];
          setStats(prev => ({
            ...prev,
            totalQuests: questList.length,
            activeQuests: questList.filter((q: any) => q.status === 'available' || q.status === 'in_progress').length,
            completedQuests: questList.filter((q: any) => q.status === 'completed').length,
          }));
        }
      } catch (err) {
        console.error('Error fetching admin data:', err);
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
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform overview and management</p>
          </div>
        </div>

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
                    <div className="flex-1">
                      <div className="font-medium">{u.name}</div>
                      <div className="text-sm text-muted-foreground">{u.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{u.role}</Badge>
                      <Badge className={RANK_COLORS[u.rank] || RANK_COLORS.F}>
                        {u.rank}-Rank
                      </Badge>
                      <span className="text-sm text-muted-foreground">
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
