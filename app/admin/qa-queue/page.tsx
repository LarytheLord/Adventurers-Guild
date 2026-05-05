'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  ExternalLink,
  Wallet,
  AlertCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

interface QueueItem {
  id: string;
  status: string;
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

interface PaymentItem {
  id: string;
  status: string;
  completedAt: string | null;
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
    adventurerProfile: { razorpayFundAccountId: string | null } | null;
  };
  submissions: Array<{
    id: string;
    submittedAt: string;
  }>;
}

const TRACK_COLORS: Record<string, string> = {
  BOOTCAMP: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  INTERN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  OPEN: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

export default function QAQueuePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('review');
  const [rejectTarget, setRejectTarget] = useState<QueueItem | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<PaymentItem | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && session?.user?.role !== 'admin') router.push('/dashboard');
  }, [status, session, router]);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    const res = await fetchWithAuth('/api/admin/qa-queue');
    const data = await res.json();
    setItems(data.assignments ?? []);
    setLoading(false);
  }, []);

  const fetchUnpaid = useCallback(async () => {
    const res = await fetchWithAuth('/api/admin/qa-queue/completed-unpaid');
    const data = await res.json();
    setPaymentItems(data.assignments ?? []);
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchQueue();
      fetchUnpaid();
    }
  }, [status, fetchQueue, fetchUnpaid]);

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
    setPaymentProcessing(true);

    const rewardAmount = parseFloat(paymentTarget.quest.monetaryReward ?? '0');

    try {
      const res = await fetchWithAuth('/api/payments/razorpay/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questId: paymentTarget.quest.id,
          userId: paymentTarget.user.id,
          amount: rewardAmount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? 'Payment failed');
        setPaymentProcessing(false);
        return;
      }

      const payoutAmount = Math.round(rewardAmount * 0.85);
      toast.success(`Payment initiated — ₹${payoutAmount} to ${paymentTarget.user.name}`);
      setPaidIds((prev) => new Set(prev).add(paymentTarget.id));
      setPaymentTarget(null);
      fetchUnpaid();
    } catch {
      toast.error('Network error — please try again');
    }

    setPaymentProcessing(false);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin" className="text-slate-400 hover:text-slate-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Shield className="w-6 h-6 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-slate-100">QA Queue</h1>
            <p className="text-slate-400 text-sm">
              {items.length} submission{items.length !== 1 ? 's' : ''} pending review
              {paymentItems.length > 0 && ` · ${paymentItems.length} awaiting payment`}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-slate-900 border-slate-800">
            <TabsTrigger value="review" className="data-[state=active]:bg-slate-800">
              <Clock className="w-4 h-4 mr-1.5" />
              Pending Review ({items.length})
            </TabsTrigger>
            <TabsTrigger value="payment" className="data-[state=active]:bg-slate-800">
              <Wallet className="w-4 h-4 mr-1.5" />
              Pending Payment ({paymentItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="review">
            {items.length === 0 ? (
              <Card className="bg-slate-900 border-slate-800 text-center py-16">
                <CardContent>
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <p className="text-slate-300 font-medium">Queue is clear</p>
                  <p className="text-slate-500 text-sm mt-1">All submissions have been reviewed.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const submission = item.submissions[0];
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
                            </div>
                            <CardTitle className="text-base text-slate-100 truncate">
                              {item.quest.title}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500 text-xs whitespace-nowrap">
                            <Clock className="w-3.5 h-3.5" />
                            {submission
                              ? formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })
                              : '—'}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
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

                        {submission && (
                          <div>
                            <p className="text-xs text-slate-500 mb-1.5 uppercase tracking-wide font-medium">
                              Submission
                            </p>
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

                        <div className="flex gap-2 pt-1">
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
                            onClick={() => {
                              setRejectTarget(item);
                              setRejectNotes('');
                            }}
                            disabled={submitting}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject — Return to Student
                          </Button>
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
          </TabsContent>

          <TabsContent value="payment">
            {paymentItems.length === 0 ? (
              <Card className="bg-slate-900 border-slate-800 text-center py-16">
                <CardContent>
                  <Wallet className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-300 font-medium">No pending payments</p>
                  <p className="text-slate-500 text-sm mt-1">
                    Completed quests with payouts will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {paymentItems.map((item) => {
                  const rewardAmount = parseFloat(item.quest.monetaryReward ?? '0');
                  const payoutAmount = Math.round(rewardAmount * 0.85);
                  const platformFee = rewardAmount - payoutAmount;
                  const hasFundAccount = !!item.user.adventurerProfile?.razorpayFundAccountId;
                  const isPaid = paidIds.has(item.id);

                  if (isPaid) return null;

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
                            </div>
                            <CardTitle className="text-base text-slate-100 truncate">
                              {item.quest.title}
                            </CardTitle>
                          </div>
                          {item.completedAt && (
                            <div className="flex items-center gap-1 text-slate-500 text-xs whitespace-nowrap">
                              <Clock className="w-3.5 h-3.5" />
                              {formatDistanceToNow(new Date(item.completedAt), { addSuffix: true })}
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">
                            {item.user.rank}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-200">{item.user.name}</p>
                            <p className="text-xs text-slate-500">{item.user.email}</p>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-950/60 rounded-lg space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Quest Reward</span>
                            <span className="text-slate-200 font-medium">₹{rewardAmount}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Platform Fee (15%)</span>
                            <span className="text-slate-400">- ₹{platformFee}</span>
                          </div>
                          <div className="border-t border-slate-800 pt-2 flex justify-between">
                            <span className="text-emerald-400 font-medium">Payout to Adventurer</span>
                            <span className="text-emerald-400 font-bold">₹{payoutAmount}</span>
                          </div>
                        </div>

                        {!hasFundAccount && (
                          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-400">
                              Adventurer has not set up a bank account. Payment will fail until they configure Razorpay fund account.
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-1">
                          <Button
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-500 text-white gap-1.5"
                            onClick={() => setPaymentTarget(item)}
                            disabled={!hasFundAccount}
                          >
                            <Wallet className="w-3.5 h-3.5" />
                            Initiate Payment
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={!!rejectTarget}
        onOpenChange={(o) => {
          if (!o) {
            setRejectTarget(null);
            setRejectNotes('');
          }
        }}
      >
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
            <Button
              variant="ghost"
              className="text-slate-400"
              onClick={() => {
                setRejectTarget(null);
                setRejectNotes('');
              }}
            >
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

      <Dialog
        open={!!paymentTarget}
        onOpenChange={(o) => {
          if (!o && !paymentProcessing) setPaymentTarget(null);
        }}
      >
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-orange-400" />
              Confirm Payment
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              This will initiate a Razorpay bank transfer to the adventurer.
            </DialogDescription>
          </DialogHeader>
          {paymentTarget && (
            <div className="space-y-3 py-2">
              <div className="p-3 bg-slate-950/60 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Adventurer</span>
                  <span className="text-slate-200">{paymentTarget.user.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Quest</span>
                  <span className="text-slate-200 truncate ml-4 max-w-[200px]">
                    {paymentTarget.quest.title}
                  </span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between">
                  <span className="text-emerald-400 font-medium">Payout Amount (85%)</span>
                  <span className="text-emerald-400 font-bold">
                    ₹{Math.round(parseFloat(paymentTarget.quest.monetaryReward ?? '0') * 0.85)}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="ghost"
              className="text-slate-400"
              onClick={() => setPaymentTarget(null)}
              disabled={paymentProcessing}
            >
              Cancel
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-500 text-white"
              onClick={handleInitiatePayment}
              disabled={paymentProcessing}
            >
              {paymentProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Confirm & Send Payment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
