import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma, withDbRetry } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { RankBadge } from '@/components/ui/rank-badge';
import type { Rank } from '@/components/ui/rank-badge';
import { RANK_THRESHOLDS, RANK_TO_TIER } from '@/lib/ranks';

const RANK_ORDER: Rank[] = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect('/login');
  if (session.user.role === 'company') redirect('/dashboard/company');
  if (session.user.role === 'admin') redirect('/admin');

  const userId = session.user.id;

  // ── Core data ─────────────────────────────────────────────────────────────
  const [user, pendingAssignments, completedAssignments, availableQuests] =
    await withDbRetry(() =>
      Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { xp: true, rank: true, level: true, name: true },
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
                monetaryReward: true,
                xpReward: true,
                deadline: true,
                company: { select: { name: true } },
              },
            },
          },
          orderBy: { assignedAt: 'desc' },
          take: 5,
        }),

        prisma.questAssignment.findMany({
          where: { userId, status: 'completed' },
          include: {
            quest: {
              select: {
                id: true,
                title: true,
                monetaryReward: true,
                xpReward: true,
                company: { select: { name: true } },
              },
            },
          },
          orderBy: { completedAt: 'desc' },
        }),

        prisma.quest.findMany({
          where: { status: 'available' },
          select: {
            id: true,
            title: true,
            difficulty: true,
            questCategory: true,
            xpReward: true,
            monetaryReward: true,
            requiredSkills: true,
            requiredRank: true,
            company: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        }),
      ])
    );

  // ── Derived stats ──────────────────────────────────────────────────────────
  const xp = user?.xp ?? 0;
  const rank = (user?.rank ?? 'F') as Rank;
  const rankIndex = RANK_ORDER.indexOf(rank);
  const currentThreshold = RANK_THRESHOLDS[rankIndex]?.threshold ?? 0;
  const nextEntry = RANK_THRESHOLDS[rankIndex + 1];
  const xpToNext = nextEntry ? Math.max(0, nextEntry.threshold - xp) : 0;
  const progress =
    nextEntry && nextEntry.threshold > currentThreshold
      ? Math.max(
        0,
        Math.min(100, ((xp - currentThreshold) / (nextEntry.threshold - currentThreshold)) * 100)
      )
      : 100;

  const completedCount = completedAssignments.length;

  const totalEarned = completedAssignments.reduce(
    (sum, a) => sum + Number(a.quest.monetaryReward ?? 0),
    0
  );

  const rankValue = (r: string | null | undefined) => {
    if (!r) return 0;
    const idx = RANK_ORDER.indexOf(r as Rank);
    return idx >= 0 ? idx : 0;
  };

  const recommendedQuests = availableQuests
    .filter((q) => rankValue(q.requiredRank ?? q.difficulty) <= rankValue(rank))
    .slice(0, 6);

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background ds-page-grain">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-10">

        {/* Header */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-500">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.name || session.user.name || 'Adventurer'}.
          </h1>
        </div>

        {/* Stats grid */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

          {/* Rank + XP — spans 2 cols */}
          <div className="xl:col-span-2 rounded-2xl border border-border/70 bg-white/95 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RankBadge rank={rank} size="md" glow />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Rank</p>
                  <p className="text-lg font-bold text-slate-900">{RANK_TO_TIER[rank] || rank}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">XP</p>
                <p className="text-lg font-bold text-slate-900">{xp.toLocaleString()}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-slate-500">
                {nextEntry
                  ? `${xpToNext.toLocaleString()} XP to ${RANK_TO_TIER[nextEntry.rank] || nextEntry.rank}`
                  : 'Maximum rank — Tier 7 Legend'}
              </p>
            </div>
          </div>

          {/* Completed */}
          <StatCard label="Quests Completed" value={String(completedCount)} sub="all time" />

          {/* Pending */}
          <StatCard
            label="Active / Pending"
            value={String(pendingAssignments.length)}
            sub={`quest${pendingAssignments.length !== 1 ? 's' : ''} in pipeline`}
          />

          {/* Money earned */}
          <StatCard
            label="Total Earned"
            value={
              totalEarned > 0
                ? new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                }).format(totalEarned)
                : '₹0'
            }
            sub="from completed quests"
          />
        </section>

        {/* Active Quests */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Active Quests</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/my-quests" className="text-sm text-slate-600 hover:text-slate-900">
                View all →
              </Link>
            </Button>
          </div>

          {pendingAssignments.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-500">No active quests yet.</p>
              <Button size="sm" asChild className="mt-4">
                <Link href="/dashboard/quests">Browse Quest Board</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingAssignments.map((a) => (
                <Link
                  key={a.id}
                  href={`/dashboard/quests/${a.quest.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-border/70 bg-white/95 px-5 py-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold text-slate-900">{a.quest.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{a.quest.company?.name ?? 'Unknown Company'}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4 text-xs text-slate-500">
                    <span className="font-medium text-amber-600">{a.quest.xpReward} XP</span>
                    {a.quest.monetaryReward && Number(a.quest.monetaryReward) > 0 && (
                      <span className="font-semibold text-emerald-600">
                        ₹{Number(a.quest.monetaryReward).toLocaleString('en-IN')}
                      </span>
                    )}
                    {a.quest.deadline && (
                      <span>
                        Due {new Date(a.quest.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                  <Badge variant="secondary" className="shrink-0 capitalize text-[10px]">
                    {a.status.replace('_', ' ')}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Earnings History */}
        {completedAssignments.length > 0 && (
          <section>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900">Earnings History</h2>
              <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                {completedCount} quests
              </span>
            </div>
            <div className="rounded-2xl border border-border/70 bg-white/95 shadow-[0_8px_24px_rgba(15,23,42,0.04)] overflow-hidden">
              <div className="divide-y divide-slate-100">
                {completedAssignments.slice(0, 8).map((a) => (
                  <div key={a.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{a.quest.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{a.quest.company?.name ?? 'Unknown'}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-emerald-600">
                        {a.quest.monetaryReward && Number(a.quest.monetaryReward) > 0
                          ? `₹${Number(a.quest.monetaryReward).toLocaleString('en-IN')}`
                          : '—'}
                      </p>
                      <p className="mt-0.5 text-xs text-amber-600">+{a.quest.xpReward} XP</p>
                    </div>
                  </div>
                ))}
              </div>
              {completedAssignments.length > 8 && (
                <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-3 text-center">
                  <p className="text-xs text-slate-500">
                    Showing 8 of {completedCount} completed quests
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Recommended Quests */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recommended Quests</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/quests" className="text-sm text-slate-600 hover:text-slate-900">
                Quest Board →
              </Link>
            </Button>
          </div>

          {recommendedQuests.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center">
              <p className="text-sm text-slate-500">No matching quests right now. Check back soon.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {recommendedQuests.map((q) => (
                <Link
                  key={q.id}
                  href={`/dashboard/quests/${q.id}`}
                  className="group rounded-2xl border border-border/70 bg-white/95 p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_8px_24px_rgba(249,115,22,0.08)]"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {q.questCategory.replace(/_/g, ' ')}
                    </Badge>
                    <RankBadge rank={q.difficulty as Rank} size="sm" />
                  </div>
                  <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">
                    {q.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 truncate">{q.company?.name ?? 'Unknown Company'}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                    <span className="font-medium text-amber-600">{q.xpReward} XP</span>
                    {q.monetaryReward && Number(q.monetaryReward) > 0 && (
                      <span className="font-semibold text-emerald-600">
                        ₹{Number(q.monetaryReward).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  {q.requiredSkills.length > 0 && (
                    <p className="mt-2 line-clamp-1 text-[11px] text-slate-400">
                      {q.requiredSkills.slice(0, 3).join(' · ')}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-white/95 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur p-5 flex flex-col justify-between gap-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div>
        <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
        <p className="mt-0.5 text-xs text-slate-400">{sub}</p>
      </div>
    </div>
  );
}
