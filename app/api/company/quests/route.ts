// app/api/company/quests/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/api-auth';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth('company', 'admin');
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    // Use authenticated user's ID as company_id (override any query param to prevent spoofing)
    const companyId = authUser.role === 'admin' ? (searchParams.get('company_id') || authUser.id) : authUser.id;
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
        detailed_description,
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
          email
        )
      `)
      .eq('company_id', companyId)
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
    console.error('Error fetching company quests:', error);
    return Response.json({ error: 'Failed to fetch company quests', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth('company', 'admin');
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    // Force company_id to authenticated user
    body.company_id = authUser.role === 'admin' ? (body.company_id || authUser.id) : authUser.id;

    // Validate required fields
    const requiredFields = ['title', 'description', 'quest_type', 'difficulty', 'xp_reward', 'company_id', 'quest_category'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return Response.json({ error: `${field} is required`, success: false }, { status: 400 });
      }
    }

    // Create the quest
    const { data, error } = await supabase
      .from('quests')
      .insert([{
        title: body.title,
        description: body.description,
        detailed_description: body.detailed_description || null,
        quest_type: body.quest_type,
        difficulty: body.difficulty,
        xp_reward: body.xp_reward,
        skill_points_reward: body.skill_points_reward || 0,
        monetary_reward: body.monetary_reward || null,
        required_skills: body.required_skills || [],
        required_rank: body.required_rank || null,
        max_participants: body.max_participants || null,
        quest_category: body.quest_category,
        company_id: body.company_id, // This should be validated to match the authenticated company
        deadline: body.deadline ? new Date(body.deadline).toISOString() : null
      }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ quest: data, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating quest:', error);
    return Response.json({ error: 'Failed to create quest', success: false }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await requireAuth('company', 'admin');
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const { quest_id, company_id: _ignored, ...updateFields } = body;
    const company_id = authUser.role === 'admin' ? (body.company_id || authUser.id) : authUser.id;

    // Validate required fields
    if (!quest_id || !company_id) {
      return Response.json({ error: 'Quest ID and Company ID are required', success: false }, { status: 400 });
    }

    // Verify the company owns this quest
    const { data: quest, error: questError } = await supabase
      .from('quests')
      .select('company_id')
      .eq('id', quest_id)
      .single();

    if (questError || !quest || quest.company_id !== company_id) {
      return Response.json({ error: 'Unauthorized: You do not own this quest', success: false }, { status: 403 });
    }

    // Update the quest
    const { data, error } = await supabase
      .from('quests')
      .update(updateFields)
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
    const authUser = await requireAuth('company', 'admin');
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const { quest_id } = body;
    const company_id = authUser.role === 'admin' ? (body.company_id || authUser.id) : authUser.id;

    // Validate required fields
    if (!quest_id || !company_id) {
      return Response.json({ error: 'Quest ID and Company ID are required', success: false }, { status: 400 });
    }

    // Verify the company owns this quest
    const { data: quest, error: questError } = await supabase
      .from('quests')
      .select('company_id')
      .eq('id', quest_id)
      .single();

    if (questError || !quest || quest.company_id !== company_id) {
      return Response.json({ error: 'Unauthorized: You do not own this quest', success: false }, { status: 403 });
    }

    // Update the quest status to cancelled instead of hard deleting
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