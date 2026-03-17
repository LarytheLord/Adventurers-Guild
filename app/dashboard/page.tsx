import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma, withDbRetry } from '@/lib/db';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowRight,
  Clock,
  Flame,
  Sparkles,
  Target,
  Trophy,
  TrendingUp,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { RankBadge } from '@/components/ui/rank-badge';
import type { Rank } from '@/components/ui/rank-badge';
import { RANK_THRESHOLDS } from '@/lib/ranks';
import {
  GuildCard,
  GuildChip,
  GuildHero,
  GuildKpi,
  GuildListItem,
  GuildPage,
  GuildPanel,
} from '@/components/guild/primitives';

const RANK_ORDER: Rank[] = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role === 'company') {
    redirect('/dashboard/company');
  }

  if (session.user.role === 'admin') {
    redirect('/admin');
  }

  const userId = session.user.id;

  const [user, activeAssignments, availableQuests] = await withDbRetry(() => Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        rank: true,
        level: true,
        skillPoints: true,
        name: true,
        adventurerProfile: {
          select: {
            specialization: true,
            totalQuestsCompleted: true,
            questCompletionRate: true,
            currentStreak: true,
          },
        },
      },
    }),
    prisma.questAssignment.findMany({
      where: {
        userId,
        status: { in: ['assigned', 'started', 'in_progress', 'submitted', 'review'] },
      },
      include: {
        quest: {
          select: {
            id: true,
            title: true,
            status: true,
            xpReward: true,
            skillPointsReward: true,
            monetaryReward: true,
            deadline: true,
            company: { select: { name: true } },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
      take: 5,
    }),
    prisma.quest.findMany({
      where: { status: 'available' },
      select: {
        id: true,
        title: true,
        difficulty: true,
        questCategory: true,
        xpReward: true,
        skillPointsReward: true,
        monetaryReward: true,
        requiredSkills: true,
        requiredRank: true,
        company: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 24,
    }),
  ]));

  const [completedCount, reviewCount, totalAdventurers] = await withDbRetry(() => Promise.all([
    prisma.questAssignment.count({ where: { userId, status: 'completed' } }),
    prisma.questAssignment.count({ where: { userId, status: { in: ['submitted', 'review'] } } }),
    prisma.user.count({ where: { role: 'adventurer' } }),
  ]));

  const xp = user?.xp ?? 0;
  const rank = (user?.rank ?? 'F') as Rank;
  const level = user?.level ?? 1;
  const rankIndex = RANK_ORDER.indexOf(rank);
  const currentThreshold = RANK_THRESHOLDS[rankIndex]?.threshold ?? 0;
  const nextEntry = RANK_THRESHOLDS[rankIndex + 1];
  const xpToNext = nextEntry ? Math.max(0, nextEntry.threshold - xp) : 0;
  const progress =
    nextEntry && nextEntry.threshold > currentThreshold
      ? Math.max(0, Math.min(100, ((xp - currentThreshold) / (nextEntry.threshold - currentThreshold)) * 100))
      : 100;
  const specialization = user?.adventurerProfile?.specialization || 'Generalist';

  const leaderboardPosition =
    (await withDbRetry(() => prisma.user.count({ where: { role: 'adventurer', xp: { gt: xp } } }))) + 1;

  const rankValue = (candidate: string | null | undefined) => {
    if (!candidate) return 0;
    const idx = RANK_ORDER.indexOf(candidate as Rank);
    return idx >= 0 ? idx : 0;
  };

  const recommendedQuests = availableQuests
    .filter((quest) => {
      const requirement = quest.requiredRank ?? quest.difficulty;
      return rankValue(requirement) <= rankValue(rank);
    })
    .slice(0, 4);

  return (
    <GuildPage>
      <GuildHero>
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Badge className="rounded-full border border-orange-300 bg-orange-100 text-orange-700">
              Adventurer Command Center
            </Badge>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                Welcome back, {user?.name || session.user.name || 'Adventurer'}.
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                You are {leaderboardPosition} of {totalAdventurers} on the guild board. Keep momentum,
                ship quests, and lock in your next rank.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <GuildChip>{specialization}</GuildChip>
              <GuildChip>Level {level}</GuildChip>
              <GuildChip>{user?.adventurerProfile?.currentStreak ?? 0} day streak</GuildChip>
            </div>
          </div>

          <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RankBadge rank={rank} size="sm" />
                <p className="text-sm font-semibold text-slate-700">{rank}-Rank progression</p>
              </div>
              <p className="text-sm font-semibold text-slate-900">{xp.toLocaleString()} XP</p>
            </div>
            <Progress value={progress} className="h-2.5" />
            <p className="text-xs text-slate-600">
              {nextEntry
                ? `${xpToNext.toLocaleString()} XP to ${nextEntry.rank}-Rank`
                : 'You reached S-Rank. Maintain your lead.'}
            </p>
            <div className="flex gap-2 pt-1">
              <Button className="flex-1" asChild>
                <Link href="/dashboard/quests">
                  Discover Quests
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/dashboard/leaderboard">View Leaderboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </GuildHero>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GuildKpi>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Rank</p>
          <div className="mt-2 flex items-center gap-2">
            <RankBadge rank={rank} size="sm" />
            <p className="text-xl font-bold text-slate-900">{rank}-Rank</p>
          </div>
          <p className="mt-2 text-xs text-slate-500">{user?.skillPoints ?? 0} skill points available</p>
        </GuildKpi>

        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">XP Total</p>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{xp.toLocaleString()}</p>
          <p className="mt-1 text-xs text-slate-500">
            {nextEntry ? `${xpToNext.toLocaleString()} XP to ${nextEntry.rank}` : 'Top tier achieved'}
          </p>
        </GuildKpi>

        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active Pipeline</p>
            <Target className="h-4 w-4 text-sky-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{activeAssignments.length}</p>
          <p className="mt-1 text-xs text-slate-500">{reviewCount} waiting for review</p>
        </GuildKpi>

        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completed Quests</p>
            <Trophy className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{completedCount}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            {user?.adventurerProfile?.questCompletionRate?.toString() ?? '0.00'}% completion rate
          </p>
        </GuildKpi>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <GuildCard className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Current Quest Pipeline</CardTitle>
              <CardDescription>Assignments already in your queue</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/my-quests">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeAssignments.length === 0 ? (
              <div className="flex h-[200px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-500">
                <p>No active quests yet.</p>
                <Button size="sm" asChild>
                  <Link href="/dashboard/quests">Browse Quest Board</Link>
                </Button>
              </div>
            ) : (
              activeAssignments.map((assignment) => (
                <GuildListItem
                  asChild
                  key={assignment.id}
                  className="flex items-start justify-between gap-3"
                >
                  <Link href={`/dashboard/quests/${assignment.quest.id}`}>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">{assignment.quest.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {assignment.quest.company?.name || 'Unknown Company'}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3 text-amber-500" />
                          {assignment.quest.xpReward} XP
                        </span>
                        <span>{assignment.quest.skillPointsReward} SP</span>
                        {assignment.quest.monetaryReward && (
                          <span className="font-medium text-emerald-600">
                            ${Number(assignment.quest.monetaryReward)}
                          </span>
                        )}
                        {assignment.quest.deadline && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(assignment.quest.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0 capitalize">
                      {assignment.status.replace('_', ' ')}
                    </Badge>
                  </Link>
                </GuildListItem>
              ))
            )}
          </CardContent>
        </GuildCard>

        <GuildCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Ranking Snapshot
            </CardTitle>
            <CardDescription>Your standing in the guild right now</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Guild Position</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                #{leaderboardPosition}
                <span className="ml-1 text-sm font-medium text-slate-500">/ {totalAdventurers}</span>
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Career Focus</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{specialization}</p>
              <p className="mt-2 text-xs text-slate-500">
                {user?.adventurerProfile?.totalQuestsCompleted ?? completedCount} total quests completed
              </p>
            </div>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/dashboard/leaderboard">
                Open Full Leaderboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </GuildCard>
      </section>

      <GuildPanel>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-sky-500" />
              Recommended Quests For You
            </CardTitle>
            <CardDescription>Matches based on your current rank and progression</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/quests">Open Quest Board</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recommendedQuests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              No matching quests yet. Check back soon for new opportunities.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {recommendedQuests.map((quest) => (
                <Link
                  key={quest.id}
                  href={`/dashboard/quests/${quest.id}`}
                  className="rounded-xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{quest.difficulty}-Rank</Badge>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {quest.questCategory}
                    </span>
                  </div>
                  <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-slate-900">{quest.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{quest.company?.name || 'Unknown Company'}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span>{quest.xpReward} XP</span>
                    <span>{quest.skillPointsReward} SP</span>
                    {quest.monetaryReward && (
                      <span className="font-semibold text-emerald-600">${Number(quest.monetaryReward)}</span>
                    )}
                  </div>
                  {quest.requiredSkills.length > 0 && (
                    <p className="mt-2 line-clamp-1 text-xs text-slate-500">
                      {quest.requiredSkills.slice(0, 3).join(' / ')}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </GuildPanel>
    </GuildPage>
  );
}
