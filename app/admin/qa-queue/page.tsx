'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Shield, Clock, CheckCircle, XCircle, Loader2, ArrowLeft, ExternalLink, DollarSign, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

interface QueueItem {
  id: string;
  userId: string;
  status: string;
  updatedAt: string;
  hasTransaction: boolean;
  transactionStatus: string | null;
  quest: {
    id: string;
    title: string;
    track: string;
    difficulty: string;
    xpReward: number;
    monetaryReward: string | null;
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
    submittedAt: string;
    reviewNotes: unknown;
  }>;
}

const TRACK_COLORS: Record<string, string> = {
  BOOTCAMP: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  INTERN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  OPEN: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending_admin_review: { label: 'Pending Review', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  completed: { label: 'Completed', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

export default function QAQueuePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<QueueItem | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<QueueItem | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    const res = await fetchWithAuth('/api/admin/qa-queue?include=completed');
    const data = await res.json();
    setItems(data.assignments ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && session?.user?.role !== 'admin') router.push('/dashboard');
  }, [status, session, router]);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const handleApprove = async (assignmentId: string) => {
    setSubmitting(true);
    await fetchWithAuth(`/api/admin/qa-queue/${assignmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' }),
    });
    setSubmitting(false);
    fetchQueue();
  };

  const handleReject = async () => {
    if (!rejectTarget || !rejectNotes.trim()) return;
    setSubmitting(true);
    await fetchWithAuth(`/api/admin/qa-queue/${rejectTarget.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject', notes: rejectNotes.trim() }),
    });
    setSubmitting(false);
    setRejectTarget(null);
    setRejectNotes('');
    fetchQueue();
  };

  const handleInitiatePayment = async () => {
    if (!paymentTarget) return;
    setPaymentLoading(true);
    setPaymentResult(null);

    const rewardAmount = Number(paymentTarget.quest.monetaryReward);
    const payoutAmount = Math.round(rewardAmount * 0.85 * 100) / 100;

    try {
      const res = await fetchWithAuth('/api/payments/razorpay/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questId: paymentTarget.quest.id,
          userId: paymentTarget.user.id,
          amount: payoutAmount,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setPaymentResult({ success: true, message: `Payment of $${payoutAmount.toFixed(2)} initiated successfully.` });
        fetchQueue();
      } else {
        setPaymentResult({ success: false, message: data.error || 'Transfer failed.' });
      }
    } catch {
      setPaymentResult({ success: false, message: 'Network error. Please try again.' });
    }

    setPaymentLoading(false);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  const pendingItems = items.filter((i) => i.status === 'pending_admin_review');
  const completedItems = items.filter((i) => i.status === 'completed');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin" className="text-slate-400 hover:text-slate-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Shield className="w-6 h-6 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-slate-100">QA Queue</h1>
            <p className="text-slate-400 text-sm">
              {pendingItems.length} submission{pendingItems.length !== 1 ? 's' : ''} pending review
              {completedItems.length > 0 && ` · ${completedItems.length} completed`}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800 text-center py-16">
            <CardContent>
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">Queue is clear</p>
              <p className="text-slate-500 text-sm mt-1">All submissions have been reviewed.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Pending review section */}
            {pendingItems.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Pending Review</h2>
                <div className="space-y-4">
                  {pendingItems.map((item) => (
                    <QueueItemCard
                      key={item.id}
                      item={item}
                      submitting={submitting}
                      onApprove={handleApprove}
                      onReject={setRejectTarget}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed / payments section */}
            {completedItems.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Completed — Payments</h2>
                <div className="space-y-4">
                  {completedItems.map((item) => (
                    <QueueItemCard
                      key={item.id}
                      item={item}
                      submitting={submitting}
                      onInitiatePayment={setPaymentTarget}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reject modal */}
      <Dialog open={!!rejectTarget} onOpenChange={(o) => { if (!o) { setRejectTarget(null); setRejectNotes(''); } }}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              Reject Submission
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-slate-400">
              Rejection notes are required and will be shown to the student. Be specific about what needs to be fixed.
            </p>
            <Textarea
              placeholder="e.g. The PR is missing a description. The CSS changes break on mobile at 375px."
              className="bg-slate-950 border-slate-700 text-slate-200 placeholder:text-slate-600 min-h-[100px]"
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" className="text-slate-400" onClick={() => { setRejectTarget(null); setRejectNotes(''); }}>
              Cancel
            </Button>
            <Button
              className="bg-red-700 hover:bg-red-600 text-white"
              onClick={handleReject}
              disabled={!rejectNotes.trim() || submitting}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Back to Student'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment confirmation modal */}
      <Dialog
        open={!!paymentTarget || !!paymentResult}
        onOpenChange={(o) => {
          if (!o) { setPaymentTarget(null); setPaymentResult(null); }
        }}
      >
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          {paymentResult ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {paymentResult.success ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  {paymentResult.success ? 'Payment Initiated' : 'Payment Failed'}
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  {paymentResult.message}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  className={paymentResult.success ? 'bg-emerald-700 hover:bg-emerald-600' : 'bg-red-700 hover:bg-red-600'}
                  onClick={() => { setPaymentTarget(null); setPaymentResult(null); }}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          ) : paymentTarget ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-orange-400" />
                  Initiate Payment
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Adventurer</span>
                    <span className="text-slate-200 font-medium">{paymentTarget.user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quest</span>
                    <span className="text-slate-200 font-medium">{paymentTarget.quest.title}</span>
                  </div>
                  <div className="h-px bg-slate-800" />
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total reward</span>
                    <span className="text-slate-200">${Number(paymentTarget.quest.monetaryReward).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Platform fee (15%)</span>
                    <span className="text-slate-400">-${(Number(paymentTarget.quest.monetaryReward) * 0.15).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-orange-400">Payout amount</span>
                    <span className="text-orange-400">
                      ${(Math.round(Number(paymentTarget.quest.monetaryReward) * 0.85 * 100) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  This will initiate a Razorpay bank transfer to the adventurer. The platform fee will be retained.
                </p>
              </div>
              <DialogFooter>
                <Button variant="ghost" className="text-slate-400" onClick={() => { setPaymentTarget(null); }}>
                  Cancel
                </Button>
                <Button
                  className="bg-orange-600 hover:bg-orange-500 text-white"
                  onClick={handleInitiatePayment}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Initiate Transfer'}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QueueItemCard({
  item,
  submitting,
  onApprove,
  onReject,
  onInitiatePayment,
}: {
  item: QueueItem;
  submitting: boolean;
  onApprove?: (id: string) => void;
  onReject?: (item: QueueItem) => void;
  onInitiatePayment?: (item: QueueItem) => void;
}) {
  const submission = item.submissions[0];
  const isCompleted = item.status === 'completed';
  const rewardAmount = item.quest.monetaryReward ? Number(item.quest.monetaryReward) : 0;
  const canInitiatePayment = isCompleted && rewardAmount > 0 && !item.hasTransaction;

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge className={`text-xs border ${TRACK_COLORS[item.quest.track] ?? ''}`}>
                {item.quest.track}
              </Badge>
              <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                {item.quest.difficulty}-rank
              </Badge>
              {isCompleted && (
                <Badge className={`text-xs border ${STATUS_BADGE.completed.className}`}>
                  {STATUS_BADGE.completed.label}
                </Badge>
              )}
            </div>
            <CardTitle className="text-base text-slate-100 truncate">
              {item.quest.title}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1 text-slate-500 text-xs whitespace-nowrap">
            <Clock className="w-3.5 h-3.5" />
            {submission ? formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true }) : '—'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Student info */}
        <div className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">
            {item.user.rank}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200">{item.user.name}</p>
            <p className="text-xs text-slate-500">
              {item.user.bootcampLink
                ? `Bootcamp · ${item.user.bootcampLink.bootcampTrack} · Week ${item.user.bootcampLink.bootcampWeek}`
                : item.user.email}
            </p>
          </div>
          {rewardAmount > 0 && (
            <Badge variant="outline" className="border-emerald-700 text-emerald-400">
              ${rewardAmount.toFixed(2)}
            </Badge>
          )}
        </div>

        {/* Submission content */}
        {submission && !isCompleted && (
          <div>
            <p className="text-xs text-slate-500 mb-1.5 uppercase tracking-wide font-medium">Submission</p>
            <p className="text-sm text-slate-300 bg-slate-950/60 rounded-lg p-3 whitespace-pre-wrap line-clamp-4">
              {submission.submissionContent}
            </p>
            {submission.submissionContent.startsWith('http') && (
              <a
                href={submission.submissionContent}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 mt-1"
              >
                <ExternalLink className="w-3 h-3" />
                Open link
              </a>
            )}
            {submission.submissionNotes && (
              <p className="text-xs text-slate-500 mt-2 bg-slate-950/40 rounded p-2">
                <span className="text-slate-400 font-medium">Notes: </span>
                {submission.submissionNotes}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {!isCompleted && onApprove && (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
              onClick={() => onApprove(item.id)}
              disabled={submitting}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Approve — Forward to Client
            </Button>
          )}
          {!isCompleted && onReject && (
            <Button
              size="sm"
              variant="outline"
              className="border-red-800 text-red-400 hover:bg-red-950/40 gap-1.5"
              onClick={() => onReject(item)}
              disabled={submitting}
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject — Return to Student
            </Button>
          )}
          {canInitiatePayment && onInitiatePayment && (
            <Button
              size="sm"
              className="bg-orange-600 hover:bg-orange-500 text-white gap-1.5"
              onClick={() => onInitiatePayment(item)}
            >
              <DollarSign className="w-3.5 h-3.5" />
              Initiate Payment
            </Button>
          )}
          {isCompleted && item.hasTransaction && (
            <Badge variant="outline" className="border-slate-700 text-slate-500">
              Payment {item.transactionStatus ?? 'recorded'}
            </Badge>
          )}
          <Link href={`/admin/qa-queue/${item.id}`} className="ml-auto">
            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-200 text-xs">
              Full View
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
