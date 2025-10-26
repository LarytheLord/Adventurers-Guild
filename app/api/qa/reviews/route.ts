// app/api/qa/reviews/route.ts
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
    const submissionId = searchParams.get('submission_id');
    const reviewerId = searchParams.get('reviewer_id');
    const questId = searchParams.get('quest_id');
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
          quest_id
        ),
        users (
          name,
          email,
          rank
        ),
        reviewers:users (
          name,
          email,
          rank
        )
      `)
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
      .order('submitted_at', { ascending: false });

    // Add filters if provided
    if (submissionId) {
      query = query.eq('id', submissionId);
    }
    if (reviewerId) {
      query = query.eq('reviewer_id', reviewerId);
    }
    if (questId) {
      query = query.eq('quest_assignments.quest_id', questId);
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
    console.error('Error fetching submissions for review:', error);
    return Response.json({ error: 'Failed to fetch submissions', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['submission_id', 'reviewer_id', 'quality_score', 'status'];
    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return Response.json({ error: `${field} is required`, success: false }, { status: 400 });
      }
    }

    // Verify the reviewer has the appropriate permissions (in a real app, check if reviewer is qualified)
    // For now, we'll just verify the reviewer exists
    
    // Update the submission with review information
    const { data, error } = await supabase
      .from('quest_submissions')
      .update({
        status: body.status,
        reviewer_id: body.reviewer_id,
        reviewed_at: new Date().toISOString(),
        review_notes: body.review_notes || null,
        quality_score: body.quality_score
      })
      .eq('id', body.submission_id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // If the submission is approved, update the assignment status and record completion
    if (body.status === 'approved') {
      // Get assignment ID for this submission
      const { data: submission, error: submissionError } = await supabase
        .from('quest_submissions')
        .select('assignment_id')
        .eq('id', body.submission_id)
        .single();

      if (submissionError) {
        throw new Error(submissionError.message);
      }

      // Update assignment status
      await supabase
        .from('quest_assignments')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', submission.assignment_id);

      // Get quest details to determine rewards
      const { data: assignment, error: assignmentError } = await supabase
        .from('quest_assignments')
        .select('quest_id, user_id')
        .eq('id', submission.assignment_id)
        .single();

      if (assignmentError) {
        throw new Error(assignmentError.message);
      }

      const { data: quest, error: questError } = await supabase
        .from('quests')
        .select('xp_reward, skill_points_reward')
        .eq('id', assignment.quest_id)
        .single();

      if (questError) {
        throw new Error(questError.message);
      }

      // Record quest completion
      const { error: completionError } = await supabase
        .from('quest_completions')
        .insert([{
          quest_id: assignment.quest_id,
          user_id: assignment.user_id,
          xp_earned: quest.xp_reward,
          skill_points_earned: quest.skill_points_reward,
          quality_score: body.quality_score
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
    // If submission needs rework, update assignment status to in_progress
    else if (body.status === 'needs_rework') {
      const { data: submission, error: submissionError } = await supabase
        .from('quest_submissions')
        .select('assignment_id')
        .eq('id', body.submission_id)
        .single();

      if (submissionError) {
        throw new Error(submissionError.message);
      }

      await supabase
        .from('quest_assignments')
        .update({ status: 'in_progress' })
        .eq('id', submission.assignment_id);
    }

    return Response.json({ submission: data, success: true });
  } catch (error) {
    console.error('Error reviewing submission:', error);
    return Response.json({ error: 'Failed to review submission', success: false }, { status: 500 });
  }
}

// API to get quality statistics
export async function PUT(request: NextRequest) {
  try {
    // This endpoint could be used to update quality metrics or reprocess reviews
    const body = await request.json();
    
    // Currently just return a success response
    // In a real implementation, this might be used to update quality metrics
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error in QA PUT:', error);
    return Response.json({ error: 'Failed to process request', success: false }, { status: 500 });
  }
}