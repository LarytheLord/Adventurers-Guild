'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Target, Zap, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Quest {
  id: string;
  title: string;
  description: string;
  detailed_description?: string;
  quest_type: string;
  status: string;
  difficulty: string;
  xp_reward: number;
  skill_points_reward: number;
  monetary_reward?: number;
  required_skills: string[];
  required_rank?: string;
  max_participants?: number;
  quest_category: string;
  company_id: string;
  created_at: string;
  deadline?: string;
  users: {
    name: string;
    email: string;
  };
}

interface Assignment {
  id: string;
  quest_id: string;
  user_id: string;
  status: string;
  assigned_at: string;
  started_at?: string;
  completed_at?: string;
  progress?: number;
}

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

        setQuest(questData.quests[0] || questData.quest);

        // Fetch user's assignment for this quest
        if (session?.user?.id) {
          const assignmentResponse = await fetch(`/api/quests/assignments?user_id=${session.user.id}&quest_id=${id}`);
          const assignmentData = await assignmentResponse.json();

          if (assignmentData.success && assignmentData.assignments.length > 0) {
            setAssignment(assignmentData.assignments[0]);
            setIsAssigned(true);
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

    try {
      const response = await fetch('/api/quests/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quest_id: id,
          user_id: session.user.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAssignment(data.assignment);
        setIsAssigned(true);
        toast.success('Successfully assigned to quest!');
      } else {
        toast.error(data.error || 'Failed to assign to quest');
      }
    } catch (err) {
      console.error('Error assigning to quest:', err);
      toast.error('An error occurred while assigning to quest');
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
          assignment_id: assignment.id,
          submission_content: submissionContent,
          submission_notes: submissionNotes,
          user_id: session.user.id,
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
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="container mx-auto py-6">
        <p>Quest not found</p>
      </div>
    );
  }

  const canAssign = quest.status === 'available' && !isAssigned;
  const canSubmit = isAssigned && assignment?.status === 'assigned' || assignment?.status === 'started' || assignment?.status === 'in_progress';

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back to Quests
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-2xl">{quest.title}</CardTitle>
                <Badge variant="outline">{quest.difficulty}-Rank</Badge>
              </div>
              <CardDescription>
                Posted by {quest.users?.name || 'Unknown Company'}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{quest.quest_category}</Badge>
              <Badge variant="outline">{quest.quest_type}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-muted rounded-lg">
              <Zap className="w-6 h-6 mx-auto text-yellow-500 mb-1" />
              <div className="font-bold">{quest.xp_reward} XP</div>
              <div className="text-xs text-muted-foreground">Reward</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <Target className="w-6 h-6 mx-auto text-blue-500 mb-1" />
              <div className="font-bold">{quest.skill_points_reward} SP</div>
              <div className="text-xs text-muted-foreground">Skill Points</div>
            </div>
            {quest.monetary_reward && (
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="font-bold">${quest.monetary_reward}</div>
                <div className="text-xs text-muted-foreground">Monetary</div>
              </div>
            )}
            <div className="text-center p-3 bg-muted rounded-lg">
              <Users className="w-6 h-6 mx-auto text-green-500 mb-1" />
              <div className="font-bold">{quest.max_participants || 1}</div>
              <div className="text-xs text-muted-foreground">Participants</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{quest.description}</p>
            </div>

            {quest.detailed_description && (
              <div>
                <h3 className="font-semibold mb-2">Detailed Requirements</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground whitespace-pre-line">{quest.detailed_description}</p>
                </div>
              </div>
            )}

            {quest.required_skills && quest.required_skills.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {quest.required_skills.map((skill, index) => (
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
      </Card>

      {isAssigned && assignment && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Assignment Status</CardTitle>
            <CardDescription>
              You are currently assigned to this quest
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Badge 
                  className={`
                    ${assignment.status === 'assigned' ? 'bg-blue-500' : 
                      assignment.status === 'started' ? 'bg-yellow-500' : 
                      assignment.status === 'in_progress' ? 'bg-yellow-500' : 
                      assignment.status === 'submitted' ? 'bg-purple-500' : 
                      assignment.status === 'completed' ? 'bg-green-500' : 
                      'bg-gray-500'}
                  `}
                >
                  {assignment.status === 'assigned' && 'Assigned'}
                  {assignment.status === 'started' && 'Started'}
                  {assignment.status === 'in_progress' && 'In Progress'}
                  {assignment.status === 'submitted' && 'Submitted'}
                  {assignment.status === 'completed' && 'Completed'}
                  {assignment.status === 'cancelled' && 'Cancelled'}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Assigned on {new Date(assignment.assigned_at).toLocaleDateString()}
                </p>
              </div>
              {assignment.status === 'completed' && (
                <CheckCircle className="w-8 h-8 text-green-500" />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!isAssigned && quest.status === 'available' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Accept This Quest</CardTitle>
            <CardDescription>
              Are you ready to take on this challenge?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleAssignQuest}
              disabled={!!(quest.max_participants && quest.max_participants <= 0)}
            >
              Accept Quest
            </Button>
          </CardContent>
        </Card>
      )}

      {canSubmit && (
        <Card>
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
                {isSubmitting ? 'Submitting...' : 'Submit Quest'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {quest.status !== 'available' && !isAssigned && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <XCircle className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium mb-1">Quest Not Available</h3>
              <p className="text-muted-foreground">
                This quest is {quest.status} and cannot be accepted at this time.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}