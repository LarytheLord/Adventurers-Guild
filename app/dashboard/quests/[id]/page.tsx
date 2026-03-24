'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Label } from '@/components/ui/label';
import { RankBadge } from '@/components/ui/rank-badge';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Coins,
  Crown,
  FileText,
  Loader2,
  ShieldCheck,
  Sparkles,
  Target,
  UserMinus,
  UserPlus,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  GuildCard,
  GuildChip,
  GuildHero,
  GuildKpi,
  GuildPage,
  GuildPanel,
} from '@/components/guild/primitives';

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

interface Quest {
  id: string;
  title: string;
  description: string;
  detailedDescription?: string;
  questType: string;
  status: string;
  difficulty: string;
  track: string;
  xpReward: number;
  skillPointsReward: number;
  monetaryReward?: number;
  requiredSkills: string[];
  requiredRank?: string;
  maxParticipants?: number;
  questCategory: string;
  companyId?: string | null;
  createdAt: string;
  deadline?: string;
  party?: Party | null;
  company?: {
    name: string;
    email?: string;
  } | null;
}

interface Assignment {
  id: string;
  questId: string;
  userId: string;
  status: string;
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  progress?: number;
}

interface PartyCandidate extends PartyUser {
  bootcampLink?: {
    id: string;
  } | null;
}

function assignmentStatusClass(status: string) {
  switch (status) {
    case 'assigned':
      return 'bg-sky-100 text-sky-700 border-sky-300';
    case 'started':
    case 'in_progress':
      return 'bg-amber-100 text-amber-700 border-amber-300';
    case 'submitted':
      return 'bg-violet-100 text-violet-700 border-violet-300';
    case 'completed':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    case 'cancelled':
      return 'bg-rose-100 text-rose-700 border-rose-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300';
  }
}

function questStatusClass(status: string) {
  switch (status) {
    case 'available':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    case 'in_progress':
      return 'bg-sky-100 text-sky-700 border-sky-300';
    case 'review':
      return 'bg-amber-100 text-amber-700 border-amber-300';
    case 'completed':
      return 'bg-violet-100 text-violet-700 border-violet-300';
    case 'cancelled':
      return 'bg-rose-100 text-rose-700 border-rose-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300';
  }
}

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

function getPartyCapacity(track: string) {
  return track === 'BOOTCAMP' ? 2 : 5;
}

export default function QuestDetailPage() {
  const params = useParams<{ id: string }>();
  const questId = params?.id;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quest, setQuest] = useState<Quest | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPartySubmitting, setIsPartySubmitting] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [partySearch, setPartySearch] = useState('');
  const [partyCandidates, setPartyCandidates] = useState<PartyCandidate[]>([]);
  const [partySearchLoading, setPartySearchLoading] = useState(false);
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(null);

  const viewerId = session?.user?.id ?? null;
  const viewerRole = session?.user?.role ?? null;
  const party = quest?.party ?? null;
  const viewerPartyMember = party?.members.find((member) => member.userId === viewerId) ?? null;
  const isPartyLeader = !!party && party.leaderId === viewerId;
  const canManageParty = viewerRole === 'admin' || isPartyLeader;
  const canFormParty = viewerRole === 'adventurer' && quest?.status === 'available' && !party;

  async function loadQuestDetails(showSpinner = true) {
    if (!questId) return;

    try {
      if (showSpinner) {
        setLoading(true);
      }
      setError(null);

      const questResponse = await fetch(`/api/quests/${questId}`, { cache: 'no-store' });
      const questData = await questResponse.json();

      if (!questResponse.ok || !questData.success) {
        setError(questData.error || 'Failed to fetch quest');
        return;
      }

      const normalizedQuest = questData.quest ?? questData.quests?.[0] ?? null;
      if (!normalizedQuest) {
        setError('Quest details not found');
        return;
      }

      setQuest(normalizedQuest);

      if (session?.user?.id) {
        const assignmentResponse = await fetch(
          `/api/quests/assignments?userId=${session.user.id}&questId=${questId}`,
          { cache: 'no-store' }
        );
        const assignmentData = await assignmentResponse.json();

        if (assignmentResponse.ok && assignmentData.success && assignmentData.assignments.length > 0) {
          setAssignment(assignmentData.assignments[0]);
        } else {
          setAssignment(null);
        }
      } else {
        setAssignment(null);
      }
    } catch (fetchError) {
      console.error('Error fetching quest details:', fetchError);
      setError('An error occurred while fetching quest details');
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role === 'company') {
      router.push('/dashboard/company');
      return;
    }

    if (status === 'authenticated' && questId) {
      void loadQuestDetails();
    }
  }, [questId, router, session?.user?.id, session?.user?.role, status]);

  useEffect(() => {
    if (!isInviteDialogOpen) {
      setPartySearch('');
      setPartyCandidates([]);
      setPartySearchLoading(false);
      return;
    }

    const query = partySearch.trim();
    if (!party?.id || query.length < 2) {
      setPartyCandidates([]);
      setPartySearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setPartySearchLoading(true);
        const response = await fetch(`/api/parties/${party.id}/members?search=${encodeURIComponent(query)}`, {
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
  }, [isInviteDialogOpen, party?.id, partySearch]);

  const isAssigned = !!assignment;
  const canAssign = quest?.status === 'available' && !isAssigned;
  const canSubmit = !!assignment && ['assigned', 'started', 'in_progress'].includes(assignment.status);

  const rewardCards = useMemo(
    () =>
      quest
        ? [
            {
              label: 'XP Reward',
              value: `${quest.xpReward} XP`,
              icon: Zap,
              accent: 'text-amber-500',
            },
            {
              label: 'Skill Points',
              value: `${quest.skillPointsReward} SP`,
              icon: Target,
              accent: 'text-sky-500',
            },
            {
              label: 'Slots',
              value: `${quest.maxParticipants || 1}`,
              icon: Users,
              accent: 'text-emerald-500',
            },
            {
              label: 'Payout',
              value: quest.monetaryReward ? `$${Number(quest.monetaryReward)}` : 'XP only',
              icon: Coins,
              accent: 'text-violet-500',
            },
          ]
        : [],
    [quest]
  );

  async function handleFormParty() {
    if (!questId) return;

    try {
      setIsPartySubmitting(true);
      const response = await fetch('/api/parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.error || 'Failed to form party');
        return;
      }

      setQuest((currentQuest) => (currentQuest ? { ...currentQuest, party: data.party } : currentQuest));
      toast.success('Party formed successfully');
    } catch (partyError) {
      console.error('Error forming party:', partyError);
      toast.error('An error occurred while forming the party');
    } finally {
      setIsPartySubmitting(false);
    }
  }

  async function handleAddPartyMember(userId: string) {
    if (!party?.id) return;

    try {
      setPendingMemberId(userId);
      const response = await fetch(`/api/parties/${party.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.error || 'Failed to add party member');
        return;
      }

      setQuest((currentQuest) => (currentQuest ? { ...currentQuest, party: data.party } : currentQuest));
      setPartySearch('');
      setPartyCandidates([]);
      setIsInviteDialogOpen(false);
      toast.success('Party member added');
    } catch (partyError) {
      console.error('Error adding party member:', partyError);
      toast.error('An error occurred while adding the member');
    } finally {
      setPendingMemberId(null);
    }
  }

  async function handleRemovePartyMember(userId: string) {
    if (!party?.id) return;
    if (!window.confirm('Remove this adventurer from the party?')) return;

    try {
      setPendingMemberId(userId);
      const response = await fetch(`/api/parties/${party.id}/members/${userId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.error || 'Failed to remove party member');
        return;
      }

      setQuest((currentQuest) => (currentQuest ? { ...currentQuest, party: data.party } : currentQuest));
      toast.success('Party member removed');
    } catch (partyError) {
      console.error('Error removing party member:', partyError);
      toast.error('An error occurred while removing the member');
    } finally {
      setPendingMemberId(null);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <GuildPage>
        <GuildPanel className="flex min-h-[320px] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        </GuildPanel>
      </GuildPage>
    );
  }

  if (error) {
    return (
      <GuildPage>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </GuildPage>
    );
  }

  if (!quest) {
    return (
      <GuildPage>
        <GuildPanel className="p-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-slate-400" />
          <h2 className="text-xl font-semibold text-slate-900">Quest not found</h2>
          <Button className="mt-4" variant="outline" onClick={() => router.push('/dashboard/quests')}>
            Back to Quest Board
          </Button>
        </GuildPanel>
      </GuildPage>
    );
  }

  return (
    <GuildPage>
      <GuildHero>
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={questStatusClass(quest.status)}>
                {quest.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline">{quest.difficulty}-Rank</Badge>
              <Badge variant="secondary" className="capitalize">
                {quest.questCategory}
              </Badge>
              <Badge variant="secondary">{quest.track}</Badge>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{quest.title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                Posted by {quest.company?.name || 'Unknown Company'} - {quest.questType.replace('_', ' ')} quest
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <GuildChip>Direct brief</GuildChip>
              <GuildChip>{quest.requiredRank ? `Req. ${quest.requiredRank}-Rank` : 'Open rank access'}</GuildChip>
              <GuildChip>{getPartyCapacity(quest.track)} party slots max</GuildChip>
              {quest.deadline && <GuildChip>Due {new Date(quest.deadline).toLocaleDateString()}</GuildChip>}
            </div>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard/quests')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Quest Board
          </Button>
        </div>
      </GuildHero>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {rewardCards.map((card) => (
          <GuildKpi key={card.label}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
              <card.icon className={`h-4 w-4 ${card.accent}`} />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
          </GuildKpi>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <GuildCard className="border-slate-200/80">
          <GuildPanel asChild className="border-0 bg-transparent shadow-none">
            <div className="space-y-6 p-6">
              <section>
                <h2 className="text-lg font-semibold text-slate-900">Quest Brief</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{quest.description}</p>
              </section>

              {quest.detailedDescription && (
                <section>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-500" />
                    <h2 className="text-lg font-semibold text-slate-900">Detailed Requirements</h2>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">
                    {quest.detailedDescription}
                  </p>
                </section>
              )}

              {quest.requiredSkills?.length > 0 && (
                <section>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-sky-500" />
                    <h2 className="text-lg font-semibold text-slate-900">Required Skills</h2>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {quest.requiredSkills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </GuildPanel>
        </GuildCard>

        <div className="space-y-6">
          {isAssigned && assignment ? (
            <GuildCard className="border-slate-200/80">
              <GuildPanel asChild className="border-0 bg-transparent shadow-none">
                <div className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Your Assignment</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Assigned on {new Date(assignment.assignedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className={assignmentStatusClass(assignment.status)}>
                      {assignment.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    {assignment.status === 'completed'
                      ? 'This quest is complete on your ledger.'
                      : assignment.status === 'submitted'
                        ? 'Your delivery is in review.'
                        : 'You are currently responsible for this quest. Keep delivery momentum high.'}
                  </div>
                  {assignment.status === 'completed' && (
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                      <CheckCircle className="h-4 w-4" />
                      Quest completed successfully
                    </div>
                  )}
                </div>
              </GuildPanel>
            </GuildCard>
          ) : canAssign ? (
            <GuildCard className="border-slate-200/80">
              <GuildPanel asChild className="border-0 bg-transparent shadow-none">
                <div className="space-y-4 p-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Accept This Quest</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Claim the brief and move it into your active pipeline.
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/quests/assignments', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ questId }),
                        });

                        const data = await response.json();
                        if (!data.success) {
                          toast.error(data.error || 'Failed to assign to quest');
                          return;
                        }

                        setAssignment(data.assignment);
                        toast.success('Successfully assigned to quest!');
                      } catch (assignError) {
                        console.error('Error assigning to quest:', assignError);
                        toast.error('An error occurred while assigning to quest');
                      }
                    }}
                    disabled={!!(quest.maxParticipants && quest.maxParticipants <= 0)}
                  >
                    Claim Quest
                  </Button>
                </div>
              </GuildPanel>
            </GuildCard>
          ) : (
            <GuildCard className="border-slate-200/80">
              <GuildPanel asChild className="border-0 bg-transparent shadow-none">
                <div className="space-y-4 p-6 text-center">
                  <XCircle className="mx-auto h-12 w-12 text-slate-400" />
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Quest not claimable</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      This quest is currently {quest.status.replace('_', ' ')}.
                    </p>
                  </div>
                </div>
              </GuildPanel>
            </GuildCard>
          )}

          <GuildCard className="border-slate-200/80">
            <GuildPanel asChild className="border-0 bg-transparent shadow-none">
              <div className="space-y-4 p-6">
                <h2 className="text-lg font-semibold text-slate-900">Mission Snapshot</h2>
                <div className="grid gap-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      Deadline
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {quest.deadline ? new Date(quest.deadline).toLocaleDateString() : 'No deadline set'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <Crown className="h-3.5 w-3.5" />
                      Rank Requirement
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {quest.requiredRank ? `${quest.requiredRank}-Rank or above` : 'No rank gate'}
                    </p>
                  </div>
                </div>
              </div>
            </GuildPanel>
          </GuildCard>
        </div>
      </div>

      <GuildCard className="border-slate-200/80">
        <GuildPanel asChild className="border-0 bg-transparent shadow-none">
          <div className="space-y-5 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Party Panel</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {party
                    ? `Delivery party for ${party.track} track quests.`
                    : 'Form a delivery party to tackle this quest as a coordinated squad.'}
                </p>
              </div>
              <Badge variant="outline" className="w-fit">
                {party ? `${party.members.length}/${party.maxSize} members` : `${getPartyCapacity(quest.track)} max`}
              </Badge>
            </div>

            {!party ? (
              <div className="space-y-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Track Rules</p>
                    <p className="mt-2 text-sm text-slate-700">
                      {quest.track === 'BOOTCAMP'
                        ? 'BOOTCAMP quests run as pairs and require bootcamp-linked adventurers.'
                        : 'OPEN and INTERN quests can form parties up to five members.'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Leadership Gate</p>
                    <p className="mt-2 text-sm text-slate-700">
                      Party leaders need at least {quest.difficulty}-Rank to own delivery for this quest.
                    </p>
                  </div>
                </div>

                {canFormParty ? (
                  <Button onClick={() => void handleFormParty()} disabled={isPartySubmitting}>
                    {isPartySubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                    Form a Party
                  </Button>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                    {quest.status !== 'available'
                      ? 'Parties can only be formed from the quest board while the quest is available.'
                      : 'Only adventurers can form parties from this view.'}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Party Leader</p>
                    <div className="mt-3 flex items-center gap-3">
                      <Avatar className="h-11 w-11 border border-slate-200">
                        <AvatarImage src={party.leader.avatar ?? undefined} alt={party.leader.name ?? 'Party leader'} />
                        <AvatarFallback>{getInitials(party.leader.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-slate-900">{party.leader.name || 'Unnamed adventurer'}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <RankBadge rank={(party.leader.rank || 'F') as 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S'} size="sm" />
                          <span className="text-xs text-slate-500">Lead assignment holder</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Party Status</p>
                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      Invite-only in this phase. Leader or admins manage membership.
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {party.maxSize - party.members.length > 0
                        ? `${party.maxSize - party.members.length} open slot(s) remaining.`
                        : 'Party is at full capacity.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {party.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-11 w-11 border border-slate-200">
                          <AvatarImage src={member.user.avatar ?? undefined} alt={member.user.name ?? 'Party member'} />
                          <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-900">{member.user.name || 'Unnamed adventurer'}</p>
                            {member.isLeader && <Badge variant="secondary">Leader</Badge>}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <RankBadge rank={(member.user.rank || 'F') as 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S'} size="sm" />
                            <span className="text-xs text-slate-500">
                              Joined {new Date(member.joinedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {canManageParty && !member.isLeader ? (
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
                      ) : null}
                    </div>
                  ))}
                </div>

                {canManageParty && party.members.length < party.maxSize ? (
                  <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <UserPlus className="h-4 w-4" />
                        Add Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add a party member</DialogTitle>
                        <DialogDescription>
                          Search adventurers by name or email to fill the remaining party slots.
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
                            partyCandidates.map((candidate) => (
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
                                  <RankBadge rank={(candidate.rank || 'F') as 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S'} size="sm" />
                                  <Button
                                    size="sm"
                                    disabled={pendingMemberId === candidate.id}
                                    onClick={() => void handleAddPartyMember(candidate.id)}
                                  >
                                    {pendingMemberId === candidate.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      'Add'
                                    )}
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : null}

                {!viewerPartyMember ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    This party is invite-only for now. Join requests land in a later phase, so reach out to the party
                    leader or an admin if you should be added.
                  </div>
                ) : !isPartyLeader ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    You are a member of this party. Leadership actions stay with the current party leader.
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </GuildPanel>
      </GuildCard>

      {canSubmit && (
        <GuildCard className="border-slate-200/80">
          <GuildPanel asChild className="border-0 bg-transparent shadow-none">
            <div className="space-y-5 p-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Submit Delivery</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Share your repo, deployment, or implementation notes for review.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="submissionContent">Submission Content</Label>
                <Textarea
                  id="submissionContent"
                  placeholder="Provide a link to your work, repository, or delivery notes..."
                  value={submissionContent}
                  onChange={(event) => setSubmissionContent(event.target.value)}
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="submissionNotes">Additional Notes</Label>
                <Textarea
                  id="submissionNotes"
                  placeholder="Anything the reviewer should know..."
                  value={submissionNotes}
                  onChange={(event) => setSubmissionNotes(event.target.value)}
                  rows={3}
                />
              </div>

              <Button
                className="w-full"
                disabled={isSubmitting || !submissionContent.trim()}
                onClick={async () => {
                  if (!assignment?.id) {
                    router.push('/login');
                    return;
                  }

                  setIsSubmitting(true);

                  try {
                    const response = await fetch('/api/quests/submissions', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        assignmentId: assignment.id,
                        submissionContent,
                        submissionNotes,
                      }),
                    });

                    const data = await response.json();
                    if (!data.success) {
                      toast.error(data.error || 'Failed to submit quest');
                      return;
                    }

                    toast.success('Submission successful!');
                    setAssignment((previous) => (previous ? { ...previous, status: 'submitted' } : previous));
                    setSubmissionContent('');
                    setSubmissionNotes('');
                    await loadQuestDetails(false);
                  } catch (submitError) {
                    console.error('Error submitting quest:', submitError);
                    toast.error('An error occurred while submitting quest');
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quest'}
              </Button>
            </div>
          </GuildPanel>
        </GuildCard>
      )}
    </GuildPage>
  );
}
