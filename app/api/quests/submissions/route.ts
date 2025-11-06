// app/api/quests/submissions/route.ts
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
    const assignmentId = searchParams.get('assignment_id');
    const requestedUserId = searchParams.get('user_id');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    const currentUserId = session.user.id;
    const currentUserRole = session.user.role;

    // Build query
    let query = supabase
      .from('quest_submissions')
      .select(`
        id,
        assignment_id,
        user_id,
        submission_content,
        submission_notes,
        submitted_at,
        status,
        reviewer_id,
        reviewed_at,
        review_notes,
        quality_score,
        quest_assignments (
          quest_id,
          status
        ),
        users (
          name,
          email
        )
      `)
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    // Apply permissions based on user role
    if (currentUserRole === 'adventurer') {
      // Adventurers can only see their own submissions
      query = query.eq('user_id', currentUserId);
    } else if (currentUserRole === 'company') {
      // Companies can see submissions for their quests
      // First get the company's quests
      const { data: companyQuests, error: questsError } = await supabase
        .from('quests')
        .select('id')
        .eq('company_id', currentUserId);

      if (questsError) {
        throw new Error(questsError.message);
      }

      // Then get assignments for those quests
      if (companyQuests && companyQuests.length > 0) {
        const questIds = companyQuests.map(q => q.id);
        query = query.in('quest_assignments.quest_id', questIds);
      } else {
        // If company has no quests, return empty result
        return NextResponse.json({ submissions: [], success: true });
      }
    } else if (currentUserRole === 'admin') {
      // Admins can see all submissions
      // No additional filter needed
    } else {
      // Other roles are not allowed
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 403 });
    }

    // Add filters if provided (respecting permissions)
    if (assignmentId) {
      query = query.eq('assignment_id', assignmentId);
    }
    if (requestedUserId && currentUserRole === 'admin') {
      // Only admins can request submissions for a specific user
      query = query.eq('user_id', requestedUserId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ submissions: data, success: true });
  } catch (error) {
    console.error('Error fetching quest submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch quest submissions', success: false }, { status: 500 });
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
    const { assignment_id, submission_content, submission_notes } = body;
    const user_id = session.user.id; // Use authenticated user's ID

    // Validate required fields
    if (!assignment_id || !submission_content) {
      return NextResponse.json({ error: 'Missing required fields', success: false }, { status: 400 });
    }

    // Check if the assignment exists and belongs to the current user
    const { data: assignment, error: assignmentError } = await supabase
      .from('quest_assignments')
      .select('status, user_id')
      .eq('id', assignment_id)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json({ error: 'Assignment not found', success: false }, { status: 404 });
    }

    // Only the assigned user can submit
    if (assignment.user_id !== user_id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized to submit for this assignment', success: false }, { status: 403 });
    }

    if (!['assigned', 'started', 'in_progress'].includes(assignment.status)) {
      return NextResponse.json({ error: 'Invalid assignment state for submission', success: false }, { status: 400 });
    }

    // Create the submission
    const { data, error } = await supabase
      .from('quest_submissions')
      .insert([{
        assignment_id,
        user_id,
        submission_content,
        submission_notes: submission_notes || null
      }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Update assignment status to submitted
    await supabase
      .from('quest_assignments')
      .update({ status: 'submitted' })
      .eq('id', assignment_id);

    return NextResponse.json({ submission: data, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating quest submission:', error);
    return NextResponse.json({ error: 'Failed to create quest submission', success: false }, { status: 500 });
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
    const { submission_id, status, review_notes, quality_score } = body;
    const reviewer_id = session.user.id; // Use authenticated user's ID

    // Validate required fields
    if (!submission_id || !status) {
      return NextResponse.json({ error: 'Missing required fields', success: false }, { status: 400 });
    }

    // Check if the user has permission to update this submission
    // Only admins, or company users for their own quests can review submissions
    // First get the submission
    const { data: submission, error: submissionError } = await supabase
      .from('quest_submissions')
      .select('id, assignment_id')
      .eq('id', submission_id)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json({ error: 'Submission not found', success: false }, { status: 404 });
    }

    // Then get the assignment to check quest details
    const { data: assignment, error: assignmentError } = await supabase
      .from('quest_assignments')
      .select(`
        quest_id,
        quests (
          company_id
        )
      `)
      .eq('id', submission.assignment_id)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json({ error: 'Assignment not found', success: false }, { status: 404 });
    }

    // Check permissions
    if (session.user.role !== 'admin' &&
        (session.user.role !== 'company' || !assignment.quests || assignment.quests[0].company_id !== session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized to review this submission', success: false }, { status: 403 });
    }

    // Update the submission
    const { data, error } = await supabase
      .from('quest_submissions')
      .update({
        status,
        review_notes: review_notes || undefined,
        quality_score: quality_score || undefined,
        reviewer_id,
        reviewed_at: status !== 'pending' ? new Date().toISOString() : undefined
      })
      .eq('id', submission_id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Update assignment status based on submission status
    let newAssignmentStatus = '';
    if (status === 'approved') {
      newAssignmentStatus = 'completed';
    } else if (status === 'needs_rework' || status === 'rejected') {
      newAssignmentStatus = 'in_progress'; // Allow rework
    }

    if (newAssignmentStatus) {
      // Update the assignment status
      await supabase
        .from('quest_assignments')
        .update({ status: newAssignmentStatus })
        .eq('id', submission.assignment_id);
    }

    // If the submission was approved, record the quest completion
    if (status === 'approved' && data.assignment_id) {
      // Get assignment details to get the quest and user IDs
      const { data: assignment, error: assignmentError } = await supabase
        .from('quest_assignments')
        .select('quest_id, user_id')
        .eq('id', data.assignment_id)
        .single();

      if (assignmentError) {
        throw new Error(assignmentError.message);
      }

      // Get quest details to get the rewards
      const { data: quest, error: questError } = await supabase
        .from('quests')
        .select('xp_reward, skill_points_reward')
        .eq('id', assignment.quest_id)
        .single();

      if (questError) {
        throw new Error(questError.message);
      }

      // Record the quest completion
      const { error: completionError } = await supabase
        .from('quest_completions')
        .insert([{
          quest_id: assignment.quest_id,
          user_id: assignment.user_id,
          xp_earned: quest.xp_reward,
          skill_points_earned: quest.skill_points_reward,
          quality_score: quality_score || null
        }]);

      if (completionError) {
        console.error('Error recording quest completion:', completionError);
      }

      // Update user's XP and skill points
      const { error: userUpdateError } = await supabase.rpc('update_user_xp_and_skills', {
        user_id_input: assignment.user_id,
        xp_gained: quest.xp_reward,
        skill_points_gained: quest.skill_points_reward
      });

      if (userUpdateError) {
        console.error('Error updating user XP and skills:', userUpdateError);
      }
    }

    return NextResponse.json({ submission: data, success: true });
  } catch (error) {
    console.error('Error updating quest submission:', error);
    return NextResponse.json({ error: 'Failed to update quest submission', success: false }, { status: 500 });
  }
}