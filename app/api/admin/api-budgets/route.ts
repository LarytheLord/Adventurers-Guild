import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

const BOOTCAMP_WEEKLY_CAP = 5;
const INTERN_WEEKLY_CAP = 10;
const DEFAULT_WEEKLY_CAP = BOOTCAMP_WEEKLY_CAP;

type UserTrack = 'BOOTCAMP' | 'INTERN';

function getCurrentWeekStart() {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - daysSinceMonday);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

function getDefaultCapForTrack(track: UserTrack) {
  return track === 'BOOTCAMP' ? BOOTCAMP_WEEKLY_CAP : INTERN_WEEKLY_CAP;
}

function inferTrackFromCap(cap: number): UserTrack {
  return cap <= BOOTCAMP_WEEKLY_CAP ? 'BOOTCAMP' : 'INTERN';
}

function decimalToNumber(value: Prisma.Decimal | number | string) {
  return value instanceof Prisma.Decimal ? value.toNumber() : Number(value);
}

async function hasBootcampLinksTable() {
  const [result] = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'bootcamp_links'
    ) AS "exists"
  `;

  return Boolean(result?.exists);
}

async function getTrackMapForUsers(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, UserTrack>();
  }

  if (!(await hasBootcampLinksTable())) {
    return new Map<string, UserTrack>();
  }

  const bootcampLinks = await prisma.$queryRaw<Array<{ user_id: string }>>`
    SELECT user_id FROM bootcamp_links
    WHERE user_id = ANY(${userIds}::uuid[])
  `;

  const bootcampUserIds = new Set(bootcampLinks.map((link) => link.user_id));

  return new Map<string, UserTrack>(
    userIds.map((userId) => [
      userId,
      bootcampUserIds.has(userId) ? 'BOOTCAMP' : 'INTERN',
    ]),
  );
}

/**
 * POST /api/admin/api-budgets
 * Log API spend for a user for the current week
 * Auth: Admin only
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const authUser = await requireAuth(request, 'admin');
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, amount } = body;

    if (!userId || typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'A positive numeric amount is required' },
        { status: 400 }
      );
    }

    const monday = getCurrentWeekStart();
    const trackMap = await getTrackMapForUsers([userId]);
    const track = trackMap.get(userId);
    const defaultCap = track ? getDefaultCapForTrack(track) : DEFAULT_WEEKLY_CAP;

    // Upsert budget record for this user/week
    const budget = await prisma.apiKeyBudget.upsert({
      where: {
        userId_weekStart: {
          userId,
          weekStart: monday,
        },
      },
      update: {
        spent: { increment: amount },
      },
      create: {
        userId,
        weekStart: monday,
        spent: amount,
        cap: defaultCap,
      },
    });

    return NextResponse.json({
      ...budget,
      spent: decimalToNumber(budget.spent),
      cap: decimalToNumber(budget.cap),
    });
  } catch (error) {
    console.error('Error logging API budget:', error);
    return NextResponse.json(
      { error: 'Failed to log API budget' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/api-budgets
 * Get current week's budget data for all users
 * Auth: Admin only
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authUser = await requireAuth(request, 'admin');
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const monday = getCurrentWeekStart();

    // Get all budget records for current week
    const budgets = await prisma.apiKeyBudget.findMany({
      where: {
        weekStart: monday,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            rank: true,
          },
        },
      },
    });

    if (budgets.length === 0) {
      return NextResponse.json([]);
    }

    const trackMap = await getTrackMapForUsers(
      budgets.map((budget) => budget.userId)
    );

    // Format response with cap determination
    const result = budgets.map((budget) => {
      const spent = decimalToNumber(budget.spent);
      const storedCap = decimalToNumber(budget.cap);
      const track = trackMap.get(budget.userId) ?? inferTrackFromCap(storedCap > 0 ? storedCap : DEFAULT_WEEKLY_CAP);
      const cap = storedCap > 0 ? storedCap : getDefaultCapForTrack(track);
      const percentUsed = Math.round((spent / cap) * 100);
      const overCap = spent > cap;
      const nearCap = !overCap && percentUsed >= 80;

      return {
        userId: budget.userId,
        name: budget.user.name || budget.user.email.split('@')[0],
        rank: budget.user.rank,
        track,
        spent,
        cap,
        percentUsed,
        overCap,
        nearCap,
      };
    });

    // Sort by percentUsed descending (highest usage first)
    result.sort((a, b) => b.percentUsed - a.percentUsed);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching API budgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API budgets' },
      { status: 500 }
    );
  }
}
