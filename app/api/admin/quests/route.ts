// app/api/admin/quests/route.ts
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!userData || userData.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required', success: false }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const questType = searchParams.get('quest_type');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';

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
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!userData || userData.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required', success: false }, { status: 403 });
    }

    const body = await request.json();
    const { quest_id, status, required_rank, max_participants, title, description, xp_reward, skill_points_reward, monetary_reward } = body;

    if (!quest_id) {
      return Response.json({ error: 'Quest ID is required', success: false }, { status: 400 });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (required_rank !== undefined) updateData.required_rank = required_rank;
    if (max_participants !== undefined) updateData.max_participants = max_participants;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (xp_reward !== undefined) updateData.xp_reward = xp_reward;
    if (skill_points_reward !== undefined) updateData.skill_points_reward = skill_points_reward;
    if (monetary_reward !== undefined) updateData.monetary_reward = monetary_reward;

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
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!userData || userData.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required', success: false }, { status: 403 });
    }

    const body = await request.json();
    const { quest_id } = body;

    if (!quest_id) {
      return Response.json({ error: 'Quest ID is required', success: false }, { status: 400 });
    }

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