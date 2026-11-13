import { calculateMultiplier, updateStreak } from '@/lib/streak-utils';

describe('calculateMultiplier', () => {
  it.each([
    [0, 1.0],
    [1, 1.0],
    [2, 1.0],
    [3, 1.1],
    [6, 1.1],
    [7, 1.25],
    [13, 1.25],
    [14, 1.5],
    [29, 1.5],
    [30, 2.0],
    [365, 2.0],
  ])('streak %i gives multiplier %f', (streak, expected) => {
    expect(calculateMultiplier(streak)).toBe(expected);
  });
});

describe('updateStreak', () => {
  const NOW = new Date('2026-03-10T15:30:00.000Z');
  const TODAY = new Date('2026-03-10T00:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function makeTx(profile: unknown) {
    return {
      adventurerProfile: {
        findUnique: jest.fn().mockResolvedValue(profile),
        update: jest.fn().mockResolvedValue({}),
      },
    };
  }

  const run = (tx: ReturnType<typeof makeTx>) =>
    updateStreak('user-1', tx as unknown as Parameters<typeof updateStreak>[1]);

  it('does nothing when the user has no profile', async () => {
    const tx = makeTx(null);
    await run(tx);
    expect(tx.adventurerProfile.update).not.toHaveBeenCalled();
  });

  it('starts a streak at 1 when there is no previous streak date', async () => {
    const tx = makeTx({ currentStreak: 0, longestStreak: 0, maxStreak: 0, lastStreakDate: null });
    await run(tx);
    expect(tx.adventurerProfile.update).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      data: {
        currentStreak: 1,
        maxStreak: 1,
        longestStreak: 1,
        lastStreakDate: TODAY,
        lastActiveDate: TODAY,
        streakMultiplier: 1.0,
      },
    });
  });

  it('increments the streak when the last activity was yesterday', async () => {
    const tx = makeTx({
      currentStreak: 2,
      longestStreak: 2,
      maxStreak: 2,
      lastStreakDate: new Date('2026-03-09T23:59:00.000Z'),
    });
    await run(tx);
    const data = tx.adventurerProfile.update.mock.calls[0][0].data;
    expect(data.currentStreak).toBe(3);
    expect(data.maxStreak).toBe(3);
    expect(data.longestStreak).toBe(3);
    expect(data.streakMultiplier).toBe(1.1);
  });

  it('keeps the streak unchanged when already active today', async () => {
    const tx = makeTx({
      currentStreak: 6,
      longestStreak: 9,
      maxStreak: 9,
      lastStreakDate: new Date('2026-03-10T01:00:00.000Z'),
    });
    await run(tx);
    const data = tx.adventurerProfile.update.mock.calls[0][0].data;
    expect(data.currentStreak).toBe(6);
    expect(data.maxStreak).toBe(9);
    expect(data.longestStreak).toBe(9);
    expect(data.streakMultiplier).toBe(1.1);
  });

  it('resets to 1 after a gap of more than one day but keeps the records', async () => {
    const tx = makeTx({
      currentStreak: 20,
      longestStreak: 25,
      maxStreak: 25,
      lastStreakDate: new Date('2026-03-07T12:00:00.000Z'),
    });
    await run(tx);
    const data = tx.adventurerProfile.update.mock.calls[0][0].data;
    expect(data.currentStreak).toBe(1);
    expect(data.maxStreak).toBe(25);
    expect(data.longestStreak).toBe(25);
    expect(data.streakMultiplier).toBe(1.0);
  });

  it('raises the records when the streak passes them', async () => {
    const tx = makeTx({
      currentStreak: 6,
      longestStreak: 6,
      maxStreak: 6,
      lastStreakDate: new Date('2026-03-09T00:00:00.000Z'),
    });
    await run(tx);
    const data = tx.adventurerProfile.update.mock.calls[0][0].data;
    expect(data.currentStreak).toBe(7);
    expect(data.maxStreak).toBe(7);
    expect(data.longestStreak).toBe(7);
    expect(data.streakMultiplier).toBe(1.25);
  });
});
