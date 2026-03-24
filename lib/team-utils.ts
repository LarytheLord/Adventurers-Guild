// lib/team-utils.ts
import { prisma } from './db';

// Types
export interface TeamMemberInfo {
  id: string;
  name: string;
  email: string;
  rank: string;
  role: string;
  joinedAt: string;
}

export interface TeamInfo {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  maxMembers: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  ownerUserId: string;
  userRole: string;
  joinedAt: string;
  members: TeamMemberInfo[];
}

// Fetch teams for a user
export async function fetchUserTeams(userId: string): Promise<TeamInfo[]> {
  const memberships = await prisma.teamMember.findMany({
    where: { userId, isActive: true },
    include: {
      team: {
        include: {
          members: {
            where: { isActive: true },
            include: {
              user: { select: { id: true, name: true, email: true, rank: true } },
            },
          },
        },
      },
    },
  });

  return memberships.map((m) => ({
    id: m.team.id,
    name: m.team.name,
    description: m.team.description ?? undefined,
    avatarUrl: m.team.avatarUrl ?? undefined,
    maxMembers: m.team.maxMembers,
    createdAt: m.team.createdAt.toISOString(),
    updatedAt: m.team.updatedAt.toISOString(),
    isActive: m.team.isActive,
    ownerUserId: m.team.ownerUserId ?? '',
    userRole: m.role,
    joinedAt: m.joinedAt.toISOString(),
    members: m.team.members.map((member) => ({
      id: member.user.id,
      name: member.user.name ?? '',
      email: member.user.email,
      rank: member.user.rank,
      role: member.role,
      joinedAt: member.joinedAt.toISOString(),
    })),
  }));
}

// Create a new team
export async function createTeam(
  name: string,
  description: string,
  maxMembers: number,
  ownerUserId: string
): Promise<TeamInfo | null> {
  const team = await prisma.$transaction(async (tx) => {
    const newTeam = await tx.team.create({
      data: { name, description: description || null, maxMembers, ownerUserId },
    });

    await tx.teamMember.create({
      data: { teamId: newTeam.id, userId: ownerUserId, role: 'owner' },
    });

    return newTeam;
  });

  return {
    id: team.id,
    name: team.name,
    description: team.description ?? undefined,
    avatarUrl: team.avatarUrl ?? undefined,
    maxMembers: team.maxMembers,
    createdAt: team.createdAt.toISOString(),
    updatedAt: team.updatedAt.toISOString(),
    isActive: team.isActive,
    ownerUserId: team.ownerUserId ?? '',
    userRole: 'owner',
    joinedAt: new Date().toISOString(),
    members: [],
  };
}

// Fetch team members
export async function fetchTeamMembers(teamId: string): Promise<TeamMemberInfo[]> {
  const members = await prisma.teamMember.findMany({
    where: { teamId, isActive: true },
    include: {
      user: { select: { id: true, name: true, email: true, rank: true } },
    },
  });

  return members.map((m) => ({
    id: m.user.id,
    name: m.user.name ?? '',
    email: m.user.email,
    rank: m.user.rank,
    role: m.role,
    joinedAt: m.joinedAt.toISOString(),
  }));
}

// Invite member to team
export async function inviteMemberToTeam(
  teamId: string,
  email: string,
  invitedBy: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) throw new Error('User not found');

  await prisma.teamMember.create({
    data: { teamId, userId: user.id, role: 'member' },
  });

  return true;
}

// Remove member from team
export async function removeFromTeam(
  teamId: string,
  memberId: string,
  currentUserId: string
): Promise<boolean> {
  const requesterMembership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: currentUserId } },
  });

  if (!requesterMembership) throw new Error('Requester not found in team');
  if (requesterMembership.role !== 'owner' && requesterMembership.role !== 'admin') {
    throw new Error('Only team owners and admins can remove members');
  }

  await prisma.teamMember.update({
    where: { teamId_userId: { teamId, userId: memberId } },
    data: { isActive: false },
  });

  return true;
}

// Leave team
export async function leaveTeam(teamId: string, userId: string): Promise<boolean> {
  const member = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  });

  if (!member) throw new Error('User not found in team');
  if (member.role === 'owner') {
    throw new Error('Team owner cannot leave the team. Transfer ownership or delete the team.');
  }

  await prisma.teamMember.update({
    where: { teamId_userId: { teamId, userId } },
    data: { isActive: false },
  });

  return true;
}
