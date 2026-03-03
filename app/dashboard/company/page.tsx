import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Coins,
  Clock3,
  Rocket,
  Sparkles,
  Target,
  Trophy,
  Users,
} from 'lucide-react';
import Link from 'next/link';

const ACTIVE_ASSIGNMENT_STATUSES = ['assigned', 'started', 'in_progress', 'submitted', 'review'] as const;

function statusBadgeClass(status: string) {
  switch (status) {
    case 'available':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    case 'in_progress':
      return 'bg-sky-100 text-sky-700 border-sky-300';
    case 'review':
      return 'bg-amber-100 text-amber-700 border-amber-300';
    case 'completed':
      return 'bg-violet-100 text-violet-700 border-violet-300';
    case 'cancelled':
      return 'bg-rose-100 text-rose-700 border-rose-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300';
  }
}

export default async function CompanyDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role === 'adventurer') {
    redirect('/dashboard');
  }

  if (session.user.role === 'admin') {
    redirect('/admin');
  }

  const companyId = session.user.id;

  const [company, quests, assignments, companySpendBoard] = await Promise.all([
    prisma.user.findUnique({
      where: { id: companyId },
      select: {
        name: true,
        email: true,
        companyProfile: {
          select: {
            companyName: true,
            industry: true,
            size: true,
            isVerified: true,
            questsPosted: true,
            totalSpent: true,
          },
        },
      },
    }),
    prisma.quest.findMany({
      where: { companyId },
      select: {
        id: true,
        title: true,
        status: true,
        difficulty: true,
        deadline: true,
        xpReward: true,
        monetaryReward: true,
        createdAt: true,
        _count: {
          select: {
            assignments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.questAssignment.findMany({
      where: {
        quest: { companyId },
      },
      select: {
        status: true,
        userId: true,
        quest: {
          select: {
            id: true,
            title: true,
            xpReward: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            rank: true,
            adventurerProfile: {
              select: {
                specialization: true,
              },
            },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
      take: 120,
    }),
    prisma.user.findMany({
      where: { role: 'company' },
      select: {
        id: true,
        companyProfile: { select: { totalSpent: true } },
      },
    }),
  ]);

  const totalQuests = quests.length;
  const openQuests = quests.filter((quest) => quest.status === 'available').length;
  const inProgressQuests = quests.filter((quest) => ['in_progress', 'review'].includes(quest.status)).length;
  const completedQuests = quests.filter((quest) => quest.status === 'completed').length;

  const activeCollaborators = new Set(
    assignments
      .filter((assignment) => ACTIVE_ASSIGNMENT_STATUSES.includes(assignment.status as (typeof ACTIVE_ASSIGNMENT_STATUSES)[number]))
      .map((assignment) => assignment.userId)
  ).size;

  const pendingReviews = assignments.filter((assignment) => ['submitted', 'review'].includes(assignment.status)).length;

  const totalSpent = Number(
    company?.companyProfile?.totalSpent ??
      quests.filter((quest) => quest.status === 'completed').reduce((acc, quest) => acc + Number(quest.monetaryReward || 0), 0)
  );

  const leaderboard = companySpendBoard
    .map((entry) => ({
      id: entry.id,
      totalSpent: Number(entry.companyProfile?.totalSpent ?? 0),
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent);

  const companyPosition = leaderboard.findIndex((entry) => entry.id === companyId) + 1;

  const topAdventurers = Object.values(
    assignments.reduce<Record<string, {
      id: string;
      name: string;
      rank: string;
      specialization: string;
      completed: number;
      active: number;
      deliveredXp: number;
    }>>((acc, assignment) => {
      if (!assignment.user || !assignment.userId) return acc;

      if (!acc[assignment.userId]) {
        acc[assignment.userId] = {
          id: assignment.userId,
          name: assignment.user.name || assignment.user.email,
          rank: assignment.user.rank,
          specialization: assignment.user.adventurerProfile?.specialization || 'Adventurer',
          completed: 0,
          active: 0,
          deliveredXp: 0,
        };
      }

      if (assignment.status === 'completed') {
        acc[assignment.userId].completed += 1;
        acc[assignment.userId].deliveredXp += assignment.quest.xpReward;
      }

      if (ACTIVE_ASSIGNMENT_STATUSES.includes(assignment.status as (typeof ACTIVE_ASSIGNMENT_STATUSES)[number])) {
        acc[assignment.userId].active += 1;
      }

      return acc;
    }, {})
  )
    .sort((a, b) => {
      if (b.completed !== a.completed) return b.completed - a.completed;
      return b.deliveredXp - a.deliveredXp;
    })
    .slice(0, 5);

  const completionRate = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;
  const pipelineHealth = totalQuests > 0 ? Math.round(((openQuests + inProgressQuests) / totalQuests) * 100) : 0;

  const urgentQuests = quests
    .filter((quest) => {
      if (!quest.deadline) return false;
      if (quest.status === 'completed' || quest.status === 'cancelled') return false;
      const msLeft = new Date(quest.deadline).getTime() - Date.now();
      return msLeft <= 1000 * 60 * 60 * 24 * 14;
    })
    .slice(0, 4);

  return (
    <div className="guild-page">
      <section className="guild-hero">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Badge className="rounded-full border border-sky-300 bg-sky-100 text-sky-700">
              Company Operations Deck
            </Badge>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                {company?.companyProfile?.companyName || company?.name || 'Company'} control center
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                Track delivery quality, manage adventurer talent, and maintain quest momentum from one place.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="guild-chip">{company?.companyProfile?.industry || 'Technology'}</span>
              <span className="guild-chip">{company?.companyProfile?.size || 'startup'} size</span>
              <span className="guild-chip">
                {company?.companyProfile?.isVerified ? 'Verified company' : 'Verification pending'}
              </span>
            </div>
          </div>

          <div className="grid w-full max-w-md grid-cols-2 gap-3">
            <Button className="col-span-2" asChild>
              <Link href="/dashboard/company/create-quest">
                <Rocket className="h-4 w-4" />
                Launch New Quest
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/company/quests">Manage Quests</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/company/analytics">Analytics</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="guild-kpi">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quest Portfolio</p>
            <Briefcase className="h-4 w-4 text-sky-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalQuests}</p>
          <p className="mt-1 text-xs text-slate-500">{openQuests} open, {inProgressQuests} in delivery</p>
        </article>

        <article className="guild-kpi">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active Adventurers</p>
            <Users className="h-4 w-4 text-violet-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{activeCollaborators}</p>
          <p className="mt-1 text-xs text-slate-500">{pendingReviews} submissions need review</p>
        </article>

        <article className="guild-kpi">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Delivery Success</p>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{completionRate}%</p>
          <p className="mt-1 text-xs text-slate-500">{completedQuests} completed quests</p>
        </article>

        <article className="guild-kpi">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Guild Spend Rank</p>
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">#{companyPosition || '-'}</p>
          <p className="mt-1 text-xs text-slate-500">${totalSpent.toLocaleString()} total platform spend</p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="guild-panel xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Quest Delivery Board</CardTitle>
              <CardDescription>Latest quests and execution status</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/company/quests">View all quests</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {quests.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
                No quests posted yet. Launch your first quest to start recruiting adventurers.
              </div>
            ) : (
              quests.slice(0, 6).map((quest) => (
                <Link
                  key={quest.id}
                  href={`/dashboard/company/quests/${quest.id}`}
                  className="guild-list-item flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">{quest.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{quest.difficulty}-Rank</span>
                      <span>{quest._count.assignments} applicant(s)</span>
                      <span>{quest.xpReward} XP</span>
                      {quest.deadline && <span>Due {new Date(quest.deadline).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <Badge variant="outline" className={statusBadgeClass(quest.status)}>
                    {quest.status.replace('_', ' ')}
                  </Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="guild-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-500" />
              Top Adventurers
            </CardTitle>
            <CardDescription>Best performers on your quests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topAdventurers.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                Adventurer ranking appears once assignments start.
              </p>
            ) : (
              topAdventurers.map((adventurer, index) => (
                <div key={adventurer.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">#{index + 1} {adventurer.name}</p>
                    <Badge variant="outline">{adventurer.rank}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{adventurer.specialization}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                    <span>{adventurer.completed} completed</span>
                    <span>{adventurer.active} active</span>
                    <span>{adventurer.deliveredXp} XP delivered</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="guild-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-500" />
              Pipeline Signals
            </CardTitle>
            <CardDescription>Health indicators for ongoing quest delivery</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-600">Delivery completion</span>
                <span className="font-semibold text-slate-900">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2.5" />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-600">Pipeline activity</span>
                <span className="font-semibold text-slate-900">{pipelineHealth}%</span>
              </div>
              <Progress value={pipelineHealth} className="h-2.5" />
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              {pendingReviews > 0
                ? `${pendingReviews} submission(s) are waiting for company review.`
                : 'No pending reviews. Quest pipeline is clear.'}
            </div>
          </CardContent>
        </Card>

        <Card className="guild-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-rose-500" />
              Urgent Quest Deadlines
            </CardTitle>
            <CardDescription>Quests due within the next 14 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {urgentQuests.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                No urgent deadlines right now.
              </p>
            ) : (
              urgentQuests.map((quest) => (
                <Link
                  key={quest.id}
                  href={`/dashboard/company/quests/${quest.id}`}
                  className="guild-list-item flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{quest.title}</p>
                    <p className="text-xs text-slate-500">{new Date(quest.deadline as Date).toLocaleDateString()}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
              ))
            )}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button variant="outline" asChild>
                <Link href="/dashboard/company/profile">
                  <Coins className="h-4 w-4" />
                  Company Profile
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/company/payments">
                  <Rocket className="h-4 w-4" />
                  Payments
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
