import {
  getQuestAccessStatus,
  canUserAcceptQuest,
  getNextRank,
  compareRanks,
  getRecommendedDifficulties,
  RANK_ORDER,
} from '@/lib/quest-access';
import { UserRank } from '@prisma/client';

describe('Quest Access Control', () => {
  describe('getQuestAccessStatus', () => {
    it('should allow access to quests at user rank', () => {
      const status = getQuestAccessStatus('D', 'D');
      expect(status.canAccess).toBe(true);
      expect(status.isVisible).toBe(true);
      expect(status.lockedUntil).toBeUndefined();
    });

    it('should allow access to quests below user rank', () => {
      const status = getQuestAccessStatus('D', 'F');
      expect(status.canAccess).toBe(true);
      expect(status.isVisible).toBe(true);
    });

    // Rank gating is temporarily bypassed (all quests open during early platform growth).
    // These tests reflect current behavior; restore original expectations when gating is re-enabled.
    it('should allow access even to quests above user rank (gating bypassed)', () => {
      const status = getQuestAccessStatus('F', 'D');
      expect(status.canAccess).toBe(true);
      expect(status.isVisible).toBe(true);
      expect(status.lockedUntil).toBeUndefined();
    });

    it('should allow access 1 rank above (gating bypassed)', () => {
      const status = getQuestAccessStatus('F', 'E');
      expect(status.canAccess).toBe(true);
      expect(status.isVisible).toBe(true);
      expect(status.lockedUntil).toBeUndefined();
    });

    it('should allow access 2+ ranks above (gating bypassed)', () => {
      const status = getQuestAccessStatus('F', 'D');
      expect(status.canAccess).toBe(true);
      expect(status.isVisible).toBe(true);
      expect(status.lockedUntil).toBeUndefined();
    });

    it('should handle null requiredRank (backward compatible)', () => {
      const status = getQuestAccessStatus('F', null);
      expect(status.canAccess).toBe(true);
      expect(status.isVisible).toBe(true);
      expect(status.lockedUntil).toBeUndefined();
    });

    it('should handle undefined requiredRank (backward compatible)', () => {
      const status = getQuestAccessStatus('F', undefined);
      expect(status.canAccess).toBe(true);
      expect(status.isVisible).toBe(true);
    });

    it('should allow S-rank to accept any quest', () => {
      const status = getQuestAccessStatus('S', 'A');
      expect(status.canAccess).toBe(true);
      expect(status.isVisible).toBe(true);
    });
  });

  describe('canUserAcceptQuest', () => {
    it('should return true if user can accept', () => {
      expect(canUserAcceptQuest('D', 'F')).toBe(true);
      expect(canUserAcceptQuest('D', 'D')).toBe(true);
    });

    // Rank gating bypassed — all ranks can accept any quest during early growth.
    it('should return true regardless of rank mismatch (gating bypassed)', () => {
      expect(canUserAcceptQuest('F', 'D')).toBe(true);
      expect(canUserAcceptQuest('F', 'E')).toBe(true);
    });

    it('should return true for null requiredRank', () => {
      expect(canUserAcceptQuest('F', null)).toBe(true);
    });
  });

  describe('getNextRank', () => {
    it('should return next rank', () => {
      expect(getNextRank('F')).toBe('E');
      expect(getNextRank('E')).toBe('D');
      expect(getNextRank('D')).toBe('C');
      expect(getNextRank('C')).toBe('B');
      expect(getNextRank('B')).toBe('A');
      expect(getNextRank('A')).toBe('S');
    });

    it('should return null for S-rank', () => {
      expect(getNextRank('S')).toBeNull();
    });
  });

  describe('compareRanks', () => {
    it('should return negative if first rank is lower', () => {
      expect(compareRanks('F', 'D')).toBeLessThan(0);
      expect(compareRanks('E', 'A')).toBeLessThan(0);
    });

    it('should return zero if ranks are equal', () => {
      expect(compareRanks('D', 'D')).toBe(0);
      expect(compareRanks('F', 'F')).toBe(0);
    });

    it('should return positive if first rank is higher', () => {
      expect(compareRanks('D', 'F')).toBeGreaterThan(0);
      expect(compareRanks('A', 'E')).toBeGreaterThan(0);
    });
  });

  describe('getRecommendedDifficulties', () => {
    it('should return all ranks at or below user rank', () => {
      const recommended = getRecommendedDifficulties('D');
      expect(recommended).toEqual(['F', 'E', 'D']);
    });

    it('should return only F for F-rank user', () => {
      const recommended = getRecommendedDifficulties('F');
      expect(recommended).toEqual(['F']);
    });

    it('should return all ranks for S-rank user', () => {
      const recommended = getRecommendedDifficulties('S');
      expect(recommended).toEqual(['F', 'E', 'D', 'C', 'B', 'A', 'S']);
    });

    it('should be sorted in ascending order', () => {
      const recommended = getRecommendedDifficulties('B');
      for (let i = 0; i < recommended.length - 1; i++) {
        expect(RANK_ORDER[recommended[i]]).toBeLessThanOrEqual(
          RANK_ORDER[recommended[i + 1]]
        );
      }
    });
  });

  describe('RANK_ORDER constant', () => {
    it('should have all ranks with correct order', () => {
      expect(RANK_ORDER.F).toBe(0);
      expect(RANK_ORDER.E).toBe(1);
      expect(RANK_ORDER.D).toBe(2);
      expect(RANK_ORDER.C).toBe(3);
      expect(RANK_ORDER.B).toBe(4);
      expect(RANK_ORDER.A).toBe(5);
      expect(RANK_ORDER.S).toBe(6);
    });

    it('should have ascending values', () => {
      const ranks: UserRank[] = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];
      for (let i = 0; i < ranks.length - 1; i++) {
        expect(RANK_ORDER[ranks[i]]).toBeLessThan(RANK_ORDER[ranks[i + 1]]);
      }
    });
  });
});
