import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
  }

  try {
    // Get total count of adventurers
    const totalUsers = await prisma.user.count({
      where: { role: 'adventurer' }
    });

    // Get user's XP
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Count users with more XP
    const betterUsersCount = await prisma.user.count({
      where: {
        role: 'adventurer',
        xp: { gt: user.xp }
      }
    });

    return NextResponse.json({
      success: true,
      rank: {
        position: betterUsersCount + 1,
        totalUsers
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch user rank' }, { status: 500 });
  }
}