import { prisma, withDbRetry } from '@/lib/db';
import { RANK_THRESHOLDS, getRankProgressPercent, type Rank } from '@/lib/ranks';

const RANK_VALUES = RANK_THRESHOLDS.map((entry) => entry.rank);

export interface PublicQuestHistoryItem {
  id: string;
  title: string;
  difficulty: Rank;
  category: string;
  completedAt: string;
  qualityScore: number | null;
  xpEarned: number;
}

export interface PublicRankHistoryEntry {
  previousRank: Rank | null;
  rank: Rank;
  earnedAt: string;
  label: string;
}

export interface PublicAdventurerProfile {
  id: string;
  username: string;
  name: string;
  rank: Rank;
  xp: number;
  level: number;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  github: string | null;
  linkedin: string | null;
  joinedAt: string;
  specialization: string | null;
  skills: string[];
  stats: {
    totalQuestsCompleted: number;
    completionRate: number;
    currentStreak: number;
    longestStreak: number;
  };
  xpProgress: {
    currentRank: Rank;
    nextRank: Rank | null;
    progressPercent: number;
    xpToNext: number | null;
  };
  questHistory: PublicQuestHistoryItem[];
  rankHistory: PublicRankHistoryEntry[];
}

function isRank(value: unknown): value is Rank {
  return typeof value === 'string' && RANK_VALUES.includes(value as Rank);
}

export function slugifyAdventurerName(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getAdventurerInitials(name: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return initials || 'AG';
}

export function getPublicAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
}

function buildRankHistoryFromNotifications(
  notifications: Array<{ createdAt: Date; data: unknown }>
): PublicRankHistoryEntry[] {
  return notifications.flatMap((notification) => {
    if (!notification.data || typeof notification.data !== 'object' || Array.isArray(notification.data)) {
      return [];
    }

    const payload = notification.data as Record<string, unknown>;
    const rank = payload.newRank;
    const previousRank = payload.previousRank;

    if (!isRank(rank)) {
      return [];
    }

    return [
      {
        previousRank: isRank(previousRank) ? previousRank : null,
        rank,
        earnedAt: notification.createdAt.toISOString(),
        label: isRank(previousRank) ? `${previousRank} to ${rank}` : `${rank}-Rank unlocked`,
      },
    ];
  });
}

function buildRankHistoryFromCompletions(
  completions: Array<{ completionDate: Date; xpEarned: number }>
): PublicRankHistoryEntry[] {
  const ordered = [...completions].sort(
    (left, right) => left.completionDate.getTime() - right.completionDate.getTime()
  );

  let runningXp = 0;
  let currentRank: Rank = 'F';
  const history: PublicRankHistoryEntry[] = [];

  for (const completion of ordered) {
    runningXp += completion.xpEarned;

    const currentThreshold =
      RANK_THRESHOLDS.find((entry) => entry.rank === currentRank)?.threshold ?? 0;
    const unlockedRanks = RANK_THRESHOLDS.filter(
      (entry) => entry.threshold > currentThreshold && runningXp >= entry.threshold
    );

    for (const unlocked of unlockedRanks) {
      history.push({
        previousRank: currentRank,
        rank: unlocked.rank,
        earnedAt: completion.completionDate.toISOString(),
        label: `${currentRank} to ${unlocked.rank}`,
      });
      currentRank = unlocked.rank;
    }
  }

  return history;
}

