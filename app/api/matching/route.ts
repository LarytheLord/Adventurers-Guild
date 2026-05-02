// app/api/matching/route.ts
import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const parsedLimit = Number.parseInt(searchParams.get('limit') || '10', 10);
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 20) : 10;

    // Validate user ID is provided
    if (!userId) {
      return Response.json({ error: 'User ID is required', success: false }, { status: 400 });
    }
    if (authUser.role !== 'admin' && userId !== authUser.id) {
      return Response.json({ error: 'Forbidden', success: false }, { status: 403 });
    }

    // Get user's profile information including skills and rank
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        rank: true,
        xp: true,
        skillPoints: true,
        level: true,
        adventurerProfile: {
          select: {
            specialization: true,
            primarySkills: true,
            questCompletionRate: true,
          },
        },
        skillProgress: {
          select: {
            skillId: true,
            level: true,
            experiencePoints: true,
          },
        },
      },
    });

    if (!user) {
      return Response.json({ error: 'User not found', success: false }, { status: 404 });
    }

    // Get available quests
    const quests = await prisma.quest.findMany({
      where: { status: 'available' },
      select: {
        id: true,
        title: true,
        description: true,
        questType: true,
        status: true,
        difficulty: true,
        xpReward: true,
        skillPointsReward: true,
        monetaryReward: true,
        requiredSkills: true,
        requiredRank: true,
        maxParticipants: true,
        questCategory: true,
        companyId: true,
        createdAt: true,
        deadline: true,
        company: {
          select: {
            name: true,
            isVerified: true,
          },
        },
      },
      take: limit,
    });

    // If user is not an adventurer, return empty list
    if (user.role !== 'adventurer') {
      return Response.json({ matches: [], success: true });
    }

    // Perform matching algorithm
    const matchedQuests = quests.map(quest => {
      // Calculate match score based on multiple factors
      let matchScore = 0;

      // Extract profile data once for use throughout
      const profile = Array.isArray(user.adventurerProfile) ? user.adventurerProfile[0] : user.adventurerProfile;

      // 1. Rank compatibility (0-25 points)
      if (quest.difficulty === user.rank) {
        matchScore += 25;
      } else {
        // Higher rank than required gets partial points
        const rankValues: Record<string, number> = { 'F': 0, 'E': 1, 'D': 2, 'C': 3, 'B': 4, 'A': 5, 'S': 6 };
        const userRankValue = rankValues[user.rank] || 0;
        const questRankValue = rankValues[quest.difficulty] || 0;

        if (userRankValue >= questRankValue) {
          matchScore += Math.max(0, 25 - (userRankValue - questRankValue) * 5);
        }
      }

      // 2. Skill compatibility (0-35 points)
      if (quest.requiredSkills && Array.isArray(quest.requiredSkills) && quest.requiredSkills.length > 0) {
        // Count how many required skills the user has
        const userSkills = [
          ...(profile?.primarySkills || []),
          ...((user.skillProgress || []).map((sp: { skillId: string }) => sp.skillId))
        ];

        const matchingSkills = (quest.requiredSkills as string[]).filter((reqSkill: string) =>
          userSkills.some((userSkill: string) =>
            userSkill.toLowerCase().includes(reqSkill.toLowerCase()) ||
            reqSkill.toLowerCase().includes(userSkill.toLowerCase())
          )
        ).length;

        const skillMatchPercentage = matchingSkills / (quest.requiredSkills as string[]).length;
        matchScore += skillMatchPercentage * 35;
      } else {
        // If no specific skills required, award full points for this category
        matchScore += 35;
      }

      // 3. Category alignment (0-20 points)
      if (profile?.specialization &&
          profile.specialization.toLowerCase() === quest.questCategory.toLowerCase()) {
        matchScore += 20;
      } else {
        // Partial points if it's in a related category
        const relatedCategories: Record<string, string[]> = {
          'frontend': ['fullstack', 'design'],
          'backend': ['fullstack', 'devops'],
          'fullstack': ['frontend', 'backend'],
          'mobile': ['frontend'],
          'devops': ['backend'],
          'qa': ['backend', 'frontend']
        };

        const userSpec = profile?.specialization?.toLowerCase();
        if (userSpec && relatedCategories[userSpec]?.includes(quest.questCategory.toLowerCase())) {
          matchScore += 10;
        }
      }

      // 4. Quest completion rate bonus (0-20 points)
      if (profile?.questCompletionRate !== undefined) {
        const completionRate = profile.questCompletionRate;
        // Higher completion rate gets more points
        matchScore += (completionRate / 100) * 20;
      }

      // 5. Reward attractiveness (0-10 points)
      const avgReward = (quest.xpReward + Number(quest.monetaryReward || 0) * 100) / 2; // Convert monetary to XP equivalent
      // Higher rewards get more points, but capped
      matchScore += Math.min(10, avgReward / 250); // Scale appropriately

      return {
        ...quest,
        matchScore: Math.round(matchScore)
      };
    })
    // Sort by match score descending
    .sort((a, b) => b.matchScore - a.matchScore)
    // Take top matches
    .slice(0, limit);

    return Response.json({ matches: matchedQuests, success: true });
  } catch (error) {
    console.error('Error in quest matching:', error);
    return Response.json({ error: 'Failed to match quests', success: false }, { status: 500 });
  }
}

// Endpoint to get recommendations based on user activity
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;
    const requestedRecommendations = Number.parseInt(String(body.num_recommendations ?? '5'), 10);
    const numRecommendations =
      Number.isFinite(requestedRecommendations) && requestedRecommendations > 0
        ? Math.min(requestedRecommendations, 20)
        : 5;

    // Validate required fields
    if (!userId) {
      return Response.json({ error: 'User ID is required', success: false }, { status: 400 });
    }
    if (authUser.role !== 'admin' && userId !== authUser.id) {
      return Response.json({ error: 'Forbidden', success: false }, { status: 403 });
    }

    // Get user's profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        rank: true,
        adventurerProfile: {
          select: {
            primarySkills: true,
            specialization: true,
          },
        },
        skillProgress: {
          select: {
            skillId: true,
            level: true,
          },
        },
      },
    });

    if (!user) {
      return Response.json({ error: 'User not found', success: false }, { status: 404 });
    }

    // Get user's completed quests to understand their preferences
    let completedQuests: { questId: string; quest: { questCategory: string; requiredSkills: unknown } | null }[] | null = null;
    try {
      completedQuests = await prisma.questCompletion.findMany({
        where: { userId: userId },
        select: {
          questId: true,
          quest: {
            select: {
              questCategory: true,
              requiredSkills: true,
            },
          },
        },
        take: 10, // Get last 10 completed quests
      });
    } catch (completedError) {
      console.error('Error fetching completed quests:', completedError);
      // Continue without completed quests data
    }

    // Aggregate user's preferred categories and skills from completed quests
    const categoryCount: Record<string, number> = {};
    const skillCount: Record<string, number> = {};

    if (completedQuests) {
      completedQuests.forEach((completion) => {
        const questData = completion.quest;
        if (questData?.questCategory) {
          categoryCount[questData.questCategory] =
            (categoryCount[questData.questCategory] || 0) + 1;
        }

        if (questData?.requiredSkills && Array.isArray(questData.requiredSkills)) {
          questData.requiredSkills.forEach((skill: string) => {
            skillCount[skill] = (skillCount[skill] || 0) + 1;
          });
        }
      });
    }

    // Get available quests for recommendation
    const allQuests = await prisma.quest.findMany({
      where: { status: 'available' },
      select: {
        id: true,
        title: true,
        description: true,
        questType: true,
        status: true,
        difficulty: true,
        xpReward: true,
        skillPointsReward: true,
        monetaryReward: true,
        requiredSkills: true,
        requiredRank: true,
        questCategory: true,
        companyId: true,
        createdAt: true,
        deadline: true,
        company: {
          select: {
            name: true,
            isVerified: true,
          },
        },
      },
      take: 50, // Limit to prevent performance issues
    });

    // Calculate recommendation scores
    const recommendedQuests = allQuests.map(quest => {
      let score = 0;

      // Category preference (higher weight if user has completed similar quests)
      if (categoryCount[quest.questCategory]) {
        score += categoryCount[quest.questCategory] * 10;
      }

      // Skill match
      if (quest.requiredSkills && Array.isArray(quest.requiredSkills)) {
        const userProfile = Array.isArray(user.adventurerProfile) ? user.adventurerProfile[0] : user.adventurerProfile;
        const userSkills = [
          ...(userProfile?.primarySkills || []),
          ...((user.skillProgress || []).map((sp: { skillId: string }) => sp.skillId))
        ];

        const matchingSkills = (quest.requiredSkills as string[]).filter((reqSkill: string) =>
          userSkills.some((userSkill: string) =>
            userSkill.toLowerCase().includes(reqSkill.toLowerCase()) ||
            reqSkill.toLowerCase().includes(userSkill.toLowerCase())
          )
        ).length;

        score += matchingSkills * 5;
      }

      // Rank compatibility
      const rankValues: Record<string, number> = { 'F': 0, 'E': 1, 'D': 2, 'C': 3, 'B': 4, 'A': 5, 'S': 6 };
      const userRankValue = rankValues[user.rank] || 0;
      const questRankValue = rankValues[quest.difficulty] || 0;

      if (userRankValue >= questRankValue) {
        score += 20 - Math.abs(userRankValue - questRankValue) * 3;
      }

      // Reward factor
      score += quest.xpReward / 100; // Normalize XP to smaller factor
      if (quest.monetaryReward) {
        score += Number(quest.monetaryReward) / 10; // Monetary is more valuable
      }

      return {
        ...quest,
        recommendationScore: score
      };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, numRecommendations);

    return Response.json({ recommendations: recommendedQuests, success: true });
  } catch (error) {
    console.error('Error in quest recommendation:', error);
    return Response.json({ error: 'Failed to generate recommendations', success: false }, { status: 500 });
  }
}
