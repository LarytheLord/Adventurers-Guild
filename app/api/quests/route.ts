// app/api/quests/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  // Check authentication but don't require it - allow public access to available quests
  const session = await getServerSession(authOptions);

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
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    // Apply permissions based on authentication
    if (session && session.user) {
      // Authenticated users can see their own quests and available quests
      if (session.user.role === 'company') {
        // Companies can see their own quests regardless of status
        query = query.or(`company_id.eq.${session.user.id},status.eq.available`);
      } else if (session.user.role === 'admin') {
        // Admins can see all quests
        // No additional filter needed
      } else {
        // Adventurers can see available quests and their assigned quests
        query = query.or(`status.eq.available,quest_assignments.user_id.eq.${session.user.id}`);
      }
    } else {
      // Unauthenticated users can only see available quests
      query = query.eq('status', 'available');
    }

    // Add filters if provided
    if (status && (!session || !session.user || session.user.role !== 'company')) {
      // Companies can see their own quests in any status, but others need to respect the status filter
      query = query.eq('status', status);
    }
    if (category) {
      query = query.eq('quest_category', category);
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    if (companyId && session && session.user && (session.user.role === 'admin' || session.user.id === companyId)) {
      // Only admins or the company itself can filter by company ID
      query = query.eq('company_id', companyId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ quests: data, success: true });
  } catch (error) {
    console.error('Error fetching quests:', error);
    return NextResponse.json({ error: 'Failed to fetch quests', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  // Only companies and admins can create quests
  if (session.user.role !== 'company' && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Only companies and admins can create quests', success: false }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, description, detailed_description, quest_type, difficulty, xp_reward, skill_points_reward, monetary_reward, required_skills, required_rank, max_participants, quest_category, deadline } = body;

    // Validate required fields
    if (!title || !description || !quest_type || !difficulty || !xp_reward) {
      return NextResponse.json({ error: 'Missing required fields', success: false }, { status: 400 });
    }

    // Create the quest with the authenticated user as the company
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
        company_id: session.user.id, // Use the authenticated user's ID
        deadline: deadline ? new Date(deadline).toISOString() : null
      }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ quest: data, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating quest:', error);
    return NextResponse.json({ error: 'Failed to create quest', success: false }, { status: 500 });
  }
}