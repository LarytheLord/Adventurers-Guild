// app/api/quests/submissions/route.ts
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
    const assignmentId = searchParams.get('assignment_id');
    const userId = searchParams.get('user_id');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

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

    // Add filters if provided
    if (assignmentId) {
      query = query.eq('assignment_id', assignmentId);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ submissions: data, success: true });
  } catch (error) {
    console.error('Error fetching quest submissions:', error);
    return Response.json({ error: 'Failed to fetch quest submissions', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assignment_id, submission_content, submission_notes } = body;

    // Validate required fields
    if (!assignment_id || !submission_content) {
      return Response.json({ error: 'Missing required fields', success: false }, { status: 400 });
    }

    // Check if the assignment exists and is in a valid state for submission
    const { data: assignment, error: assignmentError } = await supabase
      .from('quest_assignments')
      .select('status')
      .eq('id', assignment_id)
      .single();

    if (assignmentError || !assignment || !['assigned', 'started', 'in_progress'].includes(assignment.status)) {
      return Response.json({ error: 'Invalid assignment state for submission', success: false }, { status: 400 });
    }

    // Create the submission
    const { data, error } = await supabase
      .from('quest_submissions')
      .insert([{
        assignment_id,
        user_id: body.user_id, // This should be obtained from the authenticated user session
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

    return Response.json({ submission: data, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating quest submission:', error);
    return Response.json({ error: 'Failed to create quest submission', success: false }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { submission_id, status, review_notes, quality_score, reviewer_id } = body;

    // Validate required fields
    if (!submission_id || !status) {
      return Response.json({ error: 'Missing required fields', success: false }, { status: 400 });
    }

    // Update the submission
    const { data, error } = await supabase
      .from('quest_submissions')
      .update({
        status,
        review_notes: review_notes || undefined,
        quality_score: quality_score || undefined,
        reviewer_id: reviewer_id || undefined,
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
      // Get the assignment ID for this submission
      const { data: submission, error: fetchError } = await supabase
        .from('quest_submissions')
        .select('assignment_id')
        .eq('id', submission_id)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

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

    return Response.json({ submission: data, success: true });
  } catch (error) {
    console.error('Error updating quest submission:', error);
    return Response.json({ error: 'Failed to update quest submission', success: false }, { status: 500 });
  }
}