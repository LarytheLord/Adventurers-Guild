import { NextRequest } from 'next/server';

import { requireAuth } from '@/lib/api-auth';
import { prisma, withDbRetry } from '@/lib/db';

const TRACKS = ['OPEN', 'INTERN', 'BOOTCAMP'] as const;
const DEFAULT_TAKE_RATE = 0.15;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

type TrackKey = (typeof TRACKS)[number];

interface TransactionRow {
  questId: string | null;
  toUserId: string | null;
  amount: string | number | null;
  currency: string | null;
  platformFee: string | number | null;
  platformFeeRate: string | number | null;
  completedAt: Date | null;
  questTitle: string | null;
  questTrack: string | null;
  toUserName: string | null;
  toUserEmail: string | null;
  toUserRank: string | null;
}

interface CompletionRow {
  questId: string;
  completionDate: Date;
  questTrack: string | null;
}

interface CountRow {
  count: number;
}

type TrackBucket = {
  gmv: number;
  questIds: Set<string>;
};

type TimelineBucket = {
  date: string;
  gmv: number;
  questIds: Set<string>;
};

function roundCurrency(amount: number) {
  return Math.round(amount * 100) / 100;
}

function decimalToNumber(
  value: { toNumber(): number } | string | number | null | undefined
) {
  if (value == null) return 0;
  if (typeof value === 'string') return Number(value);
  return typeof value === 'number' ? value : value.toNumber();
}

function parseDateParam(raw: string | null, fallback: Date) {
  if (!raw) return fallback;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) return fallback;

  const parsed = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function endOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
}

function addUtcDays(date: Date, amount: number) {
  return new Date(date.getTime() + amount * DAY_IN_MS);
}

function formatDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

function normalizeTrack(track: string | null | undefined): TrackKey {
  return TRACKS.includes(track as TrackKey) ? (track as TrackKey) : 'OPEN';
}

function inferPlatformFee(amount: number, platformFee: number, platformFeeRate: number) {
  if (platformFee > 0) {
    return platformFee;
  }

  if (platformFeeRate > 0) {
    return amount * platformFeeRate;
  }

  return amount * DEFAULT_TAKE_RATE;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'admin');
    if (!user) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedTo = parseDateParam(searchParams.get('to'), new Date());
    const rangeEnd = endOfUtcDay(requestedTo);
    const defaultFrom = startOfUtcDay(addUtcDays(rangeEnd, -29));
    const rangeStart = startOfUtcDay(parseDateParam(searchParams.get('from'), defaultFrom));

    if (rangeStart.getTime() > rangeEnd.getTime()) {
      return Response.json(
        { error: '`from` must be on or before `to`', success: false },
        { status: 400 }
      );
    }

    const timelineStart = startOfUtcDay(addUtcDays(rangeEnd, -29));
    const [transactions, completions, questCountRows, activeAdventurerRows] = await withDbRetry(() =>
      Promise.all([
        prisma.$queryRaw<TransactionRow[]>`
          SELECT
            t.quest_id AS "questId",
            t.to_user_id AS "toUserId",
            t.amount::text AS amount,
            COALESCE(t.currency, 'INR') AS currency,
            t.platform_fee::text AS "platformFee",
            t.platform_fee_rate::text AS "platformFeeRate",
            t.completed_at AS "completedAt",
            q.title AS "questTitle",
            COALESCE(q.track::text, 'OPEN') AS "questTrack",
            u.name AS "toUserName",
            u.email AS "toUserEmail",
            u.rank::text AS "toUserRank"
          FROM transactions t
          LEFT JOIN quests q ON q.id = t.quest_id
          LEFT JOIN users u ON u.id = t.to_user_id
          WHERE t.status = 'completed'
            AND t.completed_at >= ${rangeStart}
            AND t.completed_at <= ${rangeEnd}
          ORDER BY t.completed_at DESC
        `,
        prisma.$queryRaw<CompletionRow[]>`
          SELECT
            qc.quest_id AS "questId",
            qc.completion_date AS "completionDate",
            COALESCE(q.track::text, 'OPEN') AS "questTrack"
          FROM quest_completions qc
          INNER JOIN quests q ON q.id = qc.quest_id
          WHERE qc.completion_date >= ${rangeStart}
            AND qc.completion_date <= ${rangeEnd}
        `,
        prisma.$queryRaw<CountRow[]>`
          SELECT COUNT(*)::int AS count
          FROM quests
          WHERE created_at >= ${rangeStart}
            AND created_at <= ${rangeEnd}
        `,
        prisma.$queryRaw<CountRow[]>`
          SELECT COUNT(DISTINCT qa.user_id)::int AS count
          FROM quest_assignments qa
          INNER JOIN users u ON u.id = qa.user_id
          WHERE u.role = 'adventurer'
            AND (
              (qa.assigned_at >= ${rangeStart} AND qa.assigned_at <= ${rangeEnd})
              OR
              (qa.completed_at >= ${rangeStart} AND qa.completed_at <= ${rangeEnd})
            )
        `,
      ])
    );
    const questsPosted = questCountRows[0]?.count ?? 0;
    const activeAdventurers = activeAdventurerRows[0]?.count ?? 0;

    const byTrackBuckets = TRACKS.reduce<Record<TrackKey, TrackBucket>>((acc, track) => {
      acc[track] = { gmv: 0, questIds: new Set<string>() };
      return acc;
    }, {} as Record<TrackKey, TrackBucket>);

    const timelineBuckets = new Map<string, TimelineBucket>();
    for (let offset = 0; offset < 30; offset += 1) {
      const day = addUtcDays(timelineStart, offset);
      const key = formatDay(day);
      timelineBuckets.set(key, {
        date: key,
        gmv: 0,
        questIds: new Set<string>(),
      });
    }

    const completedQuestIds = new Set<string>();
    for (const completion of completions) {
      completedQuestIds.add(completion.questId);

      const track = normalizeTrack(completion.questTrack);
      byTrackBuckets[track].questIds.add(completion.questId);

      const dayKey = formatDay(completion.completionDate);
      const bucket = timelineBuckets.get(dayKey);
      if (bucket) {
        bucket.questIds.add(completion.questId);
      }
    }

    let gmv = 0;
    let platformRevenue = 0;
    const currencyTotals = new Map<string, number>();
    const topQuestMap = new Map<
      string,
      { title: string; track: TrackKey; reward: number; completionDate: Date | null }
    >();
    const topAdventurerMap = new Map<
      string,
      { name: string; rank: string; totalEarned: number }
    >();

    for (const transaction of transactions) {
      const amount = decimalToNumber(transaction.amount);
      const platformFee = decimalToNumber(transaction.platformFee);
      const platformFeeRate = decimalToNumber(transaction.platformFeeRate);
      const normalizedTrack = normalizeTrack(transaction.questTrack);

      gmv += amount;
      platformRevenue += inferPlatformFee(amount, platformFee, platformFeeRate);
      byTrackBuckets[normalizedTrack].gmv += amount;

      const currency = transaction.currency || 'INR';
      currencyTotals.set(currency, (currencyTotals.get(currency) ?? 0) + amount);

      if (transaction.completedAt) {
        const dayKey = formatDay(transaction.completedAt);
        const bucket = timelineBuckets.get(dayKey);
        if (bucket) {
          bucket.gmv += amount;
        }
      }

      if (transaction.questId && transaction.questTitle) {
        const existingQuest = topQuestMap.get(transaction.questId);
        const completionDate =
          transaction.completedAt && (!existingQuest?.completionDate || transaction.completedAt > existingQuest.completionDate)
            ? transaction.completedAt
            : existingQuest?.completionDate ?? transaction.completedAt ?? null;

        topQuestMap.set(transaction.questId, {
          title: transaction.questTitle,
          track: normalizedTrack,
          reward: roundCurrency((existingQuest?.reward ?? 0) + amount),
          completionDate,
        });
      }

      if (transaction.toUserId && transaction.toUserRank) {
        const existingAdventurer = topAdventurerMap.get(transaction.toUserId);
        topAdventurerMap.set(transaction.toUserId, {
          name: transaction.toUserName || transaction.toUserEmail || 'Unknown adventurer',
          rank: transaction.toUserRank,
          totalEarned: roundCurrency((existingAdventurer?.totalEarned ?? 0) + amount),
        });
      }
    }

    const displayCurrency =
      [...currencyTotals.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'INR';
    const questsCompleted = completedQuestIds.size;
    const fillRate = questsPosted > 0 ? questsCompleted / questsPosted : 0;
    const takeRate = gmv > 0 ? platformRevenue / gmv : 0;

    const byTrack = TRACKS.reduce<Record<TrackKey, { gmv: number; count: number }>>((acc, track) => {
      acc[track] = {
        gmv: roundCurrency(byTrackBuckets[track].gmv),
        count: byTrackBuckets[track].questIds.size,
      };
      return acc;
    }, {} as Record<TrackKey, { gmv: number; count: number }>);

    const timeline = [...timelineBuckets.values()].map((bucket) => ({
      date: bucket.date,
      gmv: roundCurrency(bucket.gmv),
      questsCompleted: bucket.questIds.size,
    }));

    const topQuests = [...topQuestMap.entries()]
      .map(([questId, quest]) => ({
        questId,
        title: quest.title,
        track: quest.track,
        reward: quest.reward,
        completionDate: quest.completionDate ? formatDay(quest.completionDate) : null,
      }))
      .sort((left, right) => right.reward - left.reward)
      .slice(0, 5);

    const topAdventurers = [...topAdventurerMap.entries()]
      .map(([userId, adventurer]) => ({
        userId,
        name: adventurer.name,
        rank: adventurer.rank,
        totalEarned: adventurer.totalEarned,
      }))
      .sort((left, right) => right.totalEarned - left.totalEarned)
      .slice(0, 5);

    return Response.json({
      success: true,
      from: formatDay(rangeStart),
      to: formatDay(rangeEnd),
      generatedAt: new Date().toISOString(),
      displayCurrency,
      mrr: 0,
      gmv: roundCurrency(gmv),
      platformRevenue: roundCurrency(platformRevenue),
      takeRate,
      fillRate,
      questsPosted,
      questsCompleted,
      activeAdventurers,
      avgQuestValue: questsCompleted > 0 ? roundCurrency(gmv / questsCompleted) : 0,
      byTrack,
      timeline,
      topQuests,
      topAdventurers,
    });
  } catch (error) {
    console.error('Error fetching admin revenue:', error);
    return Response.json(
      { error: 'Failed to fetch revenue metrics', success: false },
      { status: 500 }
    );
  }
}
