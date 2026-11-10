import { getRankForXp, getNextRankThreshold, getRankProgressPercent } from '@/lib/ranks';

describe('rank progression', () => {
  it.each<[number, string, number]>([
    [0, 'F', 1000], [999, 'F', 1000], [1000, 'E', 3000], [2999, 'E', 3000],
    [3000, 'D', 6000], [5999, 'D', 6000], [6000, 'C', 10000], [9999, 'C', 10000],
    [10000, 'B', 15000], [14999, 'B', 15000], [15000, 'A', 25000],
    [24999, 'A', 25000], [25000, 'S', -1], [100000, 'S', -1], [-1, 'F', 1000],
  ])('finds the current and next rank for %s XP', (xp, currentRank, nextRankXp) => {
    expect(getRankForXp(xp)).toBe(currentRank);
    expect(getNextRankThreshold(xp)).toEqual({ currentRank, nextRankXp });
  });

  it.each([
    [-1, 0], [0, 0], [500, 50], [999, 99.9], [1000, 0], [2000, 50],
    [3000, 0], [4500, 50], [6000, 0], [8000, 50], [10000, 0], [12500, 50],
    [15000, 0], [20000, 50], [25000, 100], [100000, 100],
  ])('reports progress within the current rank at %s XP', (xp, percent) => {
    expect(getRankProgressPercent(xp)).toBeCloseTo(percent);
  });

  it('preserves the fallback for non-finite XP', () => {
    expect(getNextRankThreshold(NaN)).toEqual({ currentRank: 'F', nextRankXp: 1000 });
    expect(getRankProgressPercent(NaN)).toBeNaN();
    expect(getRankProgressPercent(Infinity)).toBe(100);
    expect(getRankProgressPercent(-Infinity)).toBe(0);
  });
});
