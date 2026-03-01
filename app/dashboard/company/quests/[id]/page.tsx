'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Target, Zap, Users, Clock, CheckCircle, XCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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
  users: {
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
  user: {
    name: string;
    email: string;
    rank: string;
  };
}

interface Submission {
  id: string;
  assignmentId: string;
  userId: string;
  submissionContent: string;
  submissionNotes?: string;
  submittedAt: string;
  status: string;
  reviewNotes?: string;
  qualityScore?: number;
  user: {
    name: string;
    email: string;
  };
}

export default function CompanyQuestDetailPage() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quest, setQuest] = useState<Quest | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'company' && session.user.role !== 'admin') {
      // Only companies and admins can access this page
      router.push('/dashboard');
      return;
    }

    const fetchQuestDetails = async () => {
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

        const questDetails = questData.quests[0] || questData.quest;
        
        // Verify this quest belongs to the current company (or user is admin)
        if (session?.user?.role !== 'admin' && questDetails.companyId !== session?.user?.id) {
          setError('Unauthorized to view this quest');
          return;
        }

        setQuest(questDetails);

        // Fetch assignments for this quest
        const assignmentsResponse = await fetch(`/api/quests/assignments?questId=${id}`);
        const assignmentsData = await assignmentsResponse.json();
        if (assignmentsData.success) {
          setAssignments(assignmentsData.assignments);
        }

        // Fetch submissions for this quest
        // Actually, we need to fetch submissions for each assignment
        const submissionPromises = assignmentsData.assignments.map((assignment: Assignment) => 
          fetch(`/api/quests/submissions?assignmentId=${assignment.id}`).then(res => res.json())
        );
        
        const submissionsResults = await Promise.all(submissionPromises);
        const allSubmissions = submissionsResults.flatMap(result => 
          result.success ? result.submissions : []
        );
        
        setSubmissions(allSubmissions);
      } catch (err) {
        console.error('Error fetching quest details:', err);
        setError('An error occurred while fetching quest details');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && id) {
      fetchQuestDetails();
    }
  }, [status, session, id, router]);

  const handleUpdateQuestStatus = async (newStatus: string) => {
    if (!quest) return;

    try {
      const response = await fetch('/api/company/quests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questId: quest.id,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setQuest(prev => prev ? { ...prev, status: newStatus } : null);
        toast.success(`Quest status updated to ${newStatus}`);
      } else {
        toast.error(data.error || 'Failed to update quest status');
      }
    } catch (err) {
      console.error('Error updating quest status:', err);
      toast.error('An error occurred while updating quest status');
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
        <Button className="mt-4" onClick={() => router.back()}>
          ← Back
        </Button>
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

  return (
    <div className="container mx-auto py-6 max-w-6xl">
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
                <Badge className={`
                  ${quest.status === 'available' ? 'bg-green-500' : 
                    quest.status === 'in_progress' ? 'bg-yellow-500' : 
                    quest.status === 'completed' ? 'bg-blue-500' : 
                    quest.status === 'cancelled' ? 'bg-red-500' : 
                    'bg-gray-500'}
                `}>
                  {quest.status.charAt(0).toUpperCase() + quest.status.slice(1)}
                </Badge>
              </div>
              <CardDescription>
                Posted on {new Date(quest.createdAt).toLocaleDateString()}
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
            <div className="text-center p-3 bg-muted rounded-lg">
              <Zap className="w-6 h-6 mx-auto text-yellow-500 mb-1" />
              <div className="font-bold">{quest.xpReward} XP</div>
              <div className="text-xs text-muted-foreground">Reward</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <Target className="w-6 h-6 mx-auto text-blue-500 mb-1" />
              <div className="font-bold">{quest.skillPointsReward} SP</div>
              <div className="text-xs text-muted-foreground">Skill Points</div>
            </div>
            {quest.monetaryReward && (
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="font-bold">${quest.monetaryReward}</div>
                <div className="text-xs text-muted-foreground">Monetary</div>
              </div>
            )}
            <div className="text-center p-3 bg-muted rounded-lg">
              <Users className="w-6 h-6 mx-auto text-green-500 mb-1" />
              <div className="font-bold">{quest.maxParticipants || 1}/{quest.maxParticipants || 1}</div>
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

          <div className="flex flex-wrap gap-2 mt-6">
            {quest.status === 'available' && (
              <Button 
                variant="outline" 
                onClick={() => handleUpdateQuestStatus('draft')}
              >
                Mark as Draft
              </Button>
            )}
            {(quest.status === 'draft' || quest.status === 'available') && (
              <Button 
                variant="outline" 
                onClick={() => handleUpdateQuestStatus('available')}
              >
                Make Available
              </Button>
            )}
            {quest.status === 'in_progress' && (
              <Button 
                variant="outline" 
                onClick={() => handleUpdateQuestStatus('completed')}
              >
                Mark as Completed
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => router.push(`/dashboard/company/quests/${quest.id}/edit`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Quest
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Assigned Adventurers</CardTitle>
          <CardDescription>
            {assignments.length} adventurer{assignments.length !== 1 ? 's' : ''} currently working on this quest
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2" />
              <p>No adventurers assigned to this quest yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{assignment.user?.name || 'Unknown User'}</h4>
                    <p className="text-sm text-muted-foreground">{assignment.user?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{assignment.user?.rank || 'F'}-Rank</Badge>
                      <Badge className={`
                        ${assignment.status === 'assigned' ? 'bg-blue-500' : 
                          assignment.status === 'started' ? 'bg-yellow-500' : 
                          assignment.status === 'in_progress' ? 'bg-yellow-500' : 
                          assignment.status === 'submitted' ? 'bg-purple-500' : 
                          assignment.status === 'completed' ? 'bg-green-500' : 
                          'bg-gray-500'}
                      `}>
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/company/submissions/${assignment.id}`)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Progress
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submissions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>
            Work submitted by adventurers for review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-2" />
              <p>No submissions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <Card key={submission.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{submission.user?.name || 'Unknown User'}</h4>
                      <p className="text-sm text-muted-foreground">{submission.user?.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`
                          ${submission.status === 'pending' ? 'bg-yellow-500' :
                            submission.status === 'approved' ? 'bg-green-500' :
                            submission.status === 'needs_rework' ? 'bg-orange-500' :
                            submission.status === 'rejected' ? 'bg-red-500' :
                            'bg-gray-500'}
                        `}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </Badge>
                        {submission.qualityScore && (
                          <Badge variant="outline">Score: {submission.qualityScore}/10</Badge>
                        )}
                      </div>
                      <div className="mt-2 text-sm">
                        <p className="font-medium">Submission:</p>
                        <p className="text-muted-foreground line-clamp-2">{submission.submissionContent}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/company/submissions/${submission.id}`)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}