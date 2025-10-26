// app/api/mentorship/route.ts
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
    const role = searchParams.get('role'); // 'mentor' or 'mentee'
    const status = searchParams.get('status'); // 'active', 'pending', 'completed', 'cancelled'
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    // Validate user ID is provided
    if (!userId) {
      return Response.json({ error: 'User ID is required', success: false }, { status: 400 });
    }

    // Build query based on role
    let query = supabase
      .from('mentorships')
      .select(`
        id,
        mentor_id,
        mentee_id,
        status,
        start_date,
        end_date,
        goals,
        progress,
        created_at,
        updated_at,
        mentor:mentors!mentor_id (
          id,
          name,
          email,
          rank,
          xp,
          skill_points
        ),
        mentee:mentees!mentee_id (
          id,
          name,
          email,
          rank,
          xp,
          skill_points
        )
      `)
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    // Add filters
    if (role === 'mentor') {
      query = query.eq('mentor_id', userId);
    } else if (role === 'mentee') {
      query = query.eq('mentee_id', userId);
    } else {
      // If no role specified, show relationships where user is either mentor or mentee
      query = query.or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ mentorships: data, success: true });
  } catch (error) {
    console.error('Error fetching mentorships:', error);
    return Response.json({ error: 'Failed to fetch mentorships', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['mentor_id', 'mentee_id', 'goals'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return Response.json({ error: `${field} is required`, success: false }, { status: 400 });
      }
    }

    // Check if users exist and validate roles
    const { data: mentor, error: mentorError } = await supabase
      .from('users')
      .select('id, name, role, rank, xp')
      .eq('id', body.mentor_id)
      .single();

    if (mentorError || !mentor || mentor.role !== 'adventurer') {
      return Response.json({ error: 'Invalid mentor user', success: false }, { status: 400 });
    }

    const { data: mentee, error: menteeError } = await supabase
      .from('users')
      .select('id, name, role, rank, xp')
      .eq('id', body.mentee_id)
      .single();

    if (menteeError || !mentee || mentee.role !== 'adventurer') {
      return Response.json({ error: 'Invalid mentee user', success: false }, { status: 400 });
    }

    // Check if a mentorship already exists between these users
    const { data: existingMentorship, error: existingError } = await supabase
      .from('mentorships')
      .select('id')
      .or(`mentor_id.eq.${body.mentor_id},mentee_id.eq.${body.mentee_id}`)
      .or(`mentor_id.eq.${body.mentee_id},mentee_id.eq.${body.mentor_id}`)
      .in('status', ['active', 'pending']);

    if (existingMentorship && existingMentorship.length > 0) {
      return Response.json({ 
        error: 'A mentorship already exists between these users', 
        success: false 
      }, { status: 400 });
    }

    // Create the mentorship request
    const { data, error } = await supabase
      .from('mentorships')
      .insert([{
        mentor_id: body.mentor_id,
        mentee_id: body.mentee_id,
        goals: body.goals,
        status: 'pending', // Start as pending for mentee approval
        start_date: body.start_date || new Date().toISOString(),
        end_date: body.end_date || null,
        progress: 0
      }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Send notification to mentee about the mentorship request
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert([{
        user_id: body.mentee_id,
        title: 'Mentorship Request',
        message: `${mentor.name} has requested to be your mentor. Review the request in your mentorship dashboard.`,
        type: 'mentorship_request',
        data: {
          mentor_id: body.mentor_id,
          mentor_name: mentor.name,
          mentorship_id: data.id
        }
      }]);

    if (notificationError) {
      console.error('Error sending mentorship request notification:', notificationError);
    }

    return Response.json({ mentorship: data, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating mentorship:', error);
    return Response.json({ error: 'Failed to create mentorship', success: false }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { mentorship_id, current_user_id, action, ...updateFields } = body;

    // Validate required fields
    if (!mentorship_id || !current_user_id) {
      return Response.json({ error: 'Mentorship ID and User ID are required', success: false }, { status: 400 });
    }

    // Get current mentorship
    const { data: mentorship, error: mentorshipError } = await supabase
      .from('mentorships')
      .select('mentor_id, mentee_id, status')
      .eq('id', mentorship_id)
      .single();

    if (mentorshipError || !mentorship) {
      return Response.json({ error: 'Mentorship not found', success: false }, { status: 404 });
    }

    // Check permissions based on action
    let canUpdate = false;
    if (action === 'approve') {
      // Only mentee can approve a pending request
      canUpdate = current_user_id === mentorship.mentee_id && mentorship.status === 'pending';
    } else if (action === 'reject') {
      // Only mentee can reject a pending request
      canUpdate = current_user_id === mentorship.mentee_id && mentorship.status === 'pending';
    } else if (action === 'complete') {
      // Either mentor or mentee can complete an active mentorship
      canUpdate = (current_user_id === mentorship.mentor_id || current_user_id === mentorship.mentee_id) && 
                  mentorship.status === 'active';
    } else if (action === 'terminate') {
      // Either mentor or mentee can terminate an active mentorship
      canUpdate = (current_user_id === mentorship.mentor_id || current_user_id === mentorship.mentee_id) && 
                  mentorship.status === 'active';
    } else {
      // For general updates, only the mentor or mentee can update
      canUpdate = current_user_id === mentorship.mentor_id || current_user_id === mentorship.mentee_id;
    }

    if (!canUpdate) {
      return Response.json({ error: 'Unauthorized to perform this action', success: false }, { status: 403 });
    }

    // Prepare the update based on action
    let updateData: any = {};
    
    if (action === 'approve') {
      updateData = { status: 'active', start_date: new Date().toISOString() };
    } else if (action === 'reject') {
      updateData = { status: 'cancelled' };
    } else if (action === 'complete') {
      updateData = { status: 'completed', end_date: new Date().toISOString() };
    } else if (action === 'terminate') {
      updateData = { status: 'cancelled', end_date: new Date().toISOString() };
    } else {
      // General updates
      updateData = updateFields;
    }

    // Update the mentorship
    const { data, error } = await supabase
      .from('mentorships')
      .update(updateData)
      .eq('id', mentorship_id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // If approving, notify the mentor
    if (action === 'approve') {
      // Fetch mentee name for notification
      const { data: menteeData } = await supabase
        .from('users')
        .select('name')
        .eq('id', mentorship.mentee_id)
        .single();
      
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          user_id: mentorship.mentor_id,
          title: 'Mentorship Approved',
          message: `${menteeData?.name || 'A user'} has approved your mentorship request.`,
          type: 'mentorship_approved',
          data: {
            mentee_id: mentorship.mentee_id,
            mentee_name: menteeData?.name,
            mentorship_id: data.id
          }
        }]);

      if (notificationError) {
        console.error('Error sending mentorship approval notification:', notificationError);
      }
    }

    return Response.json({ mentorship: data, success: true });
  } catch (error) {
    console.error('Error updating mentorship:', error);
    return Response.json({ error: 'Failed to update mentorship', success: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { mentorship_id, current_user_id } = body;

    // Validate required fields
    if (!mentorship_id || !current_user_id) {
      return Response.json({ error: 'Mentorship ID and User ID are required', success: false }, { status: 400 });
    }

    // Get current mentorship
    const { data: mentorship, error: mentorshipError } = await supabase
      .from('mentorships')
      .select('mentor_id, mentee_id, status')
      .eq('id', mentorship_id)
      .single();

    if (mentorshipError || !mentorship) {
      return Response.json({ error: 'Mentorship not found', success: false }, { status: 404 });
    }

    // Only allow deletion for cancelled or completed mentorships
    if (mentorship.status !== 'cancelled' && mentorship.status !== 'completed') {
      return Response.json({ 
        error: 'Can only delete cancelled or completed mentorships', 
        success: false 
      }, { status: 400 });
    }

    // Check if current user is part of the mentorship
    if (current_user_id !== mentorship.mentor_id && current_user_id !== mentorship.mentee_id) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 403 });
    }

    // Delete the mentorship
    const { error } = await supabase
      .from('mentorships')
      .delete()
      .eq('id', mentorship_id);

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ message: 'Mentorship deleted successfully', success: true });
  } catch (error) {
    console.error('Error deleting mentorship:', error);
    return Response.json({ error: 'Failed to delete mentorship', success: false }, { status: 500 });
  }
}