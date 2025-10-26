// app/api/quests/assignments/route.ts
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
    const questId = searchParams.get('quest_id');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    // Build query
    let query = supabase
      .from('quest_assignments')
      .select(`
        id,
        quest_id,
        user_id,
        assigned_at,
        status,
        started_at,
        completed_at,
        progress,
        quests (
          title,
          description,
          quest_type,
          status,
          difficulty,
          xp_reward,
          skill_points_reward,
          required_skills,
          required_rank,
          quest_category,
          deadline
        )
      `)
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    // Add filters if provided
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (questId) {
      query = query.eq('quest_id', questId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ assignments: data, success: true });
  } catch (error) {
    console.error('Error fetching quest assignments:', error);
    return Response.json({ error: 'Failed to fetch quest assignments', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quest_id, user_id } = body;

    // Validate required fields
    if (!quest_id || !user_id) {
      return Response.json({ error: 'Missing required fields', success: false }, { status: 400 });
    }

    // Check if the quest exists and is available
    const { data: quest, error: questError } = await supabase
      .from('quests')
      .select('status, max_participants')
      .eq('id', quest_id)
      .single();

    if (questError || !quest || quest.status !== 'available') {
      return Response.json({ error: 'Quest not available', success: false }, { status: 400 });
    }

    // Check if the max number of participants has been reached
    if (quest.max_participants) {
      const { count, error: countError } = await supabase
        .from('quest_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('quest_id', quest_id)
        .neq('status', 'cancelled');

      if (countError) {
        throw new Error(countError.message);
      }

      if (count && count >= quest.max_participants) {
        return Response.json({ error: 'Maximum participants reached for this quest', success: false }, { status: 400 });
      }
    }

    // Create the assignment
    const { data, error } = await supabase
      .from('quest_assignments')
      .insert([{
        quest_id,
        user_id,
        status: 'assigned'
      }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Update the quest status to 'in_progress' if it's the first assignment
    if (quest.max_participants === 1 || !quest.max_participants) {
      await supabase
        .from('quests')
        .update({ status: 'in_progress' })
        .eq('id', quest_id);
    }

    return Response.json({ assignment: data, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating quest assignment:', error);
    return Response.json({ error: 'Failed to create quest assignment', success: false }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { assignment_id, status, progress } = body;

    // Validate required fields
    if (!assignment_id || !status) {
      return Response.json({ error: 'Missing required fields', success: false }, { status: 400 });
    }

    // Update the assignment
    const { data, error } = await supabase
      .from('quest_assignments')
      .update({
        status,
        progress: progress !== undefined ? progress : undefined,
        started_at: status === 'started' ? new Date().toISOString() : undefined,
        completed_at: status === 'completed' ? new Date().toISOString() : undefined
      })
      .eq('id', assignment_id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ assignment: data, success: true });
  } catch (error) {
    console.error('Error updating quest assignment:', error);
    return Response.json({ error: 'Failed to update quest assignment', success: false }, { status: 500 });
  }
}