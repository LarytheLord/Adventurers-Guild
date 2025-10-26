// lib/team-utils.ts
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Types
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  rank: string;
  avatar?: string;
  role: string;
  joined_at: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  max_members: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  owner_user_id: string;
  user_role: string;
  joined_at: string;
  members: TeamMember[];
}

// Fetch teams for a user
export async function fetchUserTeams(userId: string): Promise<Team[]> {
  const { data, error } = await supabase
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
    .eq('team_members.is_active', true);

  if (error) {
    console.error('Error fetching teams:', error);
    throw new Error('Failed to fetch teams');
  }

  // Transform the data to group members per team
  const teamMap = new Map<string, Team>();
  
  for (const item of data) {
    const teamData: any = Array.isArray(item.teams) ? item.teams[0] : item.teams;
    if (!teamData) continue;
    
    const teamId = teamData.id;
    
    if (!teamMap.has(teamId)) {
      teamMap.set(teamId, {
        id: teamData.id,
        name: teamData.name,
        description: teamData.description,
        avatar_url: teamData.avatar_url,
        max_members: teamData.max_members,
        created_at: teamData.created_at,
        updated_at: teamData.updated_at,
        is_active: teamData.is_active,
        owner_user_id: teamData.owner_user_id,
        user_role: item.role,
        joined_at: item.joined_at,
        members: []
      });
    }
    
    // We'll fetch all members separately to get complete member data
  }
  
  // Convert map values to array
  const teams = Array.from(teamMap.values());
  
  // Fetch all members for each team
  for (const team of teams) {
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
      team.members = membersData.map((member: any) => {
        const user = Array.isArray(member.users) ? member.users[0] : member.users;
        return {
          id: user?.id || '',
          name: user?.name || '',
          email: user?.email || '',
          rank: user?.rank || 'F',
          avatar: user?.avatar || '',
          role: member.role,
          joined_at: member.joined_at
        };
      });
    }
  }

  return teams;
}

// Create a new team
export async function createTeam(
  name: string,
  description: string,
  max_members: number,
  owner_user_id: string
): Promise<Team | null> {
  const { data, error } = await supabase
    .from('teams')
    .insert([{
      name,
      description: description || null,
      max_members,
      owner_user_id
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating team:', error);
    throw new Error('Failed to create team');
  }

  // Add the owner as a member
  const { error: memberError } = await supabase
    .from('team_members')
    .insert([{
      team_id: data.id,
      user_id: owner_user_id,
      role: 'owner'
    }]);

  if (memberError) {
    console.error('Error adding owner to team:', memberError);
    // We could rollback the team creation here, but for simplicity we'll just log the error
  }

  // Return the created team
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    avatar_url: data.avatar_url,
    max_members: data.max_members,
    created_at: data.created_at,
    updated_at: data.updated_at,
    is_active: data.is_active,
    owner_user_id: data.owner_user_id,
    user_role: 'owner',
    joined_at: new Date().toISOString(),
    members: [] // We'll populate this separately if needed
  };
}

// Fetch team members
export async function fetchTeamMembers(teamId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase
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
    .eq('team_id', teamId)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching team members:', error);
    throw new Error('Failed to fetch team members');
  }

  return data.map((member: any) => {
    const user = Array.isArray(member.users) ? member.users[0] : member.users;
    return {
      id: user?.id || '',
      name: user?.name || '',
      email: user?.email || '',
      rank: user?.rank || 'F',
      avatar: user?.avatar || '',
      role: member.role,
      joined_at: member.joined_at
    };
  });
}

// Invite member to team
export async function inviteMemberToTeam(
  teamId: string,
  email: string,
  invitedBy: string
): Promise<boolean> {
  try {
    // First, look up the user by email to get their ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      throw new Error('User not found');
    }

    const { error } = await supabase
      .from('team_members')
      .insert([{
        team_id: teamId,
        user_id: user.id,
        role: 'member',
        invited_by: invitedBy
      }]);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error('Error inviting member to team:', error);
    throw new Error('Failed to invite member to team');
  }
}

// Remove member from team
export async function removeFromTeam(
  teamId: string,
  memberId: string,
  currentUserId: string
): Promise<boolean> {
  try {
    // First, verify the current user has permission to remove members
    const { data: requesterRole, error: requesterError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', currentUserId)
      .single();

    if (requesterError || !requesterRole) {
      throw new Error('Requester not found in team');
    }

    // Only owners and admins can remove other members
    if (requesterRole.role !== 'owner' && requesterRole.role !== 'admin') {
      throw new Error('Only team owners and admins can remove members');
    }

    const { error } = await supabase
      .from('team_members')
      .update({ is_active: false })
      .eq('team_id', teamId)
      .eq('user_id', memberId);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error('Error removing member from team:', error);
    throw new Error('Failed to remove member from team');
  }
}

// Leave team
export async function leaveTeam(
  teamId: string,
  userId: string
): Promise<boolean> {
  try {
    // Check if the user is the owner
    const { data: member, error: memberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single();

    if (memberError || !member) {
      throw new Error('User not found in team');
    }

    if (member.role === 'owner') {
      throw new Error('Team owner cannot leave the team. Transfer ownership or delete the team.');
    }

    const { error } = await supabase
      .from('team_members')
      .update({ is_active: false })
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error('Error leaving team:', error);
    throw new Error('Failed to leave team');
  }
}