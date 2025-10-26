// components/TeamManagement.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Users, 
  UserPlus, 
  UserX, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface TeamMember {
  id: string;
  name: string;
  email: string;
  rank: string;
  avatar?: string;
  role: string;
  joined_at: string;
}

interface Team {
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

interface TeamManagementProps {
  userId: string;
}

export default function TeamManagement({ userId }: TeamManagementProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-teams');
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    max_members: 5
  });
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [invitingToTeam, setInvitingToTeam] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');

  // Fetch user's teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/teams?user_id=${userId}`);
        const data = await response.json();
        
        if (data.success) {
          setTeams(data.teams);
        } else {
          toast.error(data.error || 'Failed to fetch teams');
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
        toast.error('Error fetching teams');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchTeams();
    }
  }, [userId, activeTab]);

  const handleCreateTeam = async () => {
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTeam.name,
          description: newTeam.description,
          max_members: newTeam.max_members,
          owner_user_id: userId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Team created successfully');
        setShowCreateTeam(false);
        setNewTeam({ name: '', description: '', max_members: 5 });
        
        // Refresh the team list
        const updatedTeamsResponse = await fetch(`/api/teams?user_id=${userId}`);
        const updatedTeamsData = await updatedTeamsResponse.json();
        
        if (updatedTeamsData.success) {
          setTeams(updatedTeamsData.teams);
        }
      } else {
        toast.error(data.error || 'Failed to create team');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Error creating team');
    }
  };

  const handleInviteMember = async (teamId: string) => {
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      // In a real implementation, we would look up the user by email
      // For this example, we'll assume we have a way to get the user ID
      // Here we'll just mock the user ID based on the email
      const mockUserId = `mock-${inviteEmail}`; // This would be replaced with a real lookup

      const response = await fetch('/api/teams/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team_id: teamId,
          user_id: mockUserId, // In real app, this would be the actual user ID
          invited_by: userId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Member invited successfully');
        setInviteEmail('');
        setInvitingToTeam(null);
        
        // Refresh the team data to show the new member
        const updatedTeamsResponse = await fetch(`/api/teams?user_id=${userId}`);
        const updatedTeamsData = await updatedTeamsResponse.json();
        
        if (updatedTeamsData.success) {
          setTeams(updatedTeamsData.teams);
        }
      } else {
        toast.error(data.error || 'Failed to invite member');
      }
    } catch (error) {
      console.error('Error inviting member:', error);
      toast.error('Error inviting member');
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    if (!window.confirm('Are you sure you want to leave this team?')) {
      return;
    }

    try {
      // In a real app, we would call an API endpoint to remove the user
      // For now, we'll just update the UI and show a toast
      toast.success('Successfully left the team');
      
      // Refresh the team list
      const updatedTeamsResponse = await fetch(`/api/teams?user_id=${userId}`);
      const updatedTeamsData = await updatedTeamsResponse.json();
      
      if (updatedTeamsData.success) {
        setTeams(updatedTeamsData.teams);
      }
    } catch (error) {
      console.error('Error leaving team:', error);
      toast.error('Error leaving team');
    }
  };

  const handleRemoveMember = async (teamId: string, memberId: string) => {
    if (!window.confirm('Are you sure you want to remove this member from the team?')) {
      return;
    }

    try {
      // In a real app, we would call an API endpoint to remove the member
      // For now, we'll just update the UI and show a toast
      toast.success('Member removed from team');
      
      // Refresh the team data to show the updated member list
      const updatedTeamsResponse = await fetch(`/api/teams?user_id=${userId}`);
      const updatedTeamsData = await updatedTeamsResponse.json();
      
      if (updatedTeamsData.success) {
        setTeams(updatedTeamsData.teams);
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Error removing member');
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'S': return 'text-yellow-500';
      case 'A': return 'text-red-500';
      case 'B': return 'text-blue-500';
      case 'C': return 'text-green-500';
      case 'D': return 'text-gray-500';
      case 'E': return 'text-purple-500';
      case 'F': return 'text-gray-300';
      default: return 'text-gray-500';
    }
  };

  const getUserRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default';
      case 'admin': return 'secondary';
      case 'member': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-muted-foreground">Create teams and collaborate with other adventurers</p>
        </div>
        <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Form a team with other adventurers to tackle complex quests together
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Team Name</label>
                <Input
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                  placeholder="Enter team name..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
                  placeholder="Describe your team's focus..."
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Max Members</label>
                <Input
                  type="number"
                  value={newTeam.max_members}
                  onChange={(e) => setNewTeam({...newTeam, max_members: parseInt(e.target.value) || 5})}
                  min="2"
                  max="10"
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleCreateTeam}
                disabled={!newTeam.name}
              >
                Create Team
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Teams Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first team or join an existing one to start collaborating
            </p>
            <Button onClick={() => setShowCreateTeam(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      {team.members.length}/{team.max_members} members
                    </div>
                  </div>
                </div>
                <Badge variant={getUserRoleBadgeVariant(team.user_role)}>
                  {team.user_role.charAt(0).toUpperCase() + team.user_role.slice(1)}
                </Badge>
              </CardHeader>
              <CardContent>
                {team.description && (
                  <p className="text-sm text-muted-foreground mb-4">{team.description}</p>
                )}
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Members</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {team.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>
                              {member.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{member.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center">
                              <span className={getRankColor(member.rank)}>{member.rank}</span>
                              {member.role !== 'member' && (
                                <Badge variant="secondary" className="ml-2 h-4 text-xs">
                                  {member.role}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {team.user_role === 'owner' || team.user_role === 'admin' || member.id === userId ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (member.id === userId) {
                                handleLeaveTeam(team.id);
                              } else if (team.user_role === 'owner' || team.user_role === 'admin') {
                                handleRemoveMember(team.id, member.id);
                              }
                            }}
                            className="h-8 w-8 p-0"
                          >
                            {member.id === userId ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </Button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  {team.user_role === 'owner' && (
                    <Dialog 
                      open={invitingToTeam === team.id} 
                      onOpenChange={(open) => setInvitingToTeam(open ? team.id : null)}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Invite
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Invite Member to {team.name}</DialogTitle>
                          <DialogDescription>
                            Enter the email address of the adventurer you'd like to invite
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="adventurer@example.com"
                            type="email"
                          />
                          <div className="flex space-x-2">
                            <Button 
                              className="flex-1" 
                              onClick={() => handleInviteMember(team.id)}
                              disabled={!inviteEmail}
                            >
                              Send Invite
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => setInvitingToTeam(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}