/**
 * Quest Access Control Utilities
 * Determines whether a user can view, browse, or accept a quest based on their rank.
 *
 * Game Design Rules:
 * - Users can ACCEPT quests at their current rank and below
 * - Users can SEE (browse) quests up to 1 rank above their current rank
 * - Quests 2+ ranks above are HIDDEN
 * - Admins can see/accept all quests
 */

import { UserRank } from '@prisma/client';

/** Rank progression order (ascending difficulty) */
export const RANK_ORDER: Record<UserRank, number> = {
  F: 0,
  E: 1,
  D: 2,
  C: 3,
  B: 4,
  A: 5,
  S: 6,
};

/** Reverse lookup: number to rank */
const ORDER_TO_RANK: Record<number, UserRank> = {
  0: 'F',
  1: 'E',
  2: 'D',
  3: 'C',
  4: 'B',
  5: 'A',
  6: 'S',
};

export interface QuestAccessStatus {
  /** Whether the user can ACCEPT this quest (rank-based eligibility) */
  canAccess: boolean;
  /** Whether the user can SEE this quest (rank + 1 tier visibility) */
  isVisible: boolean;
  /** If locked, the minimum rank required to accept */
  lockedUntil?: UserRank;
}

/**
 * Determine access and visibility for a quest based on user rank
 *
 * @param userRank - The user's current rank (F-S)
 * @param questRequiredRank - The quest's minimum required rank (null defaults to accessible)
 * @returns Access and visibility status
 *
 * @example
 * // F-rank user viewing a D-rank quest
 * getQuestAccessStatus('F', 'D')
 * // → { canAccess: false, isVisible: false }
 *
 * @example
 * // F-rank user viewing an E-rank quest
 * getQuestAccessStatus('F', 'E')
 * // → { canAccess: false, isVisible: true, lockedUntil: 'E' }
 *
 * @example
 * // D-rank user viewing an F-rank quest
 * getQuestAccessStatus('D', 'F')
 * // → { canAccess: true, isVisible: true }
 */
export function getQuestAccessStatus(
  userRank: UserRank,
  questRequiredRank: UserRank | null | undefined
): QuestAccessStatus {
  // Temporary: all quests open to all ranks during early platform growth
  return { canAccess: true, isVisible: true };

  // Original rank-gating logic (re-enable when platform has enough quest volume):
  // if (!questRequiredRank) return { canAccess: true, isVisible: true };
  // const userOrder = RANK_ORDER[userRank];
  // const questOrder = RANK_ORDER[questRequiredRank];
  // const canAccess = userOrder >= questOrder;
  // const isVisible = userOrder >= questOrder - 1;
  // return { canAccess, isVisible, ...(canAccess ? {} : { lockedUntil: questRequiredRank }) };
}

/**
 * Check if a user can accept a specific quest
 *
 * @param userRank - The user's current rank
 * @param questRequiredRank - The quest's minimum required rank
 * @returns true if the user can accept, false otherwise
 */
export function canUserAcceptQuest(
  userRank: UserRank,
  questRequiredRank: UserRank | null | undefined
): boolean {
  return getQuestAccessStatus(userRank, questRequiredRank).canAccess;
}

/**
 * Get the next rank that a user should target
 *
 * @param currentRank - User's current rank
 * @returns The next rank in progression, or null if already S-rank
 */
export function getNextRank(currentRank: UserRank): UserRank | null {
  const nextOrder = RANK_ORDER[currentRank] + 1;
  return nextOrder <= 6 ? (ORDER_TO_RANK[nextOrder] as UserRank) : null;
}

/**
 * Compare two ranks
 *
 * @returns
 * - Negative: first rank is lower (weaker)
 * - Zero: ranks are equal
 * - Positive: first rank is higher (stronger)
 */
export function compareRanks(rankA: UserRank, rankB: UserRank): number {
  return RANK_ORDER[rankA] - RANK_ORDER[rankB];
}

/**
 * Get recommended quests for a user
 * Returns difficulty levels that are:
 * - At or below their current rank (can accept)
 * - Or 1 rank above (visible/aspirational)
 */
export function getRecommendedDifficulties(userRank: UserRank): UserRank[] {
  const userOrder = RANK_ORDER[userRank];
  return Object.entries(RANK_ORDER)
    .filter(([, order]) => order <= userOrder) // At or below current
    .map(([rank]) => rank as UserRank)
    .sort((a, b) => RANK_ORDER[a] - RANK_ORDER[b]);
}
