// app/api/rankings/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/lib/api-auth';
import { getRankForXp } from '@/lib/ranks';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sort') || 'xp'; // xp, level, skill_points
    const order = searchParams.get('order') || 'desc'; // asc, desc
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';
    const rankFilter = searchParams.get('rank');

    // Build query
    let query = supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        role,
        rank,
        xp,
        skill_points,
        level,
        is_active,
        is_verified,
        created_at,
        last_login_at,
        bio,
        adventurer_profiles (
          specialization,
          quest_completion_rate,
          total_quests_completed
        )
      `)
      .eq('role', 'adventurer') // Only get adventurers, not companies or admins
      .eq('is_active', true)
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    // Add rank filter if provided
    if (rankFilter) {
      query = query.eq('rank', rankFilter);
    }

    // Apply sorting
    const ascending = order === 'asc';
    switch (sortBy) {
      case 'level':
        query = query.order('level', { ascending });
        break;
      case 'skill_points':
        query = query.order('skill_points', { ascending });
        break;
      case 'xp':
      default:
        query = query.order('xp', { ascending });
        break;
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // Calculate rank positions
    const sortedData = [...data].sort((a, b) => {
      if (sortBy === 'level') {
        return ascending ? a.level - b.level : b.level - a.level;
      } else if (sortBy === 'skill_points') {
        return ascending ? a.skill_points - b.skill_points : b.skill_points - a.skill_points;
      } else { // xp (default)
        return ascending ? a.xp - b.xp : b.xp - a.xp;
      }
    });

    // Add rank positions to the data
    const rankedData = sortedData.map((user, index) => ({
      ...user,
      position: parseInt(offset) + index + 1
    }));

    return Response.json({ rankings: rankedData, success: true });
  } catch (error) {
    console.error('Error fetching rankings:', error);
    return Response.json({ error: 'Failed to fetch rankings', success: false }, { status: 500 });
  }
}

// Calculate user rank based on XP
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return Response.json({ error: 'User ID is required', success: false }, { status: 400 });
    }

    // Get user's current XP
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('xp, rank')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error(userError.message);
    }

    if (!user) {
      return Response.json({ error: 'User not found', success: false }, { status: 404 });
    }

    // Calculate rank using centralized thresholds
    const newRank = getRankForXp(user.xp);

    // If rank has changed, update it
    if (newRank !== user.rank) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ rank: newRank })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user rank:', updateError);
        return Response.json({ error: 'Failed to update user rank', success: false }, { status: 500 });
      }

      // You could also trigger a notification here about rank up
      console.log(`User ${userId} has been ranked up to ${newRank}`);
    }

    return Response.json({ 
      rank: newRank, 
      previousRank: user.rank,
      xp: user.xp,
      hasRankChanged: newRank !== user.rank,
      success: true 
    });
  } catch (error) {
    console.error('Error calculating user rank:', error);
    return Response.json({ error: 'Failed to calculate user rank', success: false }, { status: 500 });
  }
}