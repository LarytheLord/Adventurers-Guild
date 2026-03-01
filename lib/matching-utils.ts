// lib/matching-utils.ts
import { prisma } from './db';

// Types
export interface Quest {
  id: string;
  title: string;
  description: string;
  questType: string;
  status: string;
  difficulty: string;
  xpReward: number;
  skillPointsReward: number;
  monetaryReward?: number;
  requiredSkills: string[];
  requiredRank?: string;
  maxParticipants?: number;
  questCategory: string;
  companyId: string;
  createdAt: string;
  deadline?: string;
  company?: {
    name: string;
    isVerified: boolean;
  };
  matchScore?: number;
  recommendationScore?: number;
}

// Get matched quests for a user
export async function getMatchedQuests(userId: string, limit: number = 10): Promise<Quest[]> {
  try {
    const response = await fetch(`/api/matching?userId=${userId}&limit=${limit}`);
    const data = await response.json();
    if (data.success) return data.matches || [];
    throw new Error(data.error || 'Failed to fetch matched quests');
  } catch (error) {
    console.error('Error fetching matched quests:', error);
    throw new Error('Failed to fetch matched quests');
  }
}

// Get AI recommendations for a user
export async function getQuestRecommendations(userId: string, numRecommendations: number = 5): Promise<Quest[]> {
  try {
    const response = await fetch('/api/matching', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userId, num_recommendations: numRecommendations }),
    });
    const data = await response.json();
    if (data.success) return data.recommendations || [];
    throw new Error(data.error || 'Failed to fetch recommendations');
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw new Error('Failed to fetch recommendations');
  }
}

// Calculate match score between a user and a quest
export function calculateMatchScore(
  user: {
    rank: string;
    primarySkills?: string[];
    specialization?: string;
    questCompletionRate?: number;
    skillProgress?: Array<{ skillId: string; level: number }>;
  },
  quest: Quest
): number {
  let matchScore = 0;

  const rankValues: Record<string, number> = { F: 0, E: 1, D: 2, C: 3, B: 4, A: 5, S: 6 };
  const userRankValue = rankValues[user.rank] || 0;
  const questRankValue = rankValues[quest.difficulty] || 0;

  if (userRankValue === questRankValue) {
    matchScore += 25;
  } else if (userRankValue >= questRankValue) {
    matchScore += Math.max(0, 25 - (userRankValue - questRankValue) * 5);
  }

  if (quest.requiredSkills && quest.requiredSkills.length > 0) {
    const userSkills = [
      ...(user.primarySkills || []),
      ...((user.skillProgress || []).map((sp) => sp.skillId)),
    ];

    const matchingSkills = quest.requiredSkills.filter((reqSkill: string) =>
      userSkills.some(
        (userSkill) =>
          userSkill.toLowerCase().includes(reqSkill.toLowerCase()) ||
          reqSkill.toLowerCase().includes(userSkill.toLowerCase())
      )
    ).length;

    const skillMatchPercentage = matchingSkills / quest.requiredSkills.length;
    matchScore += skillMatchPercentage * 35;
  } else {
    matchScore += 35;
  }

  if (user.specialization && user.specialization.toLowerCase() === quest.questCategory.toLowerCase()) {
    matchScore += 20;
  } else {
    const relatedCategories: Record<string, string[]> = {
      frontend: ['fullstack', 'design'],
      backend: ['fullstack', 'devops'],
      fullstack: ['frontend', 'backend'],
      mobile: ['frontend'],
      devops: ['backend'],
      qa: ['backend', 'frontend'],
    };

    if (
      user.specialization &&
      relatedCategories[user.specialization.toLowerCase()]?.includes(quest.questCategory.toLowerCase())
    ) {
      matchScore += 10;
    }
  }

  if (user.questCompletionRate !== undefined) {
    matchScore += (user.questCompletionRate / 100) * 20;
  }

  const avgReward = (quest.xpReward + Number(quest.monetaryReward || 0) * 100) / 2;
  matchScore += Math.min(10, avgReward / 250);

  return Math.round(matchScore);
}

// Get user's profile for matching
export async function getUserProfileForMatching(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      adventurerProfile: {
        select: { specialization: true, primarySkills: true, questCompletionRate: true },
      },
      skillProgress: {
        select: { skillId: true, level: true, experiencePoints: true },
      },
    },
  });
}

// Get available quests for matching
export async function getAvailableQuests(limit: number = 20) {
  return prisma.quest.findMany({
    where: { status: 'available' },
    include: {
      company: { select: { name: true, isVerified: true } },
    },
    take: limit,
  });
}
