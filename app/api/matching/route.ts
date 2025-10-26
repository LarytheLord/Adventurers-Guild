// app/api/matching/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const limit = searchParams.get('limit') || '10';

    // Validate user ID is provided
    if (!userId) {
      return Response.json({ error: 'User ID is required', success: false }, { status: 400 });
    }

    // Get user's profile information including skills and rank
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        role,
        rank,
        xp,
        skill_points,
        level,
        adventurer_profiles (
          specialization,
          primary_skills,
          quest_completion_rate
        ),
        skill_progress (
          skill_id,
          level,
          experience_points
        )
      `)
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return Response.json({ error: 'User not found', success: false }, { status: 404 });
    }

    // Get available quests
    const { data: quests, error: questsError } = await supabase
      .from('quests')
      .select(`
        id,
        title,
        description,
        quest_type,
        status,
        difficulty,
        xp_reward,
        skill_points_reward,
        monetary_reward,
        required_skills,
        required_rank,
        max_participants,
        quest_category,
        company_id,
        created_at,
        deadline,
        users (
          name,
          is_verified
        )
      `)
      .eq('status', 'available')
      .limit(parseInt(limit));

    if (questsError) {
      throw new Error(questsError.message);
    }

    // If user is not an adventurer, return empty list
    if (user.role !== 'adventurer') {
      return Response.json({ matches: [], success: true });
    }

    // Perform matching algorithm
    const matchedQuests = quests.map(quest => {
      // Calculate match score based on multiple factors
      let matchScore = 0;
      
      // Extract profile data once for use throughout
      const profile: any = Array.isArray(user.adventurer_profiles) ? user.adventurer_profiles[0] : user.adventurer_profiles;

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
      if (quest.required_skills && Array.isArray(quest.required_skills) && quest.required_skills.length > 0) {
        // Count how many required skills the user has
        const userSkills = [
          ...(profile?.primary_skills || []),
          ...((user.skill_progress || []).map((sp: any) => sp.skill_id))
        ];
        
        const matchingSkills = quest.required_skills.filter((reqSkill: string) => 
          userSkills.some(userSkill => 
            userSkill.toLowerCase().includes(reqSkill.toLowerCase()) ||
            reqSkill.toLowerCase().includes(userSkill.toLowerCase())
          )
        ).length;
        
        const skillMatchPercentage = matchingSkills / quest.required_skills.length;
        matchScore += skillMatchPercentage * 35;
      } else {
        // If no specific skills required, award full points for this category
        matchScore += 35;
      }

      // 3. Category alignment (0-20 points)
      if (profile?.specialization && 
          profile.specialization.toLowerCase() === quest.quest_category.toLowerCase()) {
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
        if (userSpec && relatedCategories[userSpec]?.includes(quest.quest_category.toLowerCase())) {
          matchScore += 10;
        }
      }

      // 4. Quest completion rate bonus (0-20 points)
      if (profile?.quest_completion_rate !== undefined) {
        const completionRate = profile.quest_completion_rate;
        // Higher completion rate gets more points
        matchScore += (completionRate / 100) * 20;
      }

      // 5. Reward attractiveness (0-10 points)
      const avgReward = (quest.xp_reward + (quest.monetary_reward || 0) * 100) / 2; // Convert monetary to XP equivalent
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
    .slice(0, parseInt(limit));

    return Response.json({ matches: matchedQuests, success: true });
  } catch (error) {
    console.error('Error in quest matching:', error);
    return Response.json({ error: 'Failed to match quests', success: false }, { status: 500 });
  }
}

// Endpoint to get recommendations based on user activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, num_recommendations = 5 } = body;

    // Validate required fields
    if (!user_id) {
      return Response.json({ error: 'User ID is required', success: false }, { status: 400 });
    }

    // Get user's profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        rank,
        adventurer_profiles (
          primary_skills,
          specialization
        ),
        skill_progress (
          skill_id,
          level
        )
      `)
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return Response.json({ error: 'User not found', success: false }, { status: 404 });
    }

    // Get user's completed quests to understand their preferences
    const { data: completedQuests, error: completedError } = await supabase
      .from('quest_completions')
      .select(`
        quest_id,
        quests (
          quest_category,
          required_skills
        )
      `)
      .eq('user_id', user_id)
      .limit(10); // Get last 10 completed quests

    if (completedError) {
      console.error('Error fetching completed quests:', completedError);
      // Continue without completed quests data
    }

    // Aggregate user's preferred categories and skills from completed quests
    const categoryCount: Record<string, number> = {};
    const skillCount: Record<string, number> = {};

    if (completedQuests) {
      completedQuests.forEach((completion: any) => {
        const questData = Array.isArray(completion.quests) ? completion.quests[0] : completion.quests;
        if (questData?.quest_category) {
          categoryCount[questData.quest_category] = 
            (categoryCount[questData.quest_category] || 0) + 1;
        }
        
        if (questData?.required_skills && Array.isArray(questData.required_skills)) {
          questData.required_skills.forEach((skill: string) => {
            skillCount[skill] = (skillCount[skill] || 0) + 1;
          });
        }
      });
    }

    // Get available quests for recommendation
    const { data: allQuests, error: allQuestsError } = await supabase
      .from('quests')
      .select(`
        id,
        title,
        description,
        quest_type,
        status,
        difficulty,
        xp_reward,
        skill_points_reward,
        monetary_reward,
        required_skills,
        required_rank,
        quest_category,
        company_id,
        created_at,
        deadline
      `)
      .eq('status', 'available')
      .limit(50); // Limit to prevent performance issues

    if (allQuestsError) {
      throw new Error(allQuestsError.message);
    }

    // Calculate recommendation scores
    const recommendedQuests = allQuests.map(quest => {
      let score = 0;

      // Category preference (higher weight if user has completed similar quests)
      if (categoryCount[quest.quest_category]) {
        score += categoryCount[quest.quest_category] * 10;
      }

      // Skill match
      if (quest.required_skills && Array.isArray(quest.required_skills)) {
        const userProfile: any = Array.isArray(user.adventurer_profiles) ? user.adventurer_profiles[0] : user.adventurer_profiles;
        const userSkills = [
          ...(userProfile?.primary_skills || []),
          ...((user.skill_progress || []).map((sp: any) => sp.skill_id))
        ];
        
        const matchingSkills = quest.required_skills.filter((reqSkill: string) => 
          userSkills.some(userSkill => 
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
      score += quest.xp_reward / 100; // Normalize XP to smaller factor
      if (quest.monetary_reward) {
        score += quest.monetary_reward / 10; // Monetary is more valuable
      }

      return {
        ...quest,
        recommendationScore: score
      };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, num_recommendations);

    return Response.json({ recommendations: recommendedQuests, success: true });
  } catch (error) {
    console.error('Error in quest recommendation:', error);
    return Response.json({ error: 'Failed to generate recommendations', success: false }, { status: 500 });
  }
}