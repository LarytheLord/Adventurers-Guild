import { ACHIEVEMENTS } from "./achievements";
import { prisma } from "./db";

export async function checkAchievements(
    userId: string,
    event: string, // 'quest_complete' | 'rank_up' | 'party_create' | 'streak_update'
    metadata?: Record<string, unknown>
    ) {
    // Query user stats, check against ACHIEVEMENTS, award if not already unlocked
    // Use upsert with @@unique([userId, type]) to be idempotent
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;
    const achievementsToAward: string[] = [];

    if (event === 'quest_complete') {
        const completedQuests = await prisma.quest.count({ where: { id: userId } });
        if (completedQuests >= 1) achievementsToAward.push(ACHIEVEMENTS.first_quest.name);
        if (completedQuests >= 5) achievementsToAward.push(ACHIEVEMENTS.quests_5.name);
        if (completedQuests >= 10) achievementsToAward.push(ACHIEVEMENTS.quests_10.name);
        if (completedQuests >= 25) achievementsToAward.push(ACHIEVEMENTS.quests_25.name);
    }
    if (event === 'rank_up' && metadata?.newRank) {
        const rank = metadata.newRank as string;
        if (rank === 'E') achievementsToAward.push(ACHIEVEMENTS.rank_up_e.name);
        if (rank === 'D') achievementsToAward.push(ACHIEVEMENTS.rank_up_d.name);
        if (rank === 'C') achievementsToAward.push(ACHIEVEMENTS.rank_up_c.name);
        if (rank === 'B') achievementsToAward.push(ACHIEVEMENTS.rank_up_b.name);
    }
    if (event === 'party_create') {
        const ledParties = await prisma.party.count({ where: { leaderId: userId } });
        if (ledParties >= 1) achievementsToAward.push(ACHIEVEMENTS.first_party.name);
    }
    if (event === 'streak_update' && metadata?.currentStreak) {
        const streak = metadata.currentStreak as number;
        if (streak >= 7) achievementsToAward.push(ACHIEVEMENTS.streak_7.name);
        if (streak >= 30) achievementsToAward.push(ACHIEVEMENTS.streak_30.name);
    }
}