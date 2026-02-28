/**
 * Centralized rank thresholds — single source of truth.
 * XP required to reach each rank.
 */
export const RANK_THRESHOLDS = [
  { rank: 'F', threshold: 0 },
  { rank: 'E', threshold: 1000 },
  { rank: 'D', threshold: 3000 },
  { rank: 'C', threshold: 6000 },
  { rank: 'B', threshold: 10000 },
  { rank: 'A', threshold: 15000 },
  { rank: 'S', threshold: 25000 },
] as const;

export type Rank = (typeof RANK_THRESHOLDS)[number]['rank'];

/** XP per level */
export const XP_PER_LEVEL = 1000;

/** Get the rank for a given XP amount */
export function getRankForXp(xp: number): Rank {
  const entry = [...RANK_THRESHOLDS].reverse().find(r => xp >= r.threshold);
  return (entry?.rank ?? 'F') as Rank;
}

/** Get XP threshold for the next rank. Returns -1 if already at S. */
export function getNextRankThreshold(xp: number): { currentRank: Rank; nextRankXp: number } {
  const currentRank = getRankForXp(xp);
  const idx = RANK_THRESHOLDS.findIndex(r => r.rank === currentRank);
  const next = idx + 1 < RANK_THRESHOLDS.length ? RANK_THRESHOLDS[idx + 1] : null;
  return { currentRank, nextRankXp: next ? next.threshold : -1 };
}

/** Calculate percentage progress toward next rank (0–100) */
export function getRankProgressPercent(xp: number): number {
  const { currentRank, nextRankXp } = getNextRankThreshold(xp);
  if (currentRank === 'S') return 100;
  const currentThreshold = RANK_THRESHOLDS.find(r => r.rank === currentRank)!.threshold;
  return Math.min(100, Math.max(0, ((xp - currentThreshold) / (nextRankXp - currentThreshold)) * 100));
}
