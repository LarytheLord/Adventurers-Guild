'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Target,
  Zap,
  ArrowLeft,
  MoreVertical,
  Users,
  Loader2,
  RotateCcw,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Submission {
  id: string;
  status: string;
  submissionContent: string;
  submissionNotes?: string | null;
}

interface Applicant {
  id: string;
  userId: string;
  status: 'assigned' | 'started' | 'in_progress' | 'submitted' | 'review' | 'completed' | 'cancelled';
  assignedAt: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
    rank: string;
    xp: number;
  };
  submissions?: Submission[];
}

interface QuestDetails {
  id: string;
  title: string;
  description: string;
  status: string;
  difficulty: string;
  xpReward: number;
  skillPointsReward: number;
  monetaryReward?: number;
  deadline?: string;
  assignments: Applicant[];
}

export default function CompanyQuestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quest, setQuest] = useState<QuestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'company' && session.user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const fetchQuestDetails = async () => {
      try {
        const response = await fetch(`/api/quests/${id}`);
        const data = await response.json();

        if (data.success) {
          setQuest(data.quest);
        } else {
          toast.error(data.error || 'Failed to fetch quest details');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load quest');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchQuestDetails();
    }
  }, [id, status, session, router]);

  const handleApplicantAction = async (assignmentId: string, action: 'accepted' | 'rejected') => {
    setProcessingId(assignmentId);
    const dbStatus: Applicant['status'] = action === 'accepted' ? 'started' : 'cancelled';
    try {
      const response = await fetch(`/api/quests/${id}/assignments`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId, status: action }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Applicant ${action === 'accepted' ? 'accepted' : 'rejected'}`);
        setQuest(prev => prev ? {
          ...prev,
          assignments: prev.assignments.map(a =>
            a.id === assignmentId ? { ...a, status: dbStatus } : a
          )
        } : null);
      } else {
        toast.error(data.error || 'Action failed');
      }
    } catch (error) {
      console.error('Applicant action error:', error);
      toast.error('Something went wrong');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSubmissionReview = async (
    assignmentId: string,
    submissionId: string,
    action: 'approved' | 'needs_rework' | 'rejected'
  ) => {
    setProcessingId(assignmentId);
    try {
      const response = await fetch('/api/quests/submissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, status: action }),
      });

      const data = await response.json();

      if (data.success) {
        const newAssignmentStatus: Applicant['status'] =
          action === 'approved' ? 'completed' : 'in_progress';
        const label = action === 'approved' ? 'Approved' : action === 'needs_rework' ? 'Sent back for rework' : 'Rejected';
        toast.success(label);
        setQuest(prev => prev ? {
          ...prev,
          assignments: prev.assignments.map(a =>
            a.id === assignmentId ? { ...a, status: newAssignmentStatus } : a
          )
        } : null);
      } else {
        toast.error(data.error || 'Review action failed');
      }
    } catch (error) {
      console.error('Submission review error:', error);
      toast.error('Something went wrong');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCloseQuest = async () => {
    if (!quest) return;

    try {
      setIsClosing(true);
      const response = await fetch('/api/company/quests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId: quest.id }),
      });

      const data = await response.json();
      if (!data.success) {
        toast.error(data.error || 'Failed to close quest');
        return;
      }

      toast.success('Quest closed successfully');
      router.push('/dashboard/company/quests');
    } catch (error) {
      console.error('Close quest error:', error);
      toast.error('Failed to close quest');
    } finally {
      setIsClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Quest not found or you don&apos;t have permission to view it.</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quests
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{quest.title}</h1>
            <Badge variant={quest.status === 'available' ? 'default' : 'secondary'}>
              {quest.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <span className="flex items-center"><Target className="w-4 h-4 mr-1" /> {quest.difficulty}-Rank</span>
            {quest.deadline && (
              <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> Due {new Date(quest.deadline).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info('Quest editing is coming in a follow-up update')}>
            Edit Quest
          </Button>
          <Button
            variant="destructive"
            onClick={handleCloseQuest}
            disabled={isClosing || ['completed', 'cancelled'].includes(quest.status)}
          >
            {isClosing ? 'Closing...' : 'Close Quest'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="applicants">
            <TabsList className="mb-4">
              <TabsTrigger value="applicants">Applicants ({quest.assignments.length})</TabsTrigger>
              <TabsTrigger value="details">Quest Details</TabsTrigger>
            </TabsList>

            <TabsContent value="applicants" className="space-y-4">
              {quest.assignments.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No adventurers have applied yet.</p>
                  </CardContent>
                </Card>
              ) : (
                quest.assignments.map((applicant) => {
                  const latestSubmission = applicant.submissions?.[0];
                  const needsReview = ['submitted', 'review'].includes(applicant.status) && !!latestSubmission;

                  return (
                    <Card key={applicant.id}>
                      <CardContent className="p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={applicant.user.avatar} />
                              <AvatarFallback>{applicant.user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{applicant.user.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="outline" className="text-xs">{applicant.user.rank}-Rank</Badge>
                                <span>• {applicant.user.xp} XP</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Applied {new Date(applicant.assignedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {applicant.status === 'assigned' ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleApplicantAction(applicant.id, 'accepted')}
                                  disabled={!!processingId}
                                >
                                  {processingId === applicant.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleApplicantAction(applicant.id, 'rejected')}
                                  disabled={!!processingId}
                                >
                                  {processingId === applicant.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}
                                  Reject
                                </Button>
                              </>
                            ) : (
                              <Badge
                                variant={
                                  ['started', 'in_progress', 'completed'].includes(applicant.status)
                                    ? 'default'
                                    : ['submitted', 'review'].includes(applicant.status)
                                      ? 'secondary'
                                      : 'destructive'
                                }
                              >
                                {applicant.status.replace('_', ' ')}
                              </Badge>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                <DropdownMenuItem>Message</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Submission review panel */}
                        {needsReview && latestSubmission && (
                          <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <FileText className="h-4 w-4 text-orange-500" />
                              Work Submitted — awaiting your review
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                              {latestSubmission.submissionContent}
                            </p>
                            {latestSubmission.submissionNotes && (
                              <p className="text-xs text-muted-foreground italic">
                                Note: {latestSubmission.submissionNotes}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 pt-1">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleSubmissionReview(applicant.id, latestSubmission.id, 'approved')}
                                disabled={!!processingId}
                              >
                                {processingId === applicant.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                                Approve & Award XP
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                onClick={() => handleSubmissionReview(applicant.id, latestSubmission.id, 'needs_rework')}
                                disabled={!!processingId}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Request Rework
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleSubmissionReview(applicant.id, latestSubmission.id, 'rejected')}
                                disabled={!!processingId}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="details">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{quest.description}</p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Rewards</h4>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1"><Zap className="w-4 h-4 text-yellow-500" /> {quest.xpReward} XP</div>
                        {quest.monetaryReward && (
                          <div className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-green-500" /> ${quest.monetaryReward}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Applicants</span>
                <span className="font-bold">{quest.assignments.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Accepted</span>
                <span className="font-bold text-green-600">
                  {quest.assignments.filter(a => ['started', 'in_progress', 'completed'].includes(a.status)).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pending Review</span>
                <span className="font-bold text-yellow-600">
                  {quest.assignments.filter(a => ['submitted', 'review'].includes(a.status)).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-bold text-primary">
                  {quest.assignments.filter(a => a.status === 'completed').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
