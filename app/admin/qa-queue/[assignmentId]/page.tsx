'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, CheckCircle, Loader2, Shield, XCircle } from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FieldDisplay } from '@/components/quest/field-display';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import {
  asFieldDefs,
  asFieldValues,
  type CriteriaResult,
} from '@/lib/quest-field-templates';

type QueueAssignment = {
  id: string;
  status: string;
  assignedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  progress: string | number;
  quest: {
    id: string;
    title: string;
    track: string;
    difficulty: string;
    xpReward: number;
    monetaryReward: string | null;
    detailedDescription: string | null;
    acceptanceCriteria: string[];
    briefData: unknown;
    fieldTemplate: { briefFields: unknown; submissionFields: unknown } | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
    rank: string;
    bootcampLink: { cohort: string | null; bootcampTrack: string; bootcampWeek: number } | null;
  };
  submissions: Array<{
    id: string;
    submissionContent: string;
    submissionNotes: string | null;
    submissionData: unknown;
    submittedAt: string;
    reviewNotes: unknown;
    criteriaResults: unknown;
  }>;
};

const TRACK_COLORS: Record<string, string> = {
  BOOTCAMP: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  INTERN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  OPEN: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

function parseReviewNotes(value: unknown) {
  if (!value) return [];
  if (Array.isArray(value)) return value as Array<{ id: string; author: string; timestamp: string; note: string }>;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default function QAQueueDetailPage() {
  const params = useParams<{ assignmentId: string }>();
  const assignmentId = params?.assignmentId;
  const { data: session, status } = useSession();
  const router = useRouter();

  const [assignment, setAssignment] = useState<QueueAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [criteriaState, setCriteriaState] = useState<boolean[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [router, session, status]);

  useEffect(() => {
    if (!assignmentId || status !== 'authenticated' || session?.user?.role !== 'admin') return;

    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithAuth(`/api/admin/qa-queue/${assignmentId}`);
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.error || 'Failed to load QA item');
        }

        const nextAssignment = payload.assignment as QueueAssignment;
        setAssignment(nextAssignment);

        const submission = nextAssignment.submissions[0];
        if (
          submission?.criteriaResults &&
          Array.isArray(submission.criteriaResults)
        ) {
          const initialState = (submission.criteriaResults as CriteriaResult[]).map(
            (result) => result.met === true
          );
          setCriteriaState(initialState);
        } else {
          setCriteriaState(
            (nextAssignment.quest.acceptanceCriteria ?? []).map(() => false)
          );
        }
      } catch (nextError) {
        console.error(nextError);
        setError(nextError instanceof Error ? nextError.message : 'Failed to load QA item');
      } finally {
        setLoading(false);
      }
    })();
  }, [assignmentId, session?.user?.role, status]);

  const latestSubmission = assignment?.submissions[0] ?? null;
  const reviewNotes = useMemo(
    () => parseReviewNotes(latestSubmission?.reviewNotes),
    [latestSubmission?.reviewNotes]
  );

  const criteriaResults = useMemo<CriteriaResult[]>(
    () =>
      (assignment?.quest.acceptanceCriteria ?? []).map((criterion, index) => ({
        criterion,
        met: criteriaState[index] === true,
      })),
    [assignment?.quest.acceptanceCriteria, criteriaState]
  );

  const toggleCriterion = (index: number) =>
    setCriteriaState((current) => {
      const next = [...current];
      next[index] = !next[index];
      return next;
    });

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!assignment) return;
    if (action === 'reject' && !rejectNotes.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetchWithAuth(`/api/admin/qa-queue/${assignment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notes: action === 'reject' ? rejectNotes.trim() : undefined,
          criteriaResults,
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Failed to update QA item');
      }

      router.push('/admin/qa-queue');
    } catch (nextError) {
      console.error(nextError);
      setError(nextError instanceof Error ? nextError.message : 'Failed to update QA item');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    );
  }

  if (status !== 'authenticated' || session?.user?.role !== 'admin') {
    return null;
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
        <div className="mx-auto max-w-4xl">
          <Link href="/admin/qa-queue" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200">
            <ArrowLeft className="h-4 w-4" />
            Back to QA queue
          </Link>
          <Card className="mt-6 border-slate-800 bg-slate-900">
            <CardContent className="p-6 text-sm text-red-300">
              {error || 'QA item not found.'}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/qa-queue" className="text-slate-400 transition-colors hover:text-slate-200">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Shield className="h-6 w-6 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-slate-100">QA Review Detail</h1>
            <p className="text-sm text-slate-400">Review submission quality before it reaches the client.</p>
          </div>
        </div>

        {error && (
          <Card className="border-red-800 bg-red-950/20">
            <CardContent className="p-4 text-sm text-red-300">{error}</CardContent>
          </Card>
        )}

        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`border text-xs ${TRACK_COLORS[assignment.quest.track] ?? ''}`}>
                {assignment.quest.track}
              </Badge>
              <Badge variant="outline" className="border-slate-700 text-slate-300">
                {assignment.quest.difficulty}-rank
              </Badge>
              <Badge variant="outline" className="border-slate-700 text-slate-300">
                {assignment.status}
              </Badge>
            </div>
            <CardTitle className="text-xl text-slate-100">{assignment.quest.title}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Student</p>
              <p className="mt-2 font-medium text-slate-100">{assignment.user.name}</p>
              <p className="text-sm text-slate-400">{assignment.user.email}</p>
              <p className="mt-2 text-sm text-slate-300">{assignment.user.rank}-Rank</p>
              {assignment.user.bootcampLink && (
                <p className="mt-1 text-xs text-slate-500">
                  {assignment.user.bootcampLink.bootcampTrack} · Week {assignment.user.bootcampLink.bootcampWeek}
                </p>
              )}
            </div>
            <div className="rounded-lg bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Reward</p>
              <p className="mt-2 font-medium text-slate-100">{assignment.quest.xpReward} XP</p>
              <p className="text-sm text-slate-400">
                {assignment.quest.monetaryReward ? `${assignment.quest.monetaryReward} payout` : 'No cash payout'}
              </p>
            </div>
            <div className="rounded-lg bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Submitted</p>
              <p className="mt-2 font-medium text-slate-100">
                {latestSubmission
                  ? formatDistanceToNow(new Date(latestSubmission.submittedAt), { addSuffix: true })
                  : 'No submission'}
              </p>
              <p className="text-sm text-slate-400">Progress: {String(assignment.progress)}</p>
            </div>
          </CardContent>
        </Card>

        {(assignment.quest.detailedDescription ||
          asFieldDefs(assignment.quest.fieldTemplate?.briefFields).length > 0) && (
          <Card className="border-slate-800 bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base text-slate-100">Quest Brief</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              {assignment.quest.detailedDescription && (
                <p className="whitespace-pre-wrap">{assignment.quest.detailedDescription}</p>
              )}
              <div className="[&_a]:text-orange-400 [&_dd]:text-slate-200 [&_dl]:divide-slate-800 [&_dt]:text-slate-400">
                <FieldDisplay
                  fields={asFieldDefs(assignment.quest.fieldTemplate?.briefFields)}
                  values={asFieldValues(assignment.quest.briefData)}
                  hideEmpty
                />
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <CardTitle className="text-base text-slate-100">Submission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestSubmission ? (
              <>
                {asFieldDefs(assignment.quest.fieldTemplate?.submissionFields).length > 0 &&
                latestSubmission.submissionData ? (
                  <div className="[&_a]:text-orange-400 [&_dd]:text-slate-200 [&_dl]:divide-slate-800 [&_dt]:text-slate-400">
                    <FieldDisplay
                      fields={asFieldDefs(assignment.quest.fieldTemplate?.submissionFields)}
                      values={asFieldValues(latestSubmission.submissionData)}
                      hideEmpty
                    />
                  </div>
                ) : (
                  <p className="rounded-lg bg-slate-950/70 p-4 whitespace-pre-wrap text-sm text-slate-300">
                    {latestSubmission.submissionContent}
                  </p>
                )}
                {latestSubmission.submissionNotes && (
                  <p className="rounded-lg bg-slate-950/50 p-3 text-sm text-slate-400">
                    <span className="font-medium text-slate-300">Notes: </span>
                    {latestSubmission.submissionNotes}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-400">No submission found.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <CardTitle className="text-base text-slate-100">Acceptance Criteria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(assignment.quest.acceptanceCriteria ?? []).length === 0 ? (
              <p className="text-sm text-slate-400">No acceptance criteria configured for this quest.</p>
            ) : (
              assignment.quest.acceptanceCriteria.map((criterion, index) => (
                <label key={criterion + index} className="flex items-start gap-3 rounded-lg bg-slate-950/60 p-3 text-sm text-slate-300">
                  <Checkbox
                    checked={criteriaState[index] === true}
                    onCheckedChange={() => toggleCriterion(index)}
                    className="mt-0.5 border-slate-600"
                  />
                  <span>{criterion}</span>
                </label>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <CardTitle className="text-base text-slate-100">Revision Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviewNotes.length === 0 ? (
              <p className="text-sm text-slate-400">No prior QA notes recorded.</p>
            ) : (
              reviewNotes.map((note) => (
                <div key={note.id} className="rounded-lg bg-slate-950/60 p-3">
                  <div className="text-sm font-medium text-slate-200">{note.author}</div>
                  <div className="text-xs text-slate-500">{new Date(note.timestamp).toLocaleString()}</div>
                  <p className="mt-2 text-sm text-slate-300 whitespace-pre-wrap">{note.note}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <CardTitle className="text-base text-slate-100">Decision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={rejectNotes}
              onChange={(event) => setRejectNotes(event.target.value)}
              className="min-h-[120px] border-slate-700 bg-slate-950 text-slate-200 placeholder:text-slate-600"
              placeholder="Required if you reject. Explain exactly what the student needs to fix."
            />
            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-emerald-600 text-white hover:bg-emerald-500"
                disabled={submitting}
                onClick={() => void handleAction('approve')}
              >
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                Approve and forward to client
              </Button>
              <Button
                variant="outline"
                className="border-red-800 text-red-400 hover:bg-red-950/40"
                disabled={submitting || !rejectNotes.trim()}
                onClick={() => void handleAction('reject')}
              >
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                Reject and return to student
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