function dedupeRankHistory(entries: PublicRankHistoryEntry[]): PublicRankHistoryEntry[] {
  const seen = new Set<string>();

  return entries.filter((entry) => {
    const key = `${entry.rank}:${entry.earnedAt}:${entry.previousRank ?? 'start'}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeUsernameMatch(input: string): string {
  return slugifyAdventurerName(decodeURIComponent(input));
}

export async function getPublicAdventurerProfile(
  username: string
): Promise<PublicAdventurerProfile | null> {
  const normalizedUsername = normalizeUsernameMatch(username);

  if (!normalizedUsername) {
    return null;
  }

  const candidates = await withDbRetry(() =>
    prisma.user.findMany({
      where: {
        role: 'adventurer',
        isActive: true,
        name: { not: null },
      },
      select: {
        id: true,
        name: true,
      },
    })
  );

  const matchedUser = candidates.find(
    (candidate) => candidate.name && slugifyAdventurerName(candidate.name) === normalizedUsername
  );

  if (!matchedUser) {
    return null;
  }

  const user = await withDbRetry(() =>
    prisma.user.findUnique({
      where: { id: matchedUser.id },
      select: {
        id: true,
        name: true,
        rank: true,
        xp: true,
        level: true,
        avatar: true,
        bio: true,
        location: true,
        website: true,
        github: true,
        linkedin: true,
        createdAt: true,
        adventurerProfile: {
          select: {
            specialization: true,
            primarySkills: true,
            totalQuestsCompleted: true,
            questCompletionRate: true,
            currentStreak: true,
            longestStreak: true,
          },
        },
        questCompletions: {
          orderBy: { completionDate: 'desc' },
          take: 50,
          select: {
            id: true,
            completionDate: true,
            xpEarned: true,
            qualityScore: true,
            quest: {
              select: {
                title: true,
                difficulty: true,
                questCategory: true,
              },
            },
          },
        },
        notifications: {
          where: { type: 'rank_up' },
          orderBy: { createdAt: 'asc' },
          select: {
            createdAt: true,
            data: true,
          },
        },
      },
    })
  );

  if (!user?.name) {
    return null;
  }

  const usernameSlug = slugifyAdventurerName(user.name) || `adventurer-${user.id.slice(0, 8)}`;
  const currentRank = (user.rank as Rank) || 'F';
  const currentRankIndex = RANK_VALUES.indexOf(currentRank);
  const nextRank =
    currentRankIndex >= 0 && currentRankIndex < RANK_VALUES.length - 1
      ? RANK_VALUES[currentRankIndex + 1]
      : null;
  const nextRankThreshold = nextRank
    ? RANK_THRESHOLDS.find((entry) => entry.rank === nextRank)?.threshold ?? null
    : null;

  const questHistory: PublicQuestHistoryItem[] = user.questCompletions.map((completion) => ({
    id: completion.id,
    title: completion.quest.title,
    difficulty: completion.quest.difficulty as Rank,
    category: completion.quest.questCategory,
    completedAt: completion.completionDate.toISOString(),
    qualityScore: completion.qualityScore,
    xpEarned: completion.xpEarned,
  }));

  const notificationHistory = buildRankHistoryFromNotifications(user.notifications);
  const inferredHistory = buildRankHistoryFromCompletions(user.questCompletions);
  const rankHistory = dedupeRankHistory([
    {
      previousRank: null,
      rank: 'F',
      earnedAt: user.createdAt.toISOString(),
      label: 'Joined the guild',
    },
    ...(notificationHistory.length > 0 ? notificationHistory : inferredHistory),
  ]);

  return {
    id: user.id,
    username: usernameSlug,
    name: user.name,
    rank: currentRank,
    xp: user.xp,
    level: user.level,
    avatar: user.avatar,
    bio: user.bio,
    location: user.location,
    website: user.website,
    github: user.github,
    linkedin: user.linkedin,
    joinedAt: user.createdAt.toISOString(),
    specialization: user.adventurerProfile?.specialization ?? null,
    skills: user.adventurerProfile?.primarySkills.filter(Boolean) ?? [],
    stats: {
      totalQuestsCompleted:
        user.adventurerProfile?.totalQuestsCompleted ?? user.questCompletions.length,
      completionRate: Number(user.adventurerProfile?.questCompletionRate ?? 0),
      currentStreak: user.adventurerProfile?.currentStreak ?? 0,
      longestStreak: user.adventurerProfile?.longestStreak ?? 0,
    },
    xpProgress: {
      currentRank,
      nextRank,
      progressPercent: getRankProgressPercent(user.xp),
      xpToNext: nextRankThreshold ? Math.max(0, nextRankThreshold - user.xp) : null,
    },
    questHistory,
    rankHistory,
  };
}
