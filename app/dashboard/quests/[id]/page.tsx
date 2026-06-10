'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PartyPanel, type Party } from '@/components/quest/PartyPanel';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import { StreakMultiplierNotice } from '@/components/ui/streak-badge';
import { RankBadge } from '@/components/ui/rank-badge';
import type { Rank } from '@/components/ui/rank-badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

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
  company?: { name: string; email?: string };
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
    case 'assigned': return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'started': case 'in_progress': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'submitted': case 'pending_admin_review': return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'needs_rework': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

function questStatusClass(status: string) {
  switch (status) {
    case 'available': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'in_progress': return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'review': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'completed': return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

// Prose markdown renderer with tight styling
function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        h1: ({ children }: { children?: React.ReactNode }) => <h1 className="text-lg font-bold text-slate-900 mt-5 mb-2 first:mt-0">{children}</h1>,
        h2: ({ children }: { children?: React.ReactNode }) => <h2 className="text-base font-semibold text-slate-900 mt-4 mb-1.5 first:mt-0">{children}</h2>,
        h3: ({ children }: { children?: React.ReactNode }) => <h3 className="text-sm font-semibold text-slate-800 mt-3 mb-1 first:mt-0">{children}</h3>,
        h4: ({ children }: { children?: React.ReactNode }) => <h4 className="text-sm font-medium text-slate-700 mt-2 mb-0.5">{children}</h4>,
        p: ({ children }: { children?: React.ReactNode }) => <p className="text-sm leading-6 text-slate-600 mb-2 last:mb-0">{children}</p>,
        ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc pl-5 mb-2 space-y-0.5 text-sm text-slate-600">{children}</ul>,
        ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal pl-5 mb-2 space-y-0.5 text-sm text-slate-600">{children}</ol>,
        li: ({ children }: { children?: React.ReactNode }) => <li className="leading-6">{children}</li>,
        a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 underline underline-offset-2 hover:text-orange-700 break-all transition-colors"
          >
            {children}
          </a>
        ),
        code: ({ className, children, ...props }: { className?: string; children?: React.ReactNode }) => {
          const isBlock = className?.includes('language-');
          if (isBlock) {
            return (
              <code className={`${className} text-[12px]`} {...props}>
                {children}
              </code>
            );
          }
          return (
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[12px] font-mono text-slate-800 border border-slate-200">
              {children}
            </code>
          );
        },
        pre: ({ children }: { children?: React.ReactNode }) => (
          <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-[12px] mb-3 font-mono">
            {children}
          </pre>
        ),
        blockquote: ({ children }: { children?: React.ReactNode }) => (
          <blockquote className="border-l-2 border-orange-300 pl-3 my-2 text-sm text-slate-500 italic">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-4 border-slate-200" />,
        strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-semibold text-slate-800">{children}</strong>,
        em: ({ children }: { children?: React.ReactNode }) => <em className="italic text-slate-600">{children}</em>,
        img: ({ src, alt }: { src?: string; alt?: string }) => (
          <img
            src={src}
            alt={alt ?? ''}
            className="max-w-full rounded-lg border border-slate-200 shadow-sm my-3"
          />
        ),
        table: ({ children }: { children?: React.ReactNode }) => (
          <div className="overflow-x-auto my-3">
            <table className="min-w-full text-xs border border-slate-200 rounded-lg overflow-hidden">{children}</table>
          </div>
        ),
        thead: ({ children }: { children?: React.ReactNode }) => <thead className="bg-slate-50 text-slate-700 font-semibold">{children}</thead>,
        tbody: ({ children }: { children?: React.ReactNode }) => <tbody className="divide-y divide-slate-100">{children}</tbody>,
        tr: ({ children }: { children?: React.ReactNode }) => <tr>{children}</tr>,
        th: ({ children }: { children?: React.ReactNode }) => <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">{children}</th>,
        td: ({ children }: { children?: React.ReactNode }) => <td className="px-3 py-2 text-slate-600">{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

const rankToTier: Record<string, string> = {
  F: 'Tier 1', E: 'Tier 2', D: 'Tier 3', C: 'Tier 4', B: 'Tier 5', A: 'Tier 6', S: 'Tier 7',
};

export default function QuestDetailPage() {
  const params = useParams<{ id: string }>();
  const questId = params?.id;
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const utmSource = searchParams.get('utm_source');

  const [quest, setQuest] = useState<Quest | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [shareCount, setShareCount] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated' && session?.user?.role === 'company') { router.push('/dashboard/company'); return; }

    const fetchData = async () => {
      try {
        setLoading(true); setError(null);
        const userId = session?.user?.id;

        // Fire all three in parallel — prevents 9s sequential waterfall on Neon cold-start
        const [questResult, assignmentResult, profileResult] = await Promise.allSettled([
          fetchWithAuth(`/api/quests/${questId}`).then((r) => r.json()),
          userId
            ? fetchWithAuth(`/api/quests/assignments?userId=${userId}&questId=${questId}`).then((r) => r.json())
            : Promise.resolve(null),
          userId
            ? fetchWithAuth('/api/adventurer/profile').then((r) => r.json())
            : Promise.resolve(null),
        ]);

        // Quest is required — fail fast
        if (questResult.status === 'rejected') { setError('Failed to load quest details'); return; }
        const questData = questResult.value;
        if (!questData.success) { setError(questData.error || 'Failed to fetch quest'); return; }
        const q = questData.quest ?? questData.quests?.[0] ?? null;
        if (!q) { setError('Quest details not found'); return; }
        setQuest(q);
        if (q.shareCount !== undefined) setShareCount(q.shareCount);

        // Assignment — optional, non-blocking
        if (assignmentResult.status === 'fulfilled' && assignmentResult.value) {
          const assignData = assignmentResult.value;
          const assignments = Array.isArray(assignData.assignments) ? assignData.assignments : [];
          setAssignment(assignData.success && assignments.length > 0 ? assignments[0] : null);
        }

        // Profile/streak — optional, non-blocking
        if (profileResult.status === 'fulfilled' && profileResult.value) {
          const profileData = profileResult.value;
          if (profileData.success && profileData.profile) setCurrentStreak(profileData.profile.currentStreak ?? 0);
        }
      } catch { setError('An error occurred while fetching quest details'); }
      finally { setLoading(false); }
    };

    if (status === 'authenticated' && questId) void fetchData();
  }, [questId, router, session?.user?.id, session?.user?.role, status]);

  const trackShare = useCallback(async (source: string) => {
    try {
      const res = await fetch('/api/share', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ questId, source }) });
      const data = await res.json();
      if (data.success) setShareCount(data.shareCount);
    } catch { /* ignore */ }
  }, [questId]);

  const getShareUrl = useCallback((source: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    return { url: `${baseUrl}?utm_source=${source}`, text: quest ? `${quest.title} — Guild` : 'Check out this quest on Guild' };
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
    try { await navigator.clipboard.writeText(url); toast.success('Link copied!'); trackShare('copy'); }
    catch { toast.error('Failed to copy link'); }
  }, [getShareUrl, trackShare]);

  const isAssigned = !!assignment;
  const canAssign = quest?.status === 'available' && !isAssigned;
  // 'assigned' excluded — backend rejects submissions in that state (awaiting company acceptance)
  const canSubmit = !!assignment && ['started', 'in_progress', 'needs_rework'].includes(assignment.status);
  const showPartyPanel = (quest?.maxParticipants ?? 1) > 1;

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background ds-page-grain flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
      </div>
    );
  }

  if (error || !quest) {
    return (
      <div className="min-h-screen bg-background ds-page-grain p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Quest not found'}</AlertDescription>
        </Alert>
        <Button className="mt-4" variant="outline" onClick={() => router.push('/dashboard/quests')}>
          ← Back to Quest Board
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background ds-page-grain">
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {/* Breadcrumb / back */}
            <button
              onClick={() => router.push('/dashboard/quests')}
              className="text-xs text-slate-400 hover:text-slate-700 transition-colors mb-2 flex items-center gap-1"
            >
              ← Quest Board
            </button>

            {/* Tags row */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <Badge variant="outline" className={`text-[11px] py-0 ${questStatusClass(quest.status)}`}>
                {quest.status.replace('_', ' ')}
              </Badge>
              <RankBadge rank={quest.difficulty as Rank} size="sm" />
              <Badge variant="secondary" className="text-[11px] py-0 capitalize">
                {quest.questCategory.replace(/_/g, ' ')}
              </Badge>
              {quest.questType && quest.questType !== 'commission' && (
                <Badge variant="outline" className="text-[11px] py-0 capitalize">
                  {quest.questType.replace('_', ' ')}
                </Badge>
              )}
              {utmSource && (
                <Badge variant="outline" className="text-[11px] py-0 text-slate-500">
                  via {utmSource}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-snug">{quest.title}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {quest.company?.name ?? 'Unknown Company'}
              {quest.requiredRank && (
                <> · Requires {rankToTier[quest.requiredRank] ?? `${quest.requiredRank}-Rank`}</>
              )}
              {quest.deadline && (
                <> · Due {new Date(quest.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</>
              )}
            </p>
          </div>

          {/* Share buttons */}
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={shareOnX}
              className="rounded-lg border border-border/70 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              X
            </button>
            <button
              onClick={shareOnLinkedIn}
              className="rounded-lg border border-border/70 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              LinkedIn
            </button>
            <button
              onClick={copyLink}
              className="rounded-lg border border-border/70 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Copy link
            </button>
          </div>
        </div>

        {/* ── Reward strip ── */}
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/70 bg-white/95 px-5 py-3 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">XP</p>
            <p className="text-base font-bold text-amber-600">{quest.xpReward}</p>
          </div>
          <div className="h-8 w-px bg-slate-100" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Skill Points</p>
            <p className="text-base font-bold text-slate-900">{quest.skillPointsReward} SP</p>
          </div>
          <div className="h-8 w-px bg-slate-100" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Slots</p>
            <p className="text-base font-bold text-slate-900">{quest.maxParticipants ?? 1}</p>
          </div>
          <div className="h-8 w-px bg-slate-100" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Payout</p>
            <p className={`text-base font-bold ${quest.monetaryReward ? 'text-emerald-600' : 'text-slate-400'}`}>
              {quest.monetaryReward ? `₹${Number(quest.monetaryReward).toLocaleString('en-IN')}` : 'XP only'}
            </p>
          </div>
          {shareCount > 0 && (
            <>
              <div className="h-8 w-px bg-slate-100 ml-auto" />
              <p className="text-xs text-slate-400">Shared {shareCount}×</p>
            </>
          )}
        </div>

        {/* ── Main 2-col layout ── */}
        <div className="grid gap-5 xl:grid-cols-[1fr_320px]">

          {/* Left: description content */}
          <div className="space-y-4">

            {/* Brief */}
            <div className="rounded-2xl border border-border/70 bg-white/95 shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Quest Brief</h2>
              <MarkdownContent content={quest.description} />
            </div>

            {/* Detailed requirements */}
            {quest.detailedDescription && (
              <div className="rounded-2xl border border-border/70 bg-white/95 shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5">
                <h2 className="text-sm font-semibold text-slate-900 mb-3">Detailed Requirements</h2>
                <MarkdownContent content={quest.detailedDescription} />
              </div>
            )}

            {/* Required skills */}
            {quest.requiredSkills?.length > 0 && (
              <div className="rounded-2xl border border-border/70 bg-white/95 shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5">
                <h2 className="text-sm font-semibold text-slate-900 mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-1.5">
                  {quest.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Submission form */}
            {canSubmit && (
              <div className="rounded-2xl border border-border/70 bg-white/95 shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5 space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Submit Delivery</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Share your repo, deployment, or implementation notes for review.</p>
                </div>
                {quest && <StreakMultiplierNotice streak={currentStreak} xpReward={quest.xpReward} />}
                <div className="space-y-1.5">
                  <Label htmlFor="submissionContent" className="text-xs">Submission Content</Label>
                  <Textarea
                    id="submissionContent"
                    placeholder="Link to your work, repository, or delivery notes..."
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    rows={5}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="submissionNotes" className="text-xs">Additional Notes</Label>
                  <Textarea
                    id="submissionNotes"
                    placeholder="Anything the reviewer should know..."
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                    rows={2}
                    className="text-sm"
                  />
                </div>
                <Button
                  className="w-full"
                  disabled={isSubmitting || !submissionContent.trim()}
                  onClick={async () => {
                    if (!assignment?.id) { router.push('/login'); return; }
                    setIsSubmitting(true);
                    try {
                      const res = await fetchWithAuth('/api/quests/submissions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ assignmentId: assignment.id, submissionContent, submissionNotes }),
                      });
                      const data = await res.json();
                      if (!data.success) { toast.error(data.error || 'Failed to submit quest'); return; }
                      toast.success('Submission successful!');
                      setAssignment((prev) => prev ? { ...prev, status: 'submitted' } : prev);
                      setSubmissionContent(''); setSubmissionNotes('');
                    } catch { toast.error('An error occurred while submitting quest'); }
                    finally { setIsSubmitting(false); }
                  }}
                >
                  {isSubmitting ? 'Submitting…' : 'Submit Quest'}
                </Button>
              </div>
            )}
          </div>

          {/* Right: sidebar */}
          <div className="space-y-4">

            {/* Accept / Assignment status */}
            {isAssigned && assignment ? (
              <div className="rounded-2xl border border-border/70 bg-white/95 shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-slate-900">Your Assignment</h2>
                  <Badge variant="outline" className={`text-[10px] py-0 ${assignmentStatusClass(assignment.status)}`}>
                    {assignment.status.replaceAll('_', ' ')}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Assigned {new Date(assignment.assignedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-xs text-slate-600">
                  {assignment.status === 'completed'
                    ? 'Quest complete on your ledger.'
                    : assignment.status === 'submitted' || assignment.status === 'pending_admin_review'
                      ? 'Delivery is in review.'
                      : assignment.status === 'needs_rework'
                        ? 'Submission needs revision — resubmit below.'
                        : 'You are responsible for this quest. Keep momentum.'}
                </div>
                {assignment.status === 'completed' && (
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                    <CheckCircle className="h-3.5 w-3.5" /> Completed successfully
                  </div>
                )}
              </div>
            ) : canAssign ? (
              <div className="rounded-2xl border border-border/70 bg-white/95 shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5 space-y-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Accept This Quest</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Claim the brief and move it into your active pipeline.</p>
                </div>
                <Button
                  className="w-full"
                  disabled={!!(quest.maxParticipants && quest.maxParticipants <= 0)}
                  onClick={async () => {
                    try {
                      const res = await fetchWithAuth('/api/quests/assignments', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ questId }),
                      });
                      if (!res.ok && res.status === 401) { toast.error('Session expired — please log in again'); router.push('/login'); return; }
                      const data = await res.json();
                      if (!data.success) { toast.error(data.error || 'Failed to assign to quest'); return; }
                      setAssignment(data.assignment);
                      toast.success('Successfully assigned to quest!');
                    } catch { toast.error('An error occurred while assigning to quest'); }
                  }}
                >
                  Claim Quest
                </Button>
              </div>
            ) : (
              <div className="rounded-2xl border border-border/70 bg-white/95 shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5">
                <h2 className="text-sm font-semibold text-slate-900">Quest unavailable</h2>
                <p className="mt-1 text-xs text-slate-500">
                  This quest is currently {quest.status.replaceAll('_', ' ')}.
                </p>
              </div>
            )}

            {/* Mission snapshot */}
            <div className="rounded-2xl border border-border/70 bg-white/95 shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">Details</h2>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Deadline</span>
                  <span className="font-medium text-slate-800">
                    {quest.deadline
                      ? new Date(quest.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : 'None'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Rank required</span>
                  <span className="font-medium text-slate-800">
                    {quest.requiredRank ? (rankToTier[quest.requiredRank] ?? `${quest.requiredRank}-Rank`) + ' or above' : 'Open'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Slots</span>
                  <span className="font-medium text-slate-800">{quest.maxParticipants ?? 1}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Category</span>
                  <span className="font-medium text-slate-800 capitalize">{quest.questCategory.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Posted by</span>
                  <span className="font-medium text-slate-800 truncate max-w-[140px]">{quest.company?.name ?? '—'}</span>
                </div>
              </div>
            </div>

            {/* Party panel */}
            {showPartyPanel && session?.user?.id ? (
              <PartyPanel
                questId={quest.id}
                party={quest.party ?? null}
                maxParticipants={quest.maxParticipants ?? 1}
                isAssigned={isAssigned}
                currentUserId={session.user.id}
                onPartyCreated={(party) => setQuest((prev) => prev ? { ...prev, party } : prev)}
                onMemberAdded={() => {}}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
