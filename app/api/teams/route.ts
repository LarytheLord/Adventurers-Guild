// app/api/teams/route.ts
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
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    // Validate user ID is provided
    if (!userId) {
      return Response.json({ error: 'User ID is required', success: false }, { status: 400 });
    }

    // Build query to get teams where user is a member
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
          description,
          avatar_url,
          max_members,
          created_at,
          updated_at,
          is_active,
          owner_user_id
        ),
        users!team_members_user_id_fkey (
          name,
          email,
          rank
        )
      `)
      .eq('user_id', userId)
      .eq('team_members.is_active', true)
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    // Add search filter if provided
    if (search) {
      query = query.ilike('teams.name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // Transform the data to group members per team
    const teamsWithMembers = data.map((item: any) => {
      const teamData = Array.isArray(item.teams) ? item.teams[0] : item.teams;
      return {
        id: teamData?.id,
        name: teamData?.name,
        description: teamData?.description,
        avatar_url: teamData?.avatar_url,
        max_members: teamData?.max_members,
        created_at: teamData?.created_at,
        updated_at: teamData?.updated_at,
        is_active: teamData?.is_active,
        owner_user_id: teamData?.owner_user_id,
        user_role: item.role,
        joined_at: item.joined_at,
        members: [] // We'll populate this in a separate query
      };
    });

    // Get members for each team
    for (const team of teamsWithMembers) {
      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select(`
          id,
          team_id,
          user_id,
          role,
          joined_at,
          is_active,
          users (
            id,
            name,
            email,
            rank,
            avatar
          )
        `)
        .eq('team_id', team.id)
        .eq('is_active', true);

      if (!membersError && membersData) {
        const mappedMembers = membersData.map((member: any) => {
          const userData = Array.isArray(member.users) ? member.users[0] : member.users;
          return {
            id: userData?.id || '',
            name: userData?.name || '',
            email: userData?.email || '',
            rank: userData?.rank || 'F',
            avatar: userData?.avatar || '',
            role: member.role,
            joined_at: member.joined_at
          };
        });
        (team as any).members = mappedMembers;
      }
    }

    return Response.json({ teams: teamsWithMembers, success: true });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return Response.json({ error: 'Failed to fetch teams', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'owner_user_id'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return Response.json({ error: `${field} is required`, success: false }, { status: 400 });
      }
    }

    // Create the team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert([{
        name: body.name,
        description: body.description || null,
        avatar_url: body.avatar_url || null,
        max_members: body.max_members || 5,
        owner_user_id: body.owner_user_id
      }])
      .select()
      .single();

    if (teamError) {
      throw new Error(teamError.message);
    }

    // Add the owner as the first member
    const { error: memberError } = await supabase
      .from('team_members')
      .insert([{
        team_id: team.id,
        user_id: body.owner_user_id,
        role: 'owner'
      }]);

    if (memberError) {
      throw new Error(memberError.message);
    }

    // Get the complete team data with members
    const { data: fullTeam, error: fullTeamError } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        description,
        avatar_url,
        max_members,
        created_at,
        updated_at,
        is_active,
        owner_user_id,
        team_members (
          id,
          user_id,
          role,
          joined_at,
          is_active,
          users (
            name,
            email,
            rank,
            avatar
          )
        )
      `)
      .eq('id', team.id)
      .single();

    if (fullTeamError) {
      console.error('Error fetching full team data:', fullTeamError);
      // Return the basic team data even if we couldn't get members
      return Response.json({ team, success: true }, { status: 201 });
    }

    return Response.json({ team: fullTeam, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return Response.json({ error: 'Failed to create team', success: false }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { team_id, current_user_id, ...updateFields } = body;

    // Validate required fields
    if (!team_id || !current_user_id) {
      return Response.json({ error: 'Team ID and User ID are required', success: false }, { status: 400 });
    }

    // Check if the user is the team owner
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('owner_user_id')
      .eq('id', team_id)
      .single();

    if (teamError || !team) {
      return Response.json({ error: 'Team not found', success: false }, { status: 404 });
    }

    if (team.owner_user_id !== current_user_id) {
      return Response.json({ error: 'Only team owners can update team details', success: false }, { status: 403 });
    }

    // Update the team
    const { data, error } = await supabase
      .from('teams')
      .update(updateFields)
      .eq('id', team_id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ team: data, success: true });
  } catch (error) {
    console.error('Error updating team:', error);
    return Response.json({ error: 'Failed to update team', success: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { team_id, current_user_id } = body;

    // Validate required fields
    if (!team_id || !current_user_id) {
      return Response.json({ error: 'Team ID and User ID are required', success: false }, { status: 400 });
    }

    // Check if the user is the team owner
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('owner_user_id')
      .eq('id', team_id)
      .single();

    if (teamError || !team) {
      return Response.json({ error: 'Team not found', success: false }, { status: 404 });
    }

    if (team.owner_user_id !== current_user_id) {
      return Response.json({ error: 'Only team owners can delete teams', success: false }, { status: 403 });
    }

    // Delete the team (soft delete by setting is_active to false)
    const { error } = await supabase
      .from('teams')
      .update({ is_active: false })
      .eq('id', team_id);

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ message: 'Team deleted successfully', success: true });
  } catch (error) {
    console.error('Error deleting team:', error);
    return Response.json({ error: 'Failed to delete team', success: false }, { status: 500 });
  }
}