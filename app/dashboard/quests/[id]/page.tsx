'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Coins,
  Crown,
  FileText,
  Link,
  Share2,
  Sparkles,
  Target,
  Twitter,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { GuildCard, GuildChip, GuildHero, GuildKpi, GuildPage, GuildPanel } from '@/components/guild/primitives';
import { PartyPanel, type Party } from '@/components/quest/PartyPanel';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import { StreakMultiplierNotice } from '@/components/ui/streak-badge';

interface Quest {
  id: string;
  title: string;
  description: string;
  detailedDescription?: string;
  questType: string;
  status: string;
  difficulty: string;
  xpReward: number;
  skillPointsReward: number;
  monetaryReward?: number;
  requiredSkills: string[];
  requiredRank?: string;
  maxParticipants?: number;
  questCategory: string;
  companyId: string;
  createdAt: string;
  deadline?: string;
  shareCount?: number;
  company?: {
    name: string;
    email?: string;
  };
  party?: Party | null;
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
    case 'pending_admin_review':
      return 'bg-violet-100 text-violet-700 border-violet-300';
    case 'needs_rework':
      return 'bg-orange-100 text-orange-700 border-orange-300';
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
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role === 'company') {
      router.push('/dashboard/company');
      return;
    }

    const fetchQuestAndAssignment = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fire all three requests in parallel — cuts load time from ~9s to ~3s
        const userId = session?.user?.id;
        const [questResult, assignmentResult, profileResult] = await Promise.allSettled([
          fetchWithAuth(`/api/quests/${questId}`).then((r) => r.json()),
          userId
            ? fetchWithAuth(`/api/quests/assignments?userId=${userId}&questId=${questId}`).then((r) => r.json())
            : Promise.resolve(null),
          userId
            ? fetchWithAuth('/api/adventurer/profile').then((r) => r.json())
            : Promise.resolve(null),
        ]);

        // Quest is required — fail fast if it errors
        if (questResult.status === 'rejected') {
          setError('Failed to load quest details');
          return;
        }
        const questData = questResult.value;
        if (!questData.success) {
          setError(questData.error || 'Failed to fetch quest');
          return;
        }
        const normalizedQuest = questData.quest ?? questData.quests?.[0] ?? null;
        if (!normalizedQuest) {
          setError('Quest details not found');
          return;
        }
        setQuest(normalizedQuest);

        // Assignment — optional, don't block on failure
        if (assignmentResult.status === 'fulfilled' && assignmentResult.value) {
          const assignmentData = assignmentResult.value;
          const assignments = Array.isArray(assignmentData.assignments) ? assignmentData.assignments : [];
          setAssignment(assignmentData.success && assignments.length > 0 ? assignments[0] : null);
        }

        // Profile / streak — optional, don't block on failure
        if (profileResult.status === 'fulfilled' && profileResult.value) {
          const profileData = profileResult.value;
          if (profileData.success && profileData.profile) {
            setCurrentStreak(profileData.profile.currentStreak ?? 0);
          }
        }
      } catch (fetchError) {
        console.error('Error fetching quest details:', fetchError);
        setError('An error occurred while fetching quest details');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && questId) {
      void fetchQuestAndAssignment();
    }
  }, [questId, router, session, status]);

  const isAssigned = !!assignment;
  const canAssign = quest?.status === 'available' && !isAssigned;
  // 'assigned' excluded — company must accept first (backend rejects submissions in that state)
  const canSubmit = !!assignment && ['started', 'in_progress', 'needs_rework'].includes(assignment.status);
  const showPartyPanel = (quest?.maxParticipants ?? 1) > 1;

  useEffect(() => {
    if (!quest) return;
    const imageUrl = `${window.location.origin}/api/og/quests/${quest.id}`;
    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
      ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      document.head.appendChild(ogImage);
    }
    ogImage.setAttribute('content', imageUrl);
    return () => {
      ogImage?.remove();
    };
  }, [quest?.id]);

  const searchParams = useSearchParams();
  const utmSource = searchParams.get('utm_source');
  const [shareCount, setShareCount] = useState(0);

  const trackShare = useCallback(async (source: string) => {
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId, source }),
      });
      const data = await response.json();
      if (data.success) {
        setShareCount(data.shareCount);
      }
    } catch {
      console.error('Failed to track share');
    }
  }, [questId]);

  const getShareUrl = useCallback((source: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const url = `${baseUrl}?utm_source=${source}`;
    const text = quest ? `${quest.title} — Guild` : 'Check out this quest on Guild';
    return { url, text };
  }, [quest]);

  const shareOnX = useCallback(() => {
    const { url, text } = getShareUrl('twitter');
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    trackShare('twitter');
  }, [getShareUrl, trackShare]);

  const shareOnLinkedIn = useCallback(() => {
    const { url } = getShareUrl('linkedin');
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    trackShare('linkedin');
  }, [getShareUrl, trackShare]);

  const copyLink = useCallback(async () => {
    const { url } = getShareUrl('copy');
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
      trackShare('copy');
    } catch {
      toast.error('Failed to copy link');
    }
  }, [getShareUrl, trackShare]);

  useEffect(() => {
    if (quest?.shareCount !== undefined) {
      setShareCount(quest.shareCount);
    }
  }, [quest?.shareCount]);

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
        {/* Hero skeleton */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 animate-pulse">
          <div className="flex gap-2 mb-4">
            <div className="h-5 w-20 rounded-full bg-slate-200" />
            <div className="h-5 w-14 rounded-full bg-slate-200" />
            <div className="h-5 w-16 rounded-full bg-slate-200" />
          </div>
          <div className="h-9 w-3/4 rounded-lg bg-slate-200 mb-3" />
          <div className="h-4 w-1/3 rounded bg-slate-100" />
        </div>
        {/* KPI row skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0,1,2,3].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse">
              <div className="h-3 w-16 rounded bg-slate-200 mb-3" />
              <div className="h-7 w-24 rounded bg-slate-200" />
            </div>
          ))}
        </div>
        {/* Body skeleton */}
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 animate-pulse">
            <div className="h-5 w-28 rounded bg-slate-200" />
            <div className="space-y-2">
              {[80,95,70,85,60].map((w, i) => (
                <div key={i} className={`h-3 rounded bg-slate-100`} style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 animate-pulse">
            <div className="h-5 w-36 rounded bg-slate-200 mb-4" />
            <div className="h-10 w-full rounded-xl bg-slate-200" />
          </div>
        </div>
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
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{quest.title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                Posted by {quest.company?.name || 'Unknown Company'} · {quest.questType.replace('_', ' ')} quest
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <GuildChip>Direct brief</GuildChip>
              <GuildChip>{quest.requiredRank ? `Req. ${quest.requiredRank}-Rank` : 'Open rank access'}</GuildChip>
              {quest.deadline && (
                <GuildChip>Due {new Date(quest.deadline).toLocaleDateString()}</GuildChip>
              )}
              {utmSource && (
                <GuildChip>Shared via {utmSource}</GuildChip>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={shareOnX} title="Share on X">
                <Twitter className="h-4 w-4" />
                <span className="hidden sm:inline">X</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={shareOnLinkedIn} title="Share on LinkedIn">
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">LinkedIn</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={copyLink} title="Copy link">
                <Link className="h-4 w-4" />
                <span className="hidden sm:inline">Copy</span>
              </Button>
            </div>
            {shareCount > 0 && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Share2 className="h-3 w-3" />
                Shared {shareCount} times
              </span>
            )}
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push('/dashboard/quests')}>
              <ArrowLeft className="h-4 w-4" />
              Back to Quest Board
            </Button>
          </div>
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
                      {assignment.status.replaceAll('_', ' ')}
                    </Badge>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    {assignment.status === 'completed'
                      ? 'This quest is complete on your ledger.'
                      : assignment.status === 'submitted' || assignment.status === 'pending_admin_review'
                        ? 'Your delivery is in review.'
                        : assignment.status === 'needs_rework'
                          ? 'Your submission needs revision. Check reviewer feedback and resubmit.'
                          : assignment.status === 'assigned'
                            ? 'Application received — waiting for the company to accept you. You can start work but submit only after acceptance.'
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

                        if (!response.ok && response.status === 401) {
                          toast.error('Session expired — please log in again');
                          router.push('/login');
                          return;
                        }

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
                      This quest is currently {quest.status.replaceAll('_', ' ')}.
                    </p>
                  </div>
                </div>
              </GuildPanel>
            </GuildCard>
          )}

          {showPartyPanel && session?.user?.id ? (
            <PartyPanel
              questId={quest.id}
              party={quest.party ?? null}
              maxParticipants={quest.maxParticipants ?? 1}
              isAssigned={isAssigned}
              currentUserId={session.user.id}
              onPartyCreated={(party) =>
                setQuest((previous) => (previous ? { ...previous, party } : previous))
              }
              onMemberAdded={() => {
                // Reserved for parent-side reactions to membership changes.
              }}
            />
          ) : null}

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

              {quest && (
                <StreakMultiplierNotice streak={currentStreak} xpReward={quest.xpReward} />
              )}

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
                    setAssignment((previous) =>
                      previous ? { ...previous, status: 'submitted' } : previous
                    );
                    setSubmissionContent('');
                    setSubmissionNotes('');
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
