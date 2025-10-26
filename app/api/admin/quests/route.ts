// app/api/admin/quests/route.ts
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
    const status = searchParams.get('status');
    const questType = searchParams.get('quest_type');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    // Build query
    let query = supabase
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
        updated_at,
        deadline,
        users!quests_company_id_fkey (
          name,
          email,
          is_verified
        )
      `)
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    // Add filters if provided
    if (status) {
      query = query.eq('status', status);
    }
    if (questType) {
      query = query.eq('quest_type', questType);
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ quests: data, success: true });
  } catch (error) {
    console.error('Error fetching quests:', error);
    return Response.json({ error: 'Failed to fetch quests', success: false }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { quest_id, status, required_rank, max_participants } = body;

    // Validate required fields
    if (!quest_id) {
      return Response.json({ error: 'Quest ID is required', success: false }, { status: 400 });
    }

    // Update the quest
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (required_rank !== undefined) updateData.required_rank = required_rank;
    if (max_participants !== undefined) updateData.max_participants = max_participants;

    const { data, error } = await supabase
      .from('quests')
      .update(updateData)
      .eq('id', quest_id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ quest: data, success: true });
  } catch (error) {
    console.error('Error updating quest:', error);
    return Response.json({ error: 'Failed to update quest', success: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { quest_id } = body;

    // Validate required field
    if (!quest_id) {
      return Response.json({ error: 'Quest ID is required', success: false }, { status: 400 });
    }

    // Delete the quest (in reality, you'd want to archive rather than hard delete)
    const { error } = await supabase
      .from('quests')
      .update({ status: 'cancelled' })
      .eq('id', quest_id);

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ message: 'Quest cancelled successfully', success: true });
  } catch (error) {
    console.error('Error cancelling quest:', error);
    return Response.json({ error: 'Failed to cancel quest', success: false }, { status: 500 });
  }
}