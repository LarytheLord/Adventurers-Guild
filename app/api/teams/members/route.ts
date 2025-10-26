// app/api/teams/members/route.ts
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
    const teamId = searchParams.get('team_id');
    const userId = searchParams.get('user_id');
    const role = searchParams.get('role');
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    // Validate team ID or user ID is provided
    if (!teamId && !userId) {
      return Response.json({ error: 'Either Team ID or User ID is required', success: false }, { status: 400 });
    }

    // Build query
    let query = supabase
      .from('team_members')
      .select(`
        id,
        team_id,
        user_id,
        role,
        joined_at,
        is_active,
        teams (
          id,
          name,
          owner_user_id
        ),
        users (
          id,
          name,
          email,
          rank,
          avatar
        )
      `)
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    // Add filters
    if (teamId) {
      query = query.eq('team_id', teamId);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (role) {
      query = query.eq('role', role);
    }
    query = query.eq('is_active', true);

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ members: data, success: true });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return Response.json({ error: 'Failed to fetch team members', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['team_id', 'user_id', 'invited_by'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return Response.json({ error: `${field} is required`, success: false }, { status: 400 });
      }
    }

    // Check if team exists and if user is allowed to invite members
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('owner_user_id, max_members')
      .eq('id', body.team_id)
      .single();

    if (teamError || !team) {
      return Response.json({ error: 'Team not found', success: false }, { status: 404 });
    }

    // Verify that the inviting user is the team owner or admin
    if (team.owner_user_id !== body.invited_by) {
      const { data: existingMember, error: memberError } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', body.team_id)
        .eq('user_id', body.invited_by)
        .single();

      if (memberError || !existingMember || existingMember.role !== 'admin') {
        return Response.json({ error: 'Only team owners and admins can invite members', success: false }, { status: 403 });
      }
    }

    // Check if team has reached max members
    const { count, error: countError } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', body.team_id)
      .eq('is_active', true);

    if (countError) {
      throw new Error(countError.message);
    }

    if (team.max_members && count && count >= team.max_members) {
      return Response.json({ error: 'Team has reached maximum members', success: false }, { status: 400 });
    }

    // Check if user is already a member
    const { data: existingMember, error: existingMemberError } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', body.team_id)
      .eq('user_id', body.user_id)
      .single();

    if (existingMember) {
      return Response.json({ error: 'User is already a member of this team', success: false }, { status: 400 });
    }

    // Add the member to the team (default role is 'member')
    const { data, error } = await supabase
      .from('team_members')
      .insert([{
        team_id: body.team_id,
        user_id: body.user_id,
        role: body.role || 'member'
      }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ member: data, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error adding team member:', error);
    return Response.json({ error: 'Failed to add team member', success: false }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { member_id, current_user_id, role } = body;

    // Validate required fields
    if (!member_id || !current_user_id) {
      return Response.json({ error: 'Member ID and User ID are required', success: false }, { status: 400 });
    }

    // Get the current member record to access team_id
    const { data: currentMember, error: currentMemberError } = await supabase
      .from('team_members')
      .select('team_id, user_id, role')
      .eq('id', member_id)
      .single();

    if (currentMemberError || !currentMember) {
      return Response.json({ error: 'Team member not found', success: false }, { status: 404 });
    }

    const teamId = currentMember.team_id;

    // Check if the current user is the team owner or an admin
    const { data: requesterRole, error: requesterError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', current_user_id)
      .single();

    if (requesterError || !requesterRole || (requesterRole.role !== 'owner' && requesterRole.role !== 'admin')) {
      return Response.json({ error: 'Only team owners and admins can update member roles', success: false }, { status: 403 });
    }

    // Prevent demoting or promoting a team owner
    if (currentMember.role === 'owner') {
      return Response.json({ error: 'Cannot change role of team owner', success: false }, { status: 400 });
    }

    // Prevent a non-owner from changing roles
    if (requesterRole.role !== 'owner' && role === 'owner') {
      return Response.json({ error: 'Only team owners can assign owner role', success: false }, { status: 400 });
    }

    // Update the member role
    const { data, error } = await supabase
      .from('team_members')
      .update({ role })
      .eq('id', member_id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ member: data, success: true });
  } catch (error) {
    console.error('Error updating team member:', error);
    return Response.json({ error: 'Failed to update team member', success: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { member_id, current_user_id } = body;

    // Validate required fields
    if (!member_id || !current_user_id) {
      return Response.json({ error: 'Member ID and User ID are required', success: false }, { status: 400 });
    }

    // Get the current member record
    const { data: currentMember, error: currentMemberError } = await supabase
      .from('team_members')
      .select('team_id, user_id, role')
      .eq('id', member_id)
      .single();

    if (currentMemberError || !currentMember) {
      return Response.json({ error: 'Team member not found', success: false }, { status: 404 });
    }

    const teamId = currentMember.team_id;
    const userIdToRemove = currentMember.user_id;

    // Check if the current user is the team owner or an admin
    const { data: requesterRole, error: requesterError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', current_user_id)
      .single();

    if (requesterError || !requesterRole) {
      return Response.json({ error: 'Requester not found in team', success: false }, { status: 404 });
    }

    // Allow users to remove themselves from a team unless they are the owner
    if (current_user_id === userIdToRemove) {
      if (currentMember.role === 'owner') {
        return Response.json({ error: 'Team owner cannot leave the team. Transfer ownership or delete the team.', success: false }, { status: 400 });
      }
    } else if (requesterRole.role !== 'owner' && requesterRole.role !== 'admin') {
      return Response.json({ error: 'Only team owners and admins can remove other members', success: false }, { status: 403 });
    }

    // Remove the member from the team
    const { error } = await supabase
      .from('team_members')
      .update({ is_active: false })
      .eq('id', member_id);

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ message: 'Team member removed successfully', success: true });
  } catch (error) {
    console.error('Error removing team member:', error);
    return Response.json({ error: 'Failed to remove team member', success: false }, { status: 500 });
  }
}