// app/api/rankings/route.ts
import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';
import { getRankForXp } from '@/lib/ranks';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sort') || 'xp'; // xp, level, skillPoints
    const order = searchParams.get('order') || 'desc'; // asc, desc
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';
    const rankFilter = searchParams.get('rank');

    // Build where clause
    const where: Record<string, unknown> = {
      role: 'adventurer', // Only get adventurers, not companies or admins
      isActive: true,
    };

    if (rankFilter) {
      where.rank = rankFilter;
    }

    // Build orderBy
    const ascending = order === 'asc';
    let orderBy: Record<string, string>;
    switch (sortBy) {
      case 'level':
        orderBy = { level: ascending ? 'asc' : 'desc' };
        break;
      case 'skillPoints':
        orderBy = { skillPoints: ascending ? 'asc' : 'desc' };
        break;
      case 'xp':
      default:
        orderBy = { xp: ascending ? 'asc' : 'desc' };
        break;
    }

    const data = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        rank: true,
        xp: true,
        skillPoints: true,
        level: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        lastLoginAt: true,
        bio: true,
        adventurerProfile: {
          select: {
            specialization: true,
            questCompletionRate: true,
            totalQuestsCompleted: true,
          },
        },
      },
      orderBy,
      skip: parseInt(offset),
      take: parseInt(limit),
    });

    // Add rank positions to the data
    const rankedData = data.map((user, index) => ({
      ...user,
      position: parseInt(offset) + index + 1,
    }));

    return Response.json({ rankings: rankedData, success: true });
  } catch (error) {
    console.error('Error fetching rankings:', error);
    return Response.json({ error: 'Failed to fetch rankings', success: false }, { status: 500 });
  }
}

// Calculate user rank based on XP
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return Response.json({ error: 'User ID is required', success: false }, { status: 400 });
    }

    // Get user's current XP
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, rank: true },
    });

    if (!user) {
      return Response.json({ error: 'User not found', success: false }, { status: 404 });
    }

    // Calculate rank using centralized thresholds
    const newRank = getRankForXp(user.xp);

    // If rank has changed, update it
    if (newRank !== user.rank) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { rank: newRank },
        });
      } catch (updateError) {
        console.error('Error updating user rank:', updateError);
        return Response.json({ error: 'Failed to update user rank', success: false }, { status: 500 });
      }

      // You could also trigger a notification here about rank up
      console.log(`User ${userId} has been ranked up to ${newRank}`);
    }

    return Response.json({
      rank: newRank,
      previousRank: user.rank,
      xp: user.xp,
      hasRankChanged: newRank !== user.rank,
      success: true
    });
  } catch (error) {
    console.error('Error calculating user rank:', error);
    return Response.json({ error: 'Failed to calculate user rank', success: false }, { status: 500 });
  }
}
