// app/api/quests/assignments/route.ts
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
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('user_id');
    const questId = searchParams.get('quest_id');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    const currentUserId = session.user.id;
    const currentUserRole = session.user.role;

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

    // Apply permissions based on user role
    if (currentUserRole === 'adventurer') {
      // Adventurers can only see their own assignments
      query = query.eq('user_id', currentUserId);
    } else if (currentUserRole === 'company') {
      // Companies can see assignments for their quests
      // First get the company's quests
      const { data: companyQuests, error: questsError } = await supabase
        .from('quests')
        .select('id')
        .eq('company_id', currentUserId);

      if (questsError) {
        throw new Error(questsError.message);
      }

      const questIds = companyQuests?.map(q => q.id) || [];
      query = query.in('quest_id', questIds);
    } else if (currentUserRole === 'admin') {
      // Admins can see all assignments
      // No additional filter needed
    } else {
      // Other roles are not allowed
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 403 });
    }

    // Add filters if provided (respecting permissions)
    if (requestedUserId && currentUserRole === 'admin') {
      // Only admins can request assignments for a specific user
      query = query.eq('user_id', requestedUserId);
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

    return NextResponse.json({ assignments: data, success: true });
  } catch (error) {
    console.error('Error fetching quest assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch quest assignments', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { quest_id } = body;
    const user_id = session.user.id; // Use authenticated user's ID

    // Validate required fields
    if (!quest_id) {
      return NextResponse.json({ error: 'Missing required fields', success: false }, { status: 400 });
    }

    // Check if the quest exists and is available
    const { data: quest, error: questError } = await supabase
      .from('quests')
      .select('status, max_participants')
      .eq('id', quest_id)
      .single();

    if (questError || !quest || quest.status !== 'available') {
      return NextResponse.json({ error: 'Quest not available', success: false }, { status: 400 });
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
        return NextResponse.json({ error: 'Maximum participants reached for this quest', success: false }, { status: 400 });
      }
    }

    // Check if user is already assigned to this quest
    const { data: existingAssignment, error: existingError } = await supabase
      .from('quest_assignments')
      .select('id')
      .eq('quest_id', quest_id)
      .eq('user_id', user_id)
      .single();

    if (existingAssignment) {
      return NextResponse.json({ error: 'You are already assigned to this quest', success: false }, { status: 400 });
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

    return NextResponse.json({ assignment: data, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating quest assignment:', error);
    return NextResponse.json({ error: 'Failed to create quest assignment', success: false }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { assignment_id, status, progress } = body;
    const user_id = session.user.id; // Use authenticated user's ID

    // Validate required fields
    if (!assignment_id || !status) {
      return NextResponse.json({ error: 'Missing required fields', success: false }, { status: 400 });
    }

    // Check if the user has permission to update this assignment
    // Only the assigned user or an admin can update the assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('quest_assignments')
      .select('user_id')
      .eq('id', assignment_id)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json({ error: 'Assignment not found', success: false }, { status: 404 });
    }

    if (assignment.user_id !== user_id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized to update this assignment', success: false }, { status: 403 });
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

    return NextResponse.json({ assignment: data, success: true });
  } catch (error) {
    console.error('Error updating quest assignment:', error);
    return NextResponse.json({ error: 'Failed to update quest assignment', success: false }, { status: 500 });
  }
}