'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import PartyPanel from '@/components/quest/PartyPanel';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Coins,
  Crown,
  FileText,
  Sparkles,
  Target,
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
import { fetchWithAuth } from '@/lib/fetch-with-auth';

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

  const viewerId = session?.user?.id ?? null;

  const loadQuestDetails = useCallback(async (showSpinner = true) => {
    if (!questId) return;

    try {
      if (showSpinner) {
        setLoading(true);
      }
      setError(null);

      const questResponse = await fetchWithAuth(`/api/quests/${questId}`, { cache: 'no-store' });
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
        const assignmentResponse = await fetchWithAuth(
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
  }, [questId, session?.user?.id]);

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
  }, [loadQuestDetails, questId, router, session?.user?.role, status]);

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
              <GuildChip>{quest.maxParticipants || 1} party slots max</GuildChip>
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
                        const response = await fetchWithAuth('/api/quests/assignments', {
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

      {(quest.maxParticipants ?? 1) > 1 ? (
        <PartyPanel
          questId={quest.id}
          party={quest.party ?? null}
          maxParticipants={quest.maxParticipants ?? 1}
          isAssigned={isAssigned}
          currentUserId={viewerId ?? ''}
          onPartyCreated={(nextParty) =>
            setQuest((currentQuest) => (currentQuest ? { ...currentQuest, party: nextParty } : currentQuest))
          }
          onMemberAdded={() => {
            void loadQuestDetails(false);
          }}
        />
      ) : null}

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
                    const response = await fetchWithAuth('/api/quests/submissions', {
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
