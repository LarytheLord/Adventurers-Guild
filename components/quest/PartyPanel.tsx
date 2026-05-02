'use client';

import { useMemo, useState } from 'react';
import { Crown, Trash2, UserPlus, Users, Search as SearchIcon } from 'lucide-react';
import { toast } from 'sonner';
import { GuildCard, GuildPanel } from '@/components/guild/primitives';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { RankBadge, type Rank } from '@/components/ui/rank-badge';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

interface PartyMemberUser {
  id: string;
  name: string | null;
  rank: string | null;
}

interface PartyMember {
  user: PartyMemberUser;
  isLeader: boolean;
  joinedAt?: string;
}

interface SearchResult {
  id: string;
  name: string | null;
  email: string;
  rank: string;
  avatar: string | null;
}

export interface Party {
  id: string;
  track: 'INTERN' | 'BOOTCAMP' | string;
  maxSize: number;
  leader: PartyMemberUser;
  members: PartyMember[];
}

interface PartyPanelProps {
  questId: string;
  party: Party | null;
  maxParticipants: number;
  isAssigned: boolean;
  currentUserId: string;
  onPartyCreated: (party: Party) => void;
  onMemberAdded: () => void;
}

const VALID_RANKS: Rank[] = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];

function toInitials(name: string | null): string {
  if (!name) return '?';
  const chunks = name.trim().split(/\s+/).filter(Boolean);
  if (chunks.length === 0) return '?';
  return chunks.slice(0, 2).map((chunk) => chunk[0]?.toUpperCase() || '').join('');
}

function toRank(rank: string | null): Rank | null {
  if (!rank) return null;
  return VALID_RANKS.includes(rank as Rank) ? (rank as Rank) : null;
}

