'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useApiFetch } from '@/lib/hooks';
import { AlertTriangle, ArrowLeft, DollarSign, Loader2 } from 'lucide-react';

interface BudgetEntry {
  userId: string;
  name: string;
  rank: string;
  track: 'BOOTCAMP' | 'INTERN';
  spent: number;
  cap: number;
  percentUsed: number;
  overCap: boolean;
  nearCap: boolean;
}

const EMPTY_BUDGETS: BudgetEntry[] = [];

export default function ApiBudgetsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const shouldFetch = status === 'authenticated' && session?.user?.role === 'admin';
  const { data, loading, error } = useApiFetch<BudgetEntry[]>('/api/admin/api-budgets', {
    skip: !shouldFetch,
    cache: 'no-store',
    showToast: false,
  });
  const budgets = data ?? EMPTY_BUDGETS;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [router, session, status]);

  const weekStart = new Date();
  const dayOfWeek = weekStart.getUTCDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  weekStart.setUTCDate(weekStart.getUTCDate() - daysSinceMonday);
  weekStart.setUTCHours(0, 0, 0, 0);

  const weekLabel = weekStart.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const overCapCount = budgets.filter((budget) => budget.overCap).length;
  const nearCapCount = budgets.filter((budget) => budget.nearCap).length;
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalCap = budgets.reduce((sum, budget) => sum + budget.cap, 0);

  if (status === 'loading' || (shouldFetch && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (status !== 'authenticated' || session?.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl space-y-6 px-4 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Button variant="ghost" asChild className="mb-3 px-0 text-sm">
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4" />
                Back to admin
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">API Key Budgets</h1>
            <p className="mt-1 text-muted-foreground">Week of {weekLabel}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/quests">Review quest activity</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCap.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Across tracked users this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {totalCap > 0 ? Math.round((totalSpent / totalCap) * 100) : 0}% used
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Near Cap (&gt;80%)</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{nearCapCount}</div>
              <p className="text-xs text-muted-foreground">Users at risk</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Over Cap</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overCapCount}</div>
              <p className="text-xs text-muted-foreground">Action required</p>
            </CardContent>
          </Card>
        </div>

        {overCapCount > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {overCapCount} user(s) have exceeded their API budget cap. Review and adjust caps as needed.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>User Budgets</CardTitle>
            <CardDescription>Current week API spend by user</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : budgets.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>No API spend recorded this week.</p>
              </div>
            ) : (
              <div className="relative overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-800 text-xs uppercase text-slate-300">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Rank</th>
                      <th className="px-4 py-3">Track</th>
                      <th className="px-4 py-3 text-right">Cap</th>
                      <th className="px-4 py-3 text-right">Spent</th>
                      <th className="px-4 py-3">Used</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgets.map((budget) => (
                      <tr
                        key={budget.userId}
                        className={`border-b border-slate-800 ${
                          budget.overCap
                            ? 'bg-red-950/20'
                            : budget.nearCap
                            ? 'bg-amber-950/20'
                            : ''
                        }`}
                      >
                        <td className="px-4 py-3 font-medium text-white">{budget.name}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="bg-slate-800">
                            {budget.rank}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{budget.track}</td>
                        <td className="px-4 py-3 text-right text-slate-300">
                          ${budget.cap.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-300">
                          ${budget.spent.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={Math.min(budget.percentUsed, 100)}
                              className="h-2 w-24"
                            />
                            <span
                              className={`text-xs font-medium ${
                                budget.overCap
                                  ? 'text-red-400'
                                  : budget.nearCap
                                  ? 'text-amber-400'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {budget.percentUsed}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {budget.overCap ? (
                            <Badge variant="destructive" className="bg-red-500">
                              Over cap
                            </Badge>
                          ) : budget.nearCap ? (
                            <Badge className="bg-amber-500 text-black">Near cap</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                              OK
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
