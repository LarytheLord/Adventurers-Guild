import { prisma, withDbRetry } from '@/lib/db';

const MS_PER_DAY = 86_400_000;

const STREAK_MILESTONES = [
  { days: 3, multiplier: 1.1 },
  { days: 7, multiplier: 1.25 },
  { days: 14, multiplier: 1.5 },
  { days: 30, multiplier: 2.0 },
] as const;

type StreakDbClient = Pick<typeof prisma, 'questCompletion' | 'adventurerProfile'>;

export interface StreakMilestone {
  days: number;
  multiplier: number;
}

export interface AdventurerStreakSummary {
  currentStreak: number;
  longestStreak: number;
  multiplier: number;
  lastActiveDate: string | null;
  nextMilestone: StreakMilestone | null;
}

function toUtcDayNumber(date: Date): number {
  return Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / MS_PER_DAY
  );
}

function utcDayNumberToDateString(dayNumber: number): string {
  return new Date(dayNumber * MS_PER_DAY).toISOString().slice(0, 10);
}

function dateStringToUtcDate(dateString: string): Date {
  return new Date(`${dateString}T00:00:00.000Z`);
}

function uniqueSortedCompletionDays(completionDates: Date[]): number[] {
  return [...new Set(completionDates.map(toUtcDayNumber))].sort((left, right) => left - right);
}

export function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 2.0;
  if (streakDays >= 14) return 1.5;
  if (streakDays >= 7) return 1.25;
  if (streakDays >= 3) return 1.1;
  return 1.0;
}

export function getNextStreakMilestone(streakDays: number): StreakMilestone | null {
  return STREAK_MILESTONES.find((milestone) => streakDays < milestone.days) ?? null;
}

export function summarizeStreakFromCompletionDates(
  completionDates: Date[],
  referenceDate: Date = new Date()
): AdventurerStreakSummary {
  const uniqueDays = uniqueSortedCompletionDays(completionDates);

  if (uniqueDays.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      multiplier: 1.0,
      lastActiveDate: null,
      nextMilestone: getNextStreakMilestone(0),
    };
  }

  let longestStreak = 1;
  let runningStreak = 1;

  for (let index = 1; index < uniqueDays.length; index += 1) {
    const diff = uniqueDays[index] - uniqueDays[index - 1];
    runningStreak = diff === 1 ? runningStreak + 1 : 1;
    longestStreak = Math.max(longestStreak, runningStreak);
  }

  let trailingStreak = 1;
  for (let index = uniqueDays.length - 2; index >= 0; index -= 1) {
    const diff = uniqueDays[index + 1] - uniqueDays[index];
    if (diff !== 1) break;
    trailingStreak += 1;
  }

  const referenceDay = toUtcDayNumber(referenceDate);
  const lastActiveDay = uniqueDays[uniqueDays.length - 1];
  const daysSinceLastActive = referenceDay - lastActiveDay;
  const currentStreak = daysSinceLastActive <= 1 ? trailingStreak : 0;

  return {
    currentStreak,
    longestStreak,
    multiplier: getStreakMultiplier(currentStreak),
    lastActiveDate: utcDayNumberToDateString(lastActiveDay),
    nextMilestone: getNextStreakMilestone(currentStreak),
  };
}

export async function getAdventurerStreakSummary(
  userId: string,
  referenceDate: Date = new Date()
): Promise<AdventurerStreakSummary> {
  const completions = await withDbRetry(() =>
    prisma.questCompletion.findMany({
      where: { userId },
      select: { completionDate: true },
      orderBy: { completionDate: 'desc' },
    })
  );

  return summarizeStreakFromCompletionDates(
    completions.map((completion) => completion.completionDate),
    referenceDate
  );
}

export async function previewUserStreakAfterCompletion(
  db: StreakDbClient,
  userId: string,
  completionDate: Date = new Date()
): Promise<AdventurerStreakSummary> {
  const completions = await db.questCompletion.findMany({
    where: { userId },
    select: { completionDate: true },
    orderBy: { completionDate: 'desc' },
  });

  return summarizeStreakFromCompletionDates(
    [...completions.map((completion) => completion.completionDate), completionDate],
    completionDate
  );
}

export async function syncAdventurerStreak(
  db: StreakDbClient,
  userId: string,
  referenceDate: Date = new Date()
): Promise<AdventurerStreakSummary> {
  const completions = await db.questCompletion.findMany({
    where: { userId },
    select: { completionDate: true },
    orderBy: { completionDate: 'desc' },
  });

  const summary = summarizeStreakFromCompletionDates(
    completions.map((completion) => completion.completionDate),
    referenceDate
  );

  await db.adventurerProfile.updateMany({
    where: { userId },
    data: {
      currentStreak: summary.currentStreak,
      longestStreak: summary.longestStreak,
      lastActiveDate: summary.lastActiveDate ? dateStringToUtcDate(summary.lastActiveDate) : null,
      streakMultiplier: summary.multiplier,
    },
  });

  return summary;
}
