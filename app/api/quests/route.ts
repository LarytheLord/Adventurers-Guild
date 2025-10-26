// app/api/quests/route.ts
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
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const companyId = searchParams.get('company_id');
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
        deadline,
        users!quests_company_id_fkey (
          name,
          email
        )
      `)
      .eq('status', status || 'available')
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    // Add filters if provided
    if (category) {
      query = query.eq('quest_category', category);
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    if (companyId) {
      query = query.eq('company_id', companyId);
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

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user (you would verify the JWT token in a real implementation)
    // For now, we'll assume the user is authenticated and get the ID from the request body
    const body = await request.json();
    const { title, description, detailed_description, quest_type, difficulty, xp_reward, skill_points_reward, monetary_reward, required_skills, required_rank, max_participants, quest_category, deadline } = body;

    // Validate required fields
    if (!title || !description || !quest_type || !difficulty || !xp_reward) {
      return Response.json({ error: 'Missing required fields', success: false }, { status: 400 });
    }

    // Create the quest
    const { data, error } = await supabase
      .from('quests')
      .insert([{
        title,
        description,
        detailed_description,
        quest_type,
        difficulty,
        xp_reward,
        skill_points_reward,
        monetary_reward,
        required_skills: required_skills || [],
        required_rank,
        max_participants,
        quest_category,
        company_id: body.company_id, // This should be obtained from the authenticated user session
        deadline: deadline ? new Date(deadline).toISOString() : null
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