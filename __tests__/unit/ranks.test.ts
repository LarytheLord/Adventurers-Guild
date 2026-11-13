import {
  RANK_THRESHOLDS,
  getNextRankThreshold,
  getRankProgressPercent,
  getRankForXp,
} from '@/lib/ranks';

describe('getNextRankThreshold', () => {
  it('returns the E threshold for a brand new F-rank user', () => {
    expect(getNextRankThreshold(0)).toEqual({ currentRank: 'F', nextRankXp: 1000 });
  });

  it('returns the next threshold exactly on a rank boundary', () => {
    expect(getNextRankThreshold(3000)).toEqual({ currentRank: 'D', nextRankXp: 6000 });
  });

  it('stays on the lower rank one XP below a boundary', () => {
    expect(getNextRankThreshold(2999)).toEqual({ currentRank: 'E', nextRankXp: 3000 });
  });

  it('returns -1 for S rank', () => {
    expect(getNextRankThreshold(25000)).toEqual({ currentRank: 'S', nextRankXp: -1 });
    expect(getNextRankThreshold(999999)).toEqual({ currentRank: 'S', nextRankXp: -1 });
  });

  it('is consistent with RANK_THRESHOLDS for every rank', () => {
    RANK_THRESHOLDS.forEach((entry, i) => {
      const next = RANK_THRESHOLDS[i + 1];
      expect(getNextRankThreshold(entry.threshold)).toEqual({
        currentRank: entry.rank,
        nextRankXp: next ? next.threshold : -1,
      });
    });
  });
});

describe('getRankProgressPercent', () => {
  it('is 0 at the start of a rank', () => {
    expect(getRankProgressPercent(0)).toBe(0);
    expect(getRankProgressPercent(1000)).toBe(0);
  });

  it('is 50 halfway through F rank', () => {
    expect(getRankProgressPercent(500)).toBe(50);
  });

  it('is proportional within a wider band (E rank is 2000 XP wide)', () => {
    expect(getRankProgressPercent(2000)).toBe(50);
  });

  it('is just under 100 one XP before the next rank', () => {
    const pct = getRankProgressPercent(999);
    expect(pct).toBeGreaterThan(99);
    expect(pct).toBeLessThan(100);
  });

  it('is 100 for S rank', () => {
    expect(getRankProgressPercent(25000)).toBe(100);
    expect(getRankProgressPercent(80000)).toBe(100);
  });

  it('clamps negative XP to 0', () => {
    expect(getRankForXp(-50)).toBe('F');
    expect(getRankProgressPercent(-50)).toBe(0);
  });
});
