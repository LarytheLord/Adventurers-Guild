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
import { Shield, Clock, CheckCircle, XCircle, Loader2, ArrowLeft, ExternalLink, DollarSign, Ban } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

interface QueueItem {
  id: string;
  status: string;
  completedAt?: string;
  updatedAt: string;
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

interface PaymentTarget {
  assignmentId: string;
  questId: string;
  userId: string;
  userName: string;
  questTitle: string;
  rewardAmount: number;
  payoutAmount: number;
}

const TRACK_COLORS: Record<string, string> = {
  BOOTCAMP: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  INTERN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  OPEN: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

type Tab = 'pending_review' | 'ready_for_payment';

export default function QAQueuePage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('pending_review');
  const [items, setItems] = useState<QueueItem[]>([]);
  const [paymentMap, setPaymentMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<QueueItem | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [paymentTarget, setPaymentTarget] = useState<PaymentTarget | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [paymentError, setPaymentError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authStatus === 'unauthenticated') router.push('/login');
    if (authStatus === 'authenticated' && session?.user?.role !== 'admin') router.push('/dashboard');
  }, [authStatus, session, router]);

  const statusParam = activeTab === 'pending_review' ? 'pending_admin_review' : 'completed';

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    const res = await fetchWithAuth(`/api/admin/qa-queue?status=${statusParam}`);
    const data = await res.json();
    setItems(data.assignments ?? []);
    setPaymentMap(data.paymentMap ?? {});
    setLoading(false);
  }, [statusParam]);

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

  const openPaymentModal = (item: QueueItem) => {
    const reward = Number(item.quest.monetaryReward) || 0;
    const platformFee = Math.round(reward * 0.15);
    const payout = reward - platformFee;
    setPaymentTarget({
      assignmentId: item.id,
      questId: item.quest.id,
      userId: item.user.id,
      userName: item.user.name,
      questTitle: item.quest.title,
      rewardAmount: reward,
      payoutAmount: payout,
    });
    setPaymentStatus('idle');
    setPaymentError('');
  };

  const handlePayment = async () => {
    if (!paymentTarget) return;
    setPaymentStatus('processing');
    setPaymentError('');
    try {
      const res = await fetchWithAuth('/api/payments/razorpay/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questId: paymentTarget.questId,
          userId: paymentTarget.userId,
          amount: paymentTarget.rewardAmount,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPaymentStatus('error');
        setPaymentError(data.error || 'Payment failed');
        return;
      }
      setPaymentStatus('success');
      fetchQueue();
    } catch {
      setPaymentStatus('error');
      setPaymentError('Network error — please try again');
    }
  };

  const resetPaymentModal = () => {
    setPaymentTarget(null);
    setPaymentStatus('idle');
    setPaymentError('');
  };

  const hasBeenPaid = (item: QueueItem) => {
    return paymentMap[`${item.quest.id}_${item.user.id}`] === true;
  };

  if (authStatus === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="text-slate-400 hover:text-slate-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Shield className="w-6 h-6 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-slate-100">QA Queue</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-900 rounded-lg p-1 w-fit border border-slate-800">
          <button
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === 'pending_review'
                ? 'bg-orange-500/20 text-orange-300 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setActiveTab('pending_review')}
          >
            Pending Review
          </button>
          <button
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === 'ready_for_payment'
                ? 'bg-orange-500/20 text-orange-300 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setActiveTab('ready_for_payment')}
          >
            Ready for Payment
          </button>
        </div>

        {items.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800 text-center py-16">
            <CardContent>
              {activeTab === 'pending_review' ? (
                <>
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <p className="text-slate-300 font-medium">Queue is clear</p>
                  <p className="text-slate-500 text-sm mt-1">All submissions have been reviewed.</p>
                </>
              ) : (
                <>
                  <DollarSign className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-300 font-medium">No completed quests</p>
                  <p className="text-slate-500 text-sm mt-1">Completed quests with rewards will appear here.</p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const submission = item.submissions[0];
              const reward = Number(item.quest.monetaryReward) || 0;
              const alreadyPaid = hasBeenPaid(item);
              return (
                <Card key={item.id} className="bg-slate-900 border-slate-800">
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
                          {activeTab === 'ready_for_payment' && reward > 0 && (
                            <Badge variant="outline" className="text-xs border-emerald-700 text-emerald-400">
                              ₹{reward}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-base text-slate-100 truncate">
                          {item.quest.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 text-xs whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5" />
                        {activeTab === 'ready_for_payment' && item.completedAt
                          ? formatDistanceToNow(new Date(item.completedAt), { addSuffix: true })
                          : submission
                            ? formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })
                            : '—'}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* User info */}
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
                    </div>

                    {/* Submission content (pending review tab) */}
                    {activeTab === 'pending_review' && submission && (
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

                    {/* Payment info (ready for payment tab) */}
                    {activeTab === 'ready_for_payment' && (
                      <div className="p-3 bg-slate-950/60 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Reward</p>
                            {reward > 0 ? (
                              <>
                                <p className="text-lg font-bold text-emerald-400">₹{reward.toLocaleString('en-IN')}</p>
                                <p className="text-xs text-slate-500">
                                  Payout (85%): <span className="text-slate-300 font-medium">₹{Math.round(reward * 0.85).toLocaleString('en-IN')}</span>
                                  <span className="text-slate-600"> · Fee (15%): ₹{Math.round(reward * 0.15).toLocaleString('en-IN')}</span>
                                </p>
                              </>
                            ) : (
                              <p className="text-sm text-slate-400">XP Only — no monetary reward</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      {activeTab === 'pending_review' ? (
                        <>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
                            onClick={() => handleApprove(item.id)}
                            disabled={submitting}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approve — Forward to Client
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-800 text-red-400 hover:bg-red-950/40 gap-1.5"
                            onClick={() => { setRejectTarget(item); setRejectNotes(''); }}
                            disabled={submitting}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject — Return to Student
                          </Button>
                        </>
                      ) : (
                        <>
                          {reward > 0 ? (
                            alreadyPaid ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-slate-700 text-slate-500 gap-1.5"
                                disabled
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Payment Sent
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
                                onClick={() => openPaymentModal(item)}
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                Initiate Payment
                              </Button>
                            )
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-700 text-slate-500 gap-1.5"
                              disabled
                            >
                              <Ban className="w-3.5 h-3.5" />
                              XP Only
                            </Button>
                          )}
                        </>
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
            })}
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
              placeholder="e.g. The PR is missing a description. The CSS changes break on mobile at 375px. Please test at small screen sizes before resubmitting."
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
      <Dialog open={!!paymentTarget && paymentStatus !== 'success'} onOpenChange={(o) => { if (!o) resetPaymentModal(); }}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Confirm Payment
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm">
              This will initiate a Razorpay bank transfer to the adventurer.
            </DialogDescription>
          </DialogHeader>
          {paymentTarget && (
            <div className="space-y-4 py-2">
              {paymentStatus === 'error' && (
                <div className="p-3 bg-red-950/40 border border-red-800/40 rounded-lg text-sm text-red-400">
                  {paymentError || 'Payment failed. Please try again.'}
                </div>
              )}
              <div className="space-y-3 bg-slate-950/60 rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Adventurer</span>
                  <span className="text-slate-200 font-medium">{paymentTarget.userName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Quest</span>
                  <span className="text-slate-200 font-medium text-right max-w-[60%] truncate">{paymentTarget.questTitle}</span>
                </div>
                <div className="border-t border-slate-800 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Quest reward</span>
                    <span className="text-slate-200">₹{paymentTarget.rewardAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Platform fee (15%)</span>
                    <span className="text-red-400">-₹{Math.round(paymentTarget.rewardAmount * 0.15).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-slate-800">
                    <span className="text-slate-200">Adventurer payout</span>
                    <span className="text-emerald-400">₹{paymentTarget.payoutAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" className="text-slate-400" onClick={resetPaymentModal} disabled={paymentStatus === 'processing'}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
              onClick={handlePayment}
              disabled={paymentStatus === 'processing'}
            >
              {paymentStatus === 'processing' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : (
                <><DollarSign className="w-4 h-4" /> Send ₹{paymentTarget?.payoutAmount.toLocaleString('en-IN')}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment success modal */}
      <Dialog open={paymentStatus === 'success'} onOpenChange={(o) => { if (!o) resetPaymentModal(); }}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Payment Initiated
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-slate-200 font-medium">Transfer has been initiated</p>
            <p className="text-sm text-slate-400 mt-1">
              ₹{paymentTarget?.payoutAmount.toLocaleString('en-IN')} sent to {paymentTarget?.userName}
            </p>
            <p className="text-xs text-slate-500 mt-2">via Razorpay (NEFT). Check Razorpay dashboard for status.</p>
          </div>
          <DialogFooter>
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={resetPaymentModal}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}