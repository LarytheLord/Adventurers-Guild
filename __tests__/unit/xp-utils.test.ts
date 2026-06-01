import { describe, it, expect } from '@jest/globals';
import { calculateLevelFromXP } from '@/lib/xp-utils';
import { getRankForXp, RANK_THRESHOLDS } from '@/lib/ranks';

describe('XP/Rank Utilities', () => {
  describe('getRankForXp', () => {
    it('should return F rank for 0 XP', () => {
      expect(getRankForXp(0)).toBe('F');
    });

    it('should return F rank for XP below E threshold', () => {
      expect(getRankForXp(RANK_THRESHOLDS[0].threshold)).toBe('F');
      expect(getRankForXp(RANK_THRESHOLDS[1].threshold - 1)).toBe('F');
    });

    it('should return E rank at E threshold', () => {
      expect(getRankForXp(RANK_THRESHOLDS[1].threshold)).toBe('E');
    });

    it('should return D rank at D threshold', () => {
      expect(getRankForXp(RANK_THRESHOLDS[2].threshold)).toBe('D');
    });

    it('should return C rank at C threshold', () => {
      expect(getRankForXp(RANK_THRESHOLDS[3].threshold)).toBe('C');
    });

    it('should return B rank at B threshold', () => {
      expect(getRankForXp(RANK_THRESHOLDS[4].threshold)).toBe('B');
    });

    it('should return A rank at A threshold', () => {
      expect(getRankForXp(RANK_THRESHOLDS[5].threshold)).toBe('A');
    });

    it('should return S rank at S threshold', () => {
      expect(getRankForXp(RANK_THRESHOLDS[6].threshold)).toBe('S');
    });

    it('should return S rank for XP above S threshold', () => {
      expect(getRankForXp(RANK_THRESHOLDS[6].threshold + 10000)).toBe('S');
    });
  });

  describe('calculateLevelFromXP', () => {
    it('should return level 1 for 0 XP', () => {
      expect(calculateLevelFromXP(0)).toBe(1);
    });

    it('should return level 2 for 100 XP', () => {
      expect(calculateLevelFromXP(100)).toBe(2);
    });

    it('should return level 5 for 400 XP', () => {
      expect(calculateLevelFromXP(400)).toBe(5);
    });

    it('should return level 10 for 900 XP', () => {
      expect(calculateLevelFromXP(900)).toBe(10);
    });

    it('should return level 17 for 1600 XP', () => {
      expect(calculateLevelFromXP(1600)).toBe(17);
    });
  });
});
