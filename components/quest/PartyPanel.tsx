'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { RankBadge } from '@/components/ui/rank-badge';
import { Crown, Loader2, ShieldCheck, UserMinus, UserPlus, Users } from 'lucide-react';
import { GuildCard, GuildPanel } from '@/components/guild/primitives';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

type Rank = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

interface PartyUser {
  id: string;
  name?: string | null;
  rank: string;
  avatar?: string | null;
  email?: string | null;
}

interface PartyMember {
  id: string;
  userId: string;
  isLeader: boolean;
  joinedAt: string;
  user: PartyUser;
}

interface Party {
  id: string;
  questId: string;
  leaderId: string;
  track: string;
  maxSize: number;
  createdAt: string;
  leader: PartyUser;
  members: PartyMember[];
}

interface PartyCandidate extends PartyUser {
  bootcampLink?: {
    id: string;
  } | null;
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

const MS_PER_DAY = 86_400_000;
const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

function getInitials(name?: string | null) {
  return (
    name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((segment) => segment[0]?.toUpperCase())
      .join('') || 'AG'
  );
}

function toRank(rank: string | undefined) {
  return (['F', 'E', 'D', 'C', 'B', 'A', 'S'].includes(rank || '') ? rank : 'F') as Rank;
}

function formatRelativeJoinDate(joinedAt: string) {
  const joinedTime = new Date(joinedAt).getTime();
  if (Number.isNaN(joinedTime)) {
    return new Date(joinedAt).toLocaleDateString();
  }

  const dayDelta = Math.round((joinedTime - Date.now()) / MS_PER_DAY);
  if (Math.abs(dayDelta) <= 30) {
    return relativeTimeFormatter.format(dayDelta, 'day');
  }

  return new Date(joinedAt).toLocaleDateString();
}

export default function PartyPanel({
  questId,
  party,
  maxParticipants,
  isAssigned,
  currentUserId,
  onPartyCreated,
  onMemberAdded,
}: PartyPanelProps) {
  const [currentParty, setCurrentParty] = useState<Party | null>(party);
  const [isPartySubmitting, setIsPartySubmitting] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [partySearch, setPartySearch] = useState('');
  const [partyCandidates, setPartyCandidates] = useState<PartyCandidate[]>([]);
  const [partySearchLoading, setPartySearchLoading] = useState(false);
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentParty(party);
  }, [party]);

  useEffect(() => {
    if (!isInviteDialogOpen) {
      setPartySearch('');
      setPartyCandidates([]);
      setPartySearchLoading(false);
      return;
    }

    const query = partySearch.trim();
    if (!currentParty?.id || query.length < 2) {
      setPartyCandidates([]);
      setPartySearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setPartySearchLoading(true);
        const response = await fetchWithAuth(`/api/parties/${currentParty.id}/members?search=${encodeURIComponent(query)}`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          toast.error(data.error || 'Failed to search adventurers');
          setPartyCandidates([]);
          return;
        }

        setPartyCandidates(data.users ?? []);
      } catch (searchError) {
        if ((searchError as Error).name !== 'AbortError') {
          console.error('Error searching for party members:', searchError);
          toast.error('Failed to search adventurers');
        }
      } finally {
        setPartySearchLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [currentParty?.id, isInviteDialogOpen, partySearch]);

  const isPartyLeader = !!currentParty && currentParty.leaderId === currentUserId;
  const canFormParty = !currentParty && isAssigned;
  const capacity = currentParty?.maxSize ?? maxParticipants;
  const memberCount = currentParty?.members.length ?? 0;
  const openSlots = Math.max(capacity - memberCount, 0);
  const capacityPercent = capacity > 0 ? (memberCount / capacity) * 100 : 0;
  const partyLabel = maxParticipants === 2 ? 'Pair' : 'Squad';

  async function handleFormParty() {
    try {
      setIsPartySubmitting(true);
      const response = await fetchWithAuth('/api/parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.error || 'Failed to form party');
        return;
      }

      setCurrentParty(data.party);
      onPartyCreated(data.party);
      toast.success(`${partyLabel} formed successfully`);
    } catch (partyError) {
      console.error('Error forming party:', partyError);
      toast.error('An error occurred while forming the party');
    } finally {
      setIsPartySubmitting(false);
    }
  }

  async function handleAddPartyMember(userId: string, candidateLabel: string) {
    if (!currentParty?.id) return;

    try {
      setPendingMemberId(userId);
      const response = await fetchWithAuth(`/api/parties/${currentParty.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.error || 'Failed to invite party member');
        return;
      }

      setCurrentParty(data.party);
      setPartySearch('');
      setPartyCandidates([]);
      setIsInviteDialogOpen(false);
      onMemberAdded();
      toast.success(`Invitation sent to ${candidateLabel}`);
    } catch (partyError) {
      console.error('Error adding party member:', partyError);
      toast.error('An error occurred while inviting the member');
    } finally {
      setPendingMemberId(null);
    }
  }

  async function handleRemovePartyMember(userId: string) {
    if (!currentParty?.id) return;
    if (!window.confirm('Remove this adventurer from the party?')) return;

    try {
      setPendingMemberId(userId);
      const response = await fetchWithAuth(`/api/parties/${currentParty.id}/members/${userId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.error || 'Failed to remove party member');
        return;
      }

      setCurrentParty(data.party);
      onMemberAdded();
      toast.success('Party member removed');
    } catch (partyError) {
      console.error('Error removing party member:', partyError);
      toast.error('An error occurred while removing the member');
    } finally {
      setPendingMemberId(null);
    }
  }

  return (
    <GuildCard className="border-slate-200/80">
      <GuildPanel asChild className="border-0 bg-transparent shadow-none">
        <div className="space-y-5 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Party Panel</h2>
              <p className="mt-1 text-sm text-slate-500">
                {currentParty
                  ? `${partyLabel} status, invite flow, and delivery ownership for this quest.`
                  : `This quest supports up to ${maxParticipants} adventurers.`}
              </p>
            </div>
            <Badge variant="outline" className="w-fit">
              {memberCount}/{capacity} members
            </Badge>
          </div>

          {!currentParty ? (
            <div className="space-y-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{partyLabel}</Badge>
                <Badge variant="outline">{maxParticipants} slots</Badge>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                <p className="font-medium text-slate-900">This quest supports up to {maxParticipants} adventurers.</p>
                <p className="mt-2 text-slate-600">
                  Form your {partyLabel.toLowerCase()} once you are assigned so the team has a visible leader, clear members,
                  and an invite trail.
                </p>
              </div>

              {canFormParty ? (
                <Button onClick={() => void handleFormParty()} disabled={isPartySubmitting}>
                  {isPartySubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                  Form a Party
                </Button>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                  You need to be assigned to this quest before you can form a {partyLabel.toLowerCase()}.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{partyLabel}</Badge>
                      <Badge variant="outline">{currentParty.track}</Badge>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {memberCount}/{capacity} members
                    </span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-orange-500 transition-all"
                      style={{ width: `${Math.max(capacityPercent, memberCount > 0 ? 12 : 0)}%` }}
                    />
                  </div>
                  <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    {openSlots > 0 ? `${openSlots} open slot(s) remaining.` : 'Party is at full capacity.'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Party leader</p>
                  <div className="mt-3 flex items-center gap-3">
                    <Avatar className="h-11 w-11 border border-slate-200">
                      <AvatarImage src={currentParty.leader.avatar ?? undefined} alt={currentParty.leader.name ?? 'Party leader'} />
                      <AvatarFallback>{getInitials(currentParty.leader.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">{currentParty.leader.name || 'Unnamed adventurer'}</p>
                        <Badge variant="secondary" className="gap-1">
                          <Crown className="h-3 w-3 text-amber-500" />
                          Party Leader
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <RankBadge rank={toRank(currentParty.leader.rank)} size="sm" />
                        <span className="text-xs text-slate-500">Owns delivery and manages invites</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {currentParty.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex min-h-[132px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-11 w-11 border border-slate-200">
                        <AvatarImage src={member.user.avatar ?? undefined} alt={member.user.name ?? 'Party member'} />
                        <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-semibold text-slate-900">{member.user.name || 'Unnamed adventurer'}</p>
                          {member.isLeader ? (
                            <Badge variant="secondary" className="gap-1">
                              <Crown className="h-3 w-3 text-amber-500" />
                              Party Leader
                            </Badge>
                          ) : null}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <RankBadge rank={toRank(member.user.rank)} size="sm" />
                          <span className="text-xs text-slate-500">joined {formatRelativeJoinDate(member.joinedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {isPartyLeader && !member.isLeader ? (
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pendingMemberId === member.userId}
                          onClick={() => void handleRemovePartyMember(member.userId)}
                        >
                          {pendingMemberId === member.userId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserMinus className="h-4 w-4" />
                          )}
                          Remove
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ))}

                {Array.from({ length: openSlots }).map((_, index) => (
                  <div
                    key={`empty-slot-${index}`}
                    className="flex min-h-[132px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center text-sm text-slate-500"
                  >
                    Empty slot
                  </div>
                ))}
              </div>

              {isPartyLeader && openSlots > 0 ? (
                <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <UserPlus className="h-4 w-4" />
                      Invite to Party
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite a party member</DialogTitle>
                      <DialogDescription>
                        Search adventurers by name or email. Inviting adds them to the party and sends a Discord notification.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        value={partySearch}
                        onChange={(event) => setPartySearch(event.target.value)}
                        placeholder="Search by name or email"
                      />
                      <div className="space-y-3">
                        {partySearchLoading ? (
                          <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm text-slate-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Searching adventurers...
                          </div>
                        ) : partySearch.trim().length < 2 ? (
                          <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-500">
                            Type at least 2 characters to search.
                          </div>
                        ) : partyCandidates.length === 0 ? (
                          <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-500">
                            No eligible adventurers found for this party.
                          </div>
                        ) : (
                          partyCandidates.map((candidate) => {
                            const candidateLabel = candidate.name || candidate.email || 'this adventurer';

                            return (
                              <div
                                key={candidate.id}
                                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10 border border-slate-200">
                                    <AvatarImage src={candidate.avatar ?? undefined} alt={candidate.name ?? 'Adventurer'} />
                                    <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-slate-900">{candidate.name || 'Unnamed adventurer'}</p>
                                    <p className="text-xs text-slate-500">{candidate.email}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <RankBadge rank={toRank(candidate.rank)} size="sm" />
                                  <Button
                                    size="sm"
                                    disabled={pendingMemberId === candidate.id}
                                    onClick={() => void handleAddPartyMember(candidate.id, candidateLabel)}
                                  >
                                    {pendingMemberId === candidate.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      'Invite'
                                    )}
                                  </Button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : null}
            </div>
          )}
        </div>
      </GuildPanel>
    </GuildCard>
  );
}