function formatJoinDate(joinedAt?: string): string {
  if (!joinedAt) return 'N/A';
  const date = new Date(joinedAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins === 0 ? 'just now' : `${diffMins}m ago`;
    }
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

export function PartyPanel({
  questId,
  party,
  maxParticipants,
  isAssigned,
  currentUserId,
  onPartyCreated,
  onMemberAdded,
}: PartyPanelProps) {
  const [isCreatingParty, setIsCreatingParty] = useState(false);
  const [isJoiningParty, setIsJoiningParty] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const isLeader = !!party && party.leader.id === currentUserId;
  const isCurrentMember = !!party && party.members.some((member) => member.user.id === currentUserId);
  const isBootcamp = party?.track === 'BOOTCAMP';
  const partyLabel = isBootcamp ? 'Pair' : 'Squad';
  const capacity = party?.maxSize ?? maxParticipants;
  const memberCount = party?.members.length ?? 0;
  const progressValue = capacity > 0 ? Math.round((memberCount / capacity) * 100) : 0;
  const emptySlots = Math.max(capacity - memberCount, 0);

  const canInvite = useMemo(() => !!party && isLeader && memberCount < capacity, [party, isLeader, memberCount, capacity]);
  const canJoin = !!party && !isLeader && !isCurrentMember && memberCount < capacity;

  const refreshParty = async (partyId: string) => {
    const response = await fetchWithAuth(`/api/parties/${partyId}`);
    const data = await response.json();
    if (!data.success || !data.party) {
      throw new Error(data.error || 'Failed to refresh party');
    }
    return data.party as Party;
  };

  const handleCreateParty = async () => {
    try {
      setIsCreatingParty(true);
      const response = await fetchWithAuth('/api/parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId }),
      });

      const data = await response.json();
      if (!data.success || !data.party) {
        toast.error(data.error || 'Failed to create party');
        return;
      }

      onPartyCreated(data.party as Party);
      toast.success('Party formed successfully');
    } catch (error) {
      console.error('Error creating party:', error);
      toast.error('An error occurred while creating party');
    } finally {
      setIsCreatingParty(false);
    }
  };

  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetchWithAuth(`/api/users/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success && Array.isArray(data.results)) {
        // Filter out users already in party
        const filteredResults = data.results.filter(
          (result: SearchResult) => !party?.members.some((m) => m.user.id === result.id)
        );
        setSearchResults(filteredResults);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };

  const handleInviteMember = async (userId: string) => {
    if (!party) return;

    try {
      setIsInviting(true);
      const response = await fetchWithAuth(`/api/parties/${party.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      if (!data.success || !data.party) {
        toast.error(data.error || 'Failed to add member');
        return;
      }

      onPartyCreated(data.party as Party);
      onMemberAdded();
      setSearchQuery('');
      setSearchResults([]);
      setIsInviteDialogOpen(false);
      toast.success('Member added to party');
    } catch (error) {
      console.error('Error adding party member:', error);
      toast.error('An error occurred while adding member');
    } finally {
      setIsInviting(false);
    }
  };

  const handleJoinParty = async () => {
    if (!party || !currentUserId) return;

    try {
      setIsJoiningParty(true);
      const response = await fetchWithAuth(`/api/parties/${party.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      });

      const data = await response.json();
      if (!data.success || !data.party) {
        toast.error(data.error || 'Failed to join party');
        return;
      }

      onPartyCreated(data.party as Party);
      onMemberAdded();
      toast.success('Joined party successfully');
    } catch (error) {
      console.error('Error joining party:', error);
      toast.error('An error occurred while joining party');
    } finally {
      setIsJoiningParty(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!party) return;

    try {
      setRemovingUserId(userId);
      const response = await fetchWithAuth(`/api/parties/${party.id}/members/${userId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!data.success) {
        toast.error(data.error || 'Failed to remove member');
        return;
      }

      const refreshed = await refreshParty(party.id);
      onPartyCreated(refreshed);
      onMemberAdded();
      toast.success('Member removed from party');
    } catch (error) {
      console.error('Error removing party member:', error);
      toast.error('An error occurred while removing member');
    } finally {
      setRemovingUserId(null);
    }
  };

  if (!party) {
    return (
      <GuildCard className="border-slate-200/80">
        <GuildPanel asChild className="border-0 bg-transparent shadow-none">
          <div className="space-y-4 p-6">
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-5 w-5 text-orange-500" />
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Party Panel</h2>
                <p className="mt-1 text-sm text-slate-500">
                  This quest supports up to {maxParticipants} adventurers.
                </p>
              </div>
            </div>

            {isAssigned ? (
              <Button className="w-full" onClick={() => void handleCreateParty()} disabled={isCreatingParty}>
                {isCreatingParty ? 'Forming Party...' : 'Form a Party'}
              </Button>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                Join this quest to form the {maxParticipants === 2 ? 'pair' : 'squad'}.
              </div>
            )}
          </div>
        </GuildPanel>
      </GuildCard>
    );
  }

  return (
    <GuildCard className="border-slate-200/80">
      <GuildPanel asChild className="border-0 bg-transparent shadow-none">
        <div className="space-y-4 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{partyLabel} Panel</h2>
              <p className="mt-1 text-sm text-slate-500">
                {memberCount}/{capacity} members
              </p>
            </div>
            <Badge variant="outline" className="uppercase">
              {party.track}
            </Badge>
          </div>

          <Progress value={progressValue} className="h-2" />

          {canJoin ? (
            <Button className="w-full" onClick={() => void handleJoinParty()} disabled={isJoiningParty}>
              {isJoiningParty ? 'Joining Party...' : 'Join Party'}
            </Button>
          ) : null}

          <div className="space-y-2">
            {party.members.map((member) => {
              const memberRank = toRank(member.user.rank);
              return (
                <div
                  key={member.user.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-slate-200">
                        <AvatarFallback className="bg-slate-100 text-xs font-semibold text-slate-700">
                          {toInitials(member.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900">{member.user.name || 'Unknown Adventurer'}</p>
                        {member.isLeader && <Crown className="h-4 w-4 text-amber-500" />}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 ml-12">joined {formatJoinDate(member.joinedAt)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {memberRank ? <RankBadge rank={memberRank} size="sm" /> : null}
                    {isLeader && !member.isLeader ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => void handleRemoveMember(member.user.id)}
                        disabled={removingUserId === member.user.id}
                        aria-label={`Remove ${member.user.name || 'member'}`}
                      >
                        <Trash2 className="h-4 w-4 text-rose-600" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {Array.from({ length: emptySlots }).map((_, index) => (
              <div
                key={`empty-slot-${index}`}
                className="flex items-center rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500"
              >
                Open member slot
              </div>
            ))}
          </div>

          {canInvite ? (
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <UserPlus className="h-4 w-4" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Invite Adventurer</DialogTitle>
                  <DialogDescription>
                    Search by name or email to invite someone to this {partyLabel.toLowerCase()}.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => void handleSearchUsers(e.target.value)}
                      className="pl-9"
                      disabled={isSearching}
                    />
                  </div>

                  {searchResults.length > 0 && (
                    <div className="max-h-72 space-y-2 overflow-y-auto">
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-8 w-8 border border-slate-200 flex-shrink-0">
                              <AvatarFallback className="bg-slate-100 text-xs font-semibold text-slate-700">
                                {toInitials(result.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {result.name || 'Unknown'}
                              </p>
                              <p className="text-xs text-slate-500 truncate">{result.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {toRank(result.rank) ? (
                              <RankBadge rank={toRank(result.rank)!} size="sm" />
                            ) : null}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => void handleInviteMember(result.id)}
                              disabled={isInviting}
                            >
                              Invite
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-500">No adventurers found</p>
                    </div>
                  )}

                  {searchQuery.length < 2 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-500">Type at least 2 characters to search</p>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                    Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : null}
        </div>
      </GuildPanel>
    </GuildCard>
  );
}
