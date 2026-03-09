'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Target, Zap, Users, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { GuildCard, GuildHero, GuildPage, GuildPanel } from '@/components/guild/primitives';

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
  company?: {
    name: string;
    email: string;
  };
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

const assignmentStatusMeta: Record<string, { label: string; className: string }> = {
  assigned: { label: 'Assigned', className: 'border-blue-200 bg-blue-100 text-blue-700' },
  started: { label: 'Started', className: 'border-amber-200 bg-amber-100 text-amber-700' },
  in_progress: { label: 'In Progress', className: 'border-amber-200 bg-amber-100 text-amber-700' },
  submitted: { label: 'Submitted', className: 'border-violet-200 bg-violet-100 text-violet-700' },
  completed: { label: 'Completed', className: 'border-emerald-200 bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelled', className: 'border-slate-200 bg-slate-100 text-slate-700' },
};

export default function QuestDetailPage() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quest, setQuest] = useState<Quest | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssigned, setIsAssigned] = useState(false);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role === 'company') {
      // Companies shouldn't access this page
      router.push('/dashboard/company');
      return;
    }

    const fetchQuestAndAssignment = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch quest details
        const questResponse = await fetch(`/api/quests/${id}`);
        const questData = await questResponse.json();

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
        setAssignment(null);
        setIsAssigned(false);

        // Fetch user's assignment for this quest
        if (session?.user?.id) {
          const assignmentResponse = await fetch(`/api/quests/assignments?userId=${session.user.id}&questId=${id}`);
          const assignmentData = await assignmentResponse.json();

          if (assignmentData.success && assignmentData.assignments.length > 0) {
            setAssignment(assignmentData.assignments[0]);
            setIsAssigned(true);
          } else {
            setAssignment(null);
            setIsAssigned(false);
          }
        }
      } catch (err) {
        console.error('Error fetching quest details:', err);
        setError('An error occurred while fetching quest details');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && id) {
      fetchQuestAndAssignment();
    }
  }, [status, session, id, router]);

  const handleAssignQuest = async () => {
    if (!session?.user?.id) {
      router.push('/login');
      return;
    }
    if (isAssigning) {
      return;
    }

    setIsAssigning(true);

    try {
      const response = await fetch('/api/quests/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questId: id,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success && data.assignment) {
        setAssignment(data.assignment);
        setIsAssigned(true);
        toast.success('Successfully assigned to quest!');
      } else {
        toast.error(data?.error || 'Failed to assign to quest');
      }
    } catch (err) {
      console.error('Error assigning to quest:', err);
      toast.error('An error occurred while assigning to quest');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleSubmitQuest = async () => {
    if (!session?.user?.id || !assignment?.id) {
      router.push('/login');
      return;
    }

    if (!submissionContent.trim()) {
      toast.error('Please provide submission content');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/quests/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentId: assignment.id,
          submissionContent: submissionContent,
          submissionNotes: submissionNotes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Submission successful!');
        // Update assignment status
        setAssignment(prev => prev ? { ...prev, status: 'submitted' } : null);
        setSubmissionContent('');
        setSubmissionNotes('');
      } else {
        toast.error(data.error || 'Failed to submit quest');
      }
    } catch (err) {
      console.error('Error submitting quest:', err);
      toast.error('An error occurred while submitting quest');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
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
        <GuildPanel className="p-6 text-sm text-slate-600">Quest not found</GuildPanel>
      </GuildPage>
    );
  }

  const canAssign = quest.status === 'available' && !isAssigned;
  const canSubmit =
    !!isAssigned &&
    ['assigned', 'started', 'in_progress'].includes(assignment?.status || '');
  const assignmentMeta = assignment
    ? (assignmentStatusMeta[assignment.status] ?? { label: assignment.status, className: 'border-slate-200 bg-slate-100 text-slate-700' })
    : null;

  return (
    <GuildPage>
      <GuildHero>
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <Badge className="rounded-full border border-emerald-300 bg-emerald-100 text-emerald-700">
              Quest Mission Brief
            </Badge>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{quest.title}</h1>
            <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
              Posted by {quest.company?.name || 'Unknown Company'} • {quest.questType.replace('_', ' ')}
            </p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            ← Back to Quests
          </Button>
        </div>
      </GuildHero>

      <GuildCard className="border-slate-200/80">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-2xl">{quest.title}</CardTitle>
                <Badge variant="outline">{quest.difficulty}-Rank</Badge>
              </div>
              <CardDescription>
                Posted by {quest.company?.name || 'Unknown Company'}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{quest.questCategory}</Badge>
              <Badge variant="outline">{quest.questType}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 rounded-lg border border-slate-200 bg-slate-50">
              <Zap className="w-6 h-6 mx-auto text-yellow-500 mb-1" />
              <div className="font-bold">{quest.xpReward} XP</div>
              <div className="text-xs text-muted-foreground">Reward</div>
            </div>
            <div className="text-center p-3 rounded-lg border border-slate-200 bg-slate-50">
              <Target className="w-6 h-6 mx-auto text-blue-500 mb-1" />
              <div className="font-bold">{quest.skillPointsReward} SP</div>
              <div className="text-xs text-muted-foreground">Skill Points</div>
            </div>
            {quest.monetaryReward && (
              <div className="text-center p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="font-bold">${quest.monetaryReward}</div>
                <div className="text-xs text-muted-foreground">Monetary</div>
              </div>
            )}
            <div className="text-center p-3 rounded-lg border border-slate-200 bg-slate-50">
              <Users className="w-6 h-6 mx-auto text-green-500 mb-1" />
              <div className="font-bold">{quest.maxParticipants || 1}</div>
              <div className="text-xs text-muted-foreground">Participants</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{quest.description}</p>
            </div>

            {quest.detailedDescription && (
              <div>
                <h3 className="font-semibold mb-2">Detailed Requirements</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground whitespace-pre-line">{quest.detailedDescription}</p>
                </div>
              </div>
            )}

            {quest.requiredSkills && quest.requiredSkills.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {quest.requiredSkills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            {quest.deadline && (
              <div className="flex items-center text-muted-foreground">
                <Clock className="w-4 h-4 mr-2" />
                <span>Deadline: {new Date(quest.deadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </GuildCard>

      {isAssigned && assignment && (
        <GuildCard className="border-slate-200/80">
          <CardHeader>
            <CardTitle>Your Assignment Status</CardTitle>
            <CardDescription>
              You are currently assigned to this quest
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Badge className={assignmentMeta?.className}>
                  {assignmentMeta?.label}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Assigned on {new Date(assignment.assignedAt).toLocaleDateString()}
                </p>
              </div>
              {assignment.status === 'completed' && (
                <CheckCircle className="w-8 h-8 text-green-500" />
              )}
            </div>
          </CardContent>
        </GuildCard>
      )}

      {canAssign && (
        <GuildCard className="border-slate-200/80 bg-gradient-to-br from-amber-50/70 via-white to-emerald-50/70">
          <CardHeader>
            <CardTitle>Accept This Quest</CardTitle>
            <CardDescription>
              Are you ready to take on this challenge?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleAssignQuest}
              disabled={isAssigning || !!(quest.maxParticipants && quest.maxParticipants <= 0)}
              className="w-full sm:w-auto"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                'Accept Quest'
              )}
            </Button>
          </CardContent>
        </GuildCard>
      )}

      {canSubmit && (
        <GuildCard className="border-slate-200/80">
          <CardHeader>
            <CardTitle>Submit Quest</CardTitle>
            <CardDescription>
              Complete the quest and submit your work for review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="submissionContent">Submission Content</Label>
                <Textarea
                  id="submissionContent"
                  placeholder="Provide a link to your work, code repository, or detailed explanation of what you completed..."
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  rows={6}
                />
              </div>
              <div>
                <Label htmlFor="submissionNotes">Additional Notes (Optional)</Label>
                <Textarea
                  id="submissionNotes"
                  placeholder="Any additional information for the reviewer..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <Button 
                onClick={handleSubmitQuest} 
                disabled={isSubmitting || !submissionContent.trim()}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Quest'
                )}
              </Button>
            </div>
          </CardContent>
        </GuildCard>
      )}

      {quest.status !== 'available' && !isAssigned && (
        <GuildCard className="border-slate-200/80">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <XCircle className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium mb-1">Quest Not Available</h3>
              <p className="text-muted-foreground">
                This quest is {quest.status} and cannot be accepted at this time.
              </p>
            </div>
          </CardContent>
        </GuildCard>
      )}
    </GuildPage>
  );
}
