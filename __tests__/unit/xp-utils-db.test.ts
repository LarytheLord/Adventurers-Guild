import { updateUserXpAndSkills, updateCompanySpending } from '@/lib/xp-utils';

const tx = {
  user: { findUnique: jest.fn(), update: jest.fn() },
  adventurerProfile: { findUnique: jest.fn(), update: jest.fn() },
  questAssignment: { count: jest.fn() },
  notification: { create: jest.fn() },
};

jest.mock('@/lib/db', () => ({
  prisma: {
    $transaction: jest.fn((fn: (t: unknown) => unknown) => fn(tx)),
    companyProfile: { update: jest.fn() },
  },
}));
jest.mock('@/lib/activity-logger', () => ({ logActivity: jest.fn() }));
jest.mock('@/lib/streak-utils', () => ({ updateStreak: jest.fn() }));
jest.mock('@/lib/achievement-checker', () => ({ checkAchievements: jest.fn() }));
jest.mock('@/lib/guild-score', () => ({ recalculateGuildScore: jest.fn() }));

import { prisma } from '@/lib/db';
import { logActivity } from '@/lib/activity-logger';
import { updateStreak } from '@/lib/streak-utils';
import { checkAchievements } from '@/lib/achievement-checker';
import { recalculateGuildScore } from '@/lib/guild-score';

beforeEach(() => {
  jest.clearAllMocks();
  tx.questAssignment.count.mockResolvedValueOnce(4).mockResolvedValueOnce(3);
});

describe('updateUserXpAndSkills', () => {
  it('throws when the user does not exist', async () => {
    tx.user.findUnique.mockResolvedValue(null);
    await expect(updateUserXpAndSkills('u1', 100, 1)).rejects.toThrow('User not found');
    expect(tx.user.update).not.toHaveBeenCalled();
  });

  it('applies the streak multiplier, updates level and stats, no rank change', async () => {
    tx.user.findUnique.mockResolvedValue({ xp: 100, level: 1, rank: 'F' });
    tx.adventurerProfile.findUnique.mockResolvedValue({ streakMultiplier: 1.5 });

    const result = await updateUserXpAndSkills('u1', 200, 2, 'q1');

    // 100 + round(200 * 1.5) = 400
    expect(result).toEqual({ newXp: 400, newLevel: 5, newRank: 'F', rankChanged: false });
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { xp: 400, level: 5, rank: 'F', skillPoints: { increment: 2 } },
    });
    expect(tx.adventurerProfile.update).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      data: { totalQuestsCompleted: { increment: 1 }, questCompletionRate: 75 },
    });
    expect(recalculateGuildScore).toHaveBeenCalledWith('u1', tx);
    expect(updateStreak).toHaveBeenCalledWith('u1', tx);
    expect(logActivity).toHaveBeenCalledTimes(1);
    expect(logActivity).toHaveBeenCalledWith('u1', 'quest_complete', { questId: 'q1', xp: 200 }, tx);
    expect(checkAchievements).toHaveBeenCalledWith('u1', 'quest_complete');
    expect(tx.notification.create).not.toHaveBeenCalled();
  });

  it('defaults the multiplier to 1 when there is no profile and skips activity log without questId', async () => {
    tx.user.findUnique.mockResolvedValue({ xp: 0, level: 1, rank: 'F' });
    tx.adventurerProfile.findUnique.mockResolvedValue(null);

    const result = await updateUserXpAndSkills('u1', 50, 0);

    expect(result.newXp).toBe(50);
    expect(logActivity).not.toHaveBeenCalled();
  });

  it('records completion rate 0 when the user has no assignments', async () => {
    jest.clearAllMocks();
    tx.questAssignment.count.mockReset();
    tx.questAssignment.count.mockResolvedValue(0);
    tx.user.findUnique.mockResolvedValue({ xp: 0, level: 1, rank: 'F' });
    tx.adventurerProfile.findUnique.mockResolvedValue(null);

    await updateUserXpAndSkills('u1', 10, 0);

    expect(tx.adventurerProfile.update.mock.calls[0][0].data.questCompletionRate).toBe(0);
  });

  it('notifies, logs and checks achievements on rank up', async () => {
    tx.user.findUnique.mockResolvedValue({ xp: 900, level: 10, rank: 'F' });
    tx.adventurerProfile.findUnique.mockResolvedValue({ streakMultiplier: 1 });

    const result = await updateUserXpAndSkills('u1', 100, 0, 'q1');

    expect(result).toEqual({ newXp: 1000, newLevel: 11, newRank: 'E', rankChanged: true });
    expect(tx.notification.create).toHaveBeenCalledWith({
      data: {
        userId: 'u1',
        title: 'Rank Up!',
        message: "Congratulations! You've been promoted to E-Rank!",
        type: 'rank_up',
        data: { newRank: 'E', previousRank: 'F' },
      },
    });
    expect(logActivity).toHaveBeenCalledWith('u1', 'rank_up', { fromRank: 'F', toRank: 'E' }, tx);
    expect(checkAchievements).toHaveBeenCalledWith('u1', 'rank_up', { newRank: 'E' });
  });
});

describe('updateCompanySpending', () => {
  it('increments totalSpent for the company profile', async () => {
    await updateCompanySpending('c1', 2500);
    expect(prisma.companyProfile.update).toHaveBeenCalledWith({
      where: { userId: 'c1' },
      data: { totalSpent: { increment: 2500 } },
    });
  });
});
