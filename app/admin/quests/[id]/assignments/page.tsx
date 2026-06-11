'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, UserPlus, ExternalLink, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useApiFetch } from '@/lib/hooks';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import { toast } from 'sonner';
import { RANK_TO_TIER } from '@/lib/ranks';
import { RANK_COLORS } from '@/lib/quest-constants';

type Assignment = {
  id: string;
  status: string;
  assignedAt: string;
  completedAt?: string;
  user: { id: string; name: string; email: string; rank: string; xp: number };
  submissions: { id: string; submittedAt: string; reviewNotes?: string }[];
};

type QuestInfo = {
  id: string;
  title: string;
  status: string;
  maxParticipants?: number;
};

type ApiResponse = {
  quest: QuestInfo;
  assignments: Assignment[];
  total: number;
  success: boolean;
};

const STATUS_STYLES: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  assigned:             { label: 'Assigned',       icon: <Clock className="h-3 w-3" />,        className: 'bg-sky-50 text-sky-700 border-sky-200' },
  started:              { label: 'Started',         icon: <Clock className="h-3 w-3" />,        className: 'bg-amber-50 text-amber-700 border-amber-200' },
  in_progress:          { label: 'In Progress',     icon: <Clock className="h-3 w-3" />,        className: 'bg-amber-50 text-amber-700 border-amber-200' },
  submitted:            { label: 'Submitted',       icon: <AlertCircle className="h-3 w-3" />,  className: 'bg-violet-50 text-violet-700 border-violet-200' },
  pending_admin_review: { label: 'Pending Review',  icon: <AlertCircle className="h-3 w-3" />,  className: 'bg-violet-50 text-violet-700 border-violet-200' },
  needs_rework:         { label: 'Needs Rework',    icon: <AlertCircle className="h-3 w-3" />,  className: 'bg-orange-50 text-orange-700 border-orange-200' },
  completed:            { label: 'Completed',       icon: <CheckCircle className="h-3 w-3" />,  className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled:            { label: 'Cancelled',       icon: <XCircle className="h-3 w-3" />,      className: 'bg-rose-50 text-rose-700 border-rose-200' },
  review:               { label: 'In Review',       icon: <AlertCircle className="h-3 w-3" />,  className: 'bg-violet-50 text-violet-700 border-violet-200' },
};

export default function QuestAssignmentsPage() {
  const params = useParams<{ id: string }>();
  const questId = params?.id;
  const router = useRouter();

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [userIdInput, setUserIdInput] = useState('');
  const [assigning, setAssigning] = useState(false);

  const { data, loading, error, refetch } = useApiFetch<ApiResponse>(
    `/api/admin/quests/${questId}/assignments`,
    { skip: !questId }
  );

  const quest = data?.quest;
  const assignments = data?.assignments ?? [];

  async function handleAssign() {
    if (!userIdInput.trim()) return;
    setAssigning(true);
    try {
      const res = await fetchWithAuth(`/api/admin/quests/${questId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userIdInput.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to assign');
        return;
      }
      toast.success('Adventurer assigned successfully');
      setAssignDialogOpen(false);
      setUserIdInput('');
      refetch?.();
    } catch {
      toast.error('Network error');
    } finally {
      setAssigning(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
      </div>
    );
  }

  if (error || !quest) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-sm text-red-500">Failed to load assignments.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-slate-500" asChild>
            <Link href="/admin/quests">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              All quests
            </Link>
          </Button>
          <h1 className="text-xl font-bold text-slate-900">{quest.title}</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
            {quest.maxParticipants ? ` · ${quest.maxParticipants} max slots` : ''}
          </p>
        </div>
        <Button
          size="sm"
          className="shrink-0"
          onClick={() => setAssignDialogOpen(true)}
          disabled={quest.status === 'cancelled' || quest.status === 'completed'}
        >
          <UserPlus className="mr-1.5 h-3.5 w-3.5" />
          Assign adventurer
        </Button>
      </div>

      {/* Assignment list */}
      {assignments.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
          <p className="text-sm text-slate-500">No assignments yet.</p>
          <Button size="sm" className="mt-4" onClick={() => setAssignDialogOpen(true)}>
            Assign first adventurer
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/70 bg-white overflow-hidden shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
          <div className="divide-y divide-slate-100">
            {assignments.map((a) => {
              const statusInfo = STATUS_STYLES[a.status] ?? { label: a.status, icon: null, className: 'bg-slate-50 text-slate-600 border-slate-200' };
              const latestSubmission = a.submissions[0];

              return (
                <div key={a.id} className="flex items-center gap-4 px-5 py-4">
                  {/* Avatar */}
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-xs font-semibold bg-slate-100 text-slate-600">
                      {a.user.name?.charAt(0) ?? '?'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Name + meta */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-900">{a.user.name}</p>
                      <Badge variant="outline" className={`text-[10px] py-0 ${RANK_COLORS[a.user.rank] ?? ''}`}>
                        {RANK_TO_TIER[a.user.rank] ?? a.user.rank}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{a.user.email}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Assigned {new Date(a.assignedAt).toLocaleDateString()}
                      {latestSubmission && (
                        <> · Submitted {new Date(latestSubmission.submittedAt).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>

                  {/* Status + actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className={`flex items-center gap-1 text-[11px] ${statusInfo.className}`}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </Badge>

                    {(a.status === 'submitted' || a.status === 'pending_admin_review') && (
                      <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                        <Link href={`/admin/qa-queue/${a.id}`}>
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Review
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Assign dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign adventurer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-slate-500">
              Admin override — skips rank gating and slot limits. Paste the adventurer&apos;s user ID from the Users page.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="userId" className="text-sm">User ID</Label>
              <Input
                id="userId"
                placeholder="e.g. clxxxxxxxxxxxxxx"
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAssign()}
              />
            </div>
            <p className="text-xs text-slate-400">
              Find user IDs at{' '}
              <Link href="/admin/users" className="underline">
                /admin/users
              </Link>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={assigning || !userIdInput.trim()}>
              {assigning ? 'Assigning…' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
