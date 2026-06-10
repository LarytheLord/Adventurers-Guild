import { prisma } from '@/lib/db';
import { updateUserXpAndSkills } from '@/lib/xp-utils';

// XP given to the referrer at each milestone
export const REFERRAL_XP: Record<string, number> = {
  first_quest_completed: 200,
  three_quests_completed: 500,
};

// XP bonus given to the referee on signup
export const REFEREE_SIGNUP_XP = 50;

/** Generate a short unique referral code like ABID4X2K */
export function generateReferralCode(name: string): string {
  const prefix = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 4)
    .padEnd(4, 'X');
  const suffix = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `${prefix}${suffix}`;
}

/** Ensure the user has a referral code; generate one if missing. */
export async function ensureReferralCode(userId: string, name: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });
  if (user?.referralCode) return user.referralCode;

  // Try up to 5 times for uniqueness
  for (let i = 0; i < 5; i++) {
    const code = generateReferralCode(name ?? 'USER');
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { referralCode: code },
        select: { referralCode: true },
      });
      return updated.referralCode!;
    } catch {
      // Unique constraint violation — retry
    }
  }
  throw new Error('Could not generate unique referral code');
}

/**
 * Called after a quest is approved (XP awarded). Checks if the completing user
 * was referred and whether the referrer should earn a milestone reward.
 */
export async function processReferralMilestone(refereeId: string, completionCount: number) {
  const referee = await prisma.user.findUnique({
    where: { id: refereeId },
    select: { referredById: true },
  });
  if (!referee?.referredById) return;

  const referrerId = referee.referredById;
  const events: string[] = [];

  if (completionCount === 1) events.push('first_quest_completed');
  if (completionCount === 3) events.push('three_quests_completed');

  for (const event of events) {
    const xp = REFERRAL_XP[event];
    try {
      // @@unique([giverId, earnerId, event]) prevents double-awarding
      await prisma.referralReward.create({
        data: { giverId: referrerId, earnerId: refereeId, event, xpAwarded: xp },
      });
      await updateUserXpAndSkills(referrerId, xp, 0, undefined);
    } catch {
      // Already awarded — skip
    }
  }
}
