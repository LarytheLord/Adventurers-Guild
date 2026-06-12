import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { ensureReferralCode, REFERRAL_XP, REFEREE_SIGNUP_XP } from '@/lib/referral-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const code = await ensureReferralCode(user.id, user.name ?? 'USER');

    const [referrals, rewards] = await Promise.all([
      prisma.user.findMany({
        where: { referredById: user.id },
        select: {
          id: true,
          name: true,
          username: true,
          createdAt: true,
          questCompletions: { select: { id: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.referralReward.findMany({
        where: { giverId: user.id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalXpEarned = rewards.reduce((sum, r) => sum + r.xpAwarded, 0);

    return NextResponse.json({
      success: true,
      referralCode: code,
      referralLink: `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${code}`,
      stats: {
        totalReferrals: referrals.length,
        totalXpEarned,
        milestoneXp: REFERRAL_XP,
        refereeSignupBonus: REFEREE_SIGNUP_XP,
      },
      referrals: referrals.map((r) => ({
        id: r.id,
        name: r.name,
        username: r.username,
        joinedAt: r.createdAt,
        questsCompleted: r.questCompletions.length,
        reward: rewards.find((rw) => rw.earnerId === r.id),
      })),
    });
  } catch (error) {
    console.error('Referral GET error:', error);
    return NextResponse.json({ error: 'Failed to load referral data', success: false }, { status: 500 });
  }
}
