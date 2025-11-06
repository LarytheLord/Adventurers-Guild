'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Target, Zap, Clock, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Quest {
  id: string;
  title: string;
  description: string;
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
  quest: Quest;
}

export default function MyQuestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    const fetchMyAssignments = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!session?.user?.id) {
          setError('User ID not found');
          return;
        }

        const response = await fetch(`/api/quests/assignments?user_id=${session.user.id}`);
        const data = await response.json();

        if (!data.success) {
          setError(data.error || 'Failed to fetch assignments');
          return;
        }

        setAssignments(data.assignments || []);
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError('An error occurred while fetching assignments');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchMyAssignments();
    }
  }, [status, session, router]);

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

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Quests</h1>
        <p className="text-muted-foreground mt-1">
          Track the quests you've accepted and their current status
        </p>
      </div>

      <div className="mb-6">
        <Button onClick={() => router.push('/dashboard')}>
          ← Back to Dashboard
        </Button>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No active quests</h3>
          <p className="text-muted-foreground mb-4">
            You haven't accepted any quests yet. Browse available quests to get started.
          </p>
          <Button onClick={() => router.push('/dashboard/quests')}>
            Browse Available Quests
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="flex flex-col h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{assignment.quest.title}</CardTitle>
                    <CardDescription>
                      {assignment.quest.users?.name || 'Unknown Company'}
                    </CardDescription>
                  </div>
                  <Badge className={`
                    ${assignment.status === 'assigned' ? 'bg-blue-500' : 
                      assignment.status === 'started' ? 'bg-yellow-500' : 
                      assignment.status === 'in_progress' ? 'bg-yellow-500' : 
                      assignment.status === 'submitted' ? 'bg-purple-500' : 
                      assignment.status === 'completed' ? 'bg-green-500' : 
                      assignment.status === 'cancelled' ? 'bg-red-500' : 
                      'bg-gray-500'}
                  `}>
                    {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary">{assignment.quest.quest_category}</Badge>
                  <Badge variant="outline">{assignment.quest.difficulty}-Rank</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {assignment.quest.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                    <span className="text-sm">{assignment.quest.xp_reward} XP</span>
                  </div>
                  <div className="flex items-center">
                    <Target className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="text-sm">{assignment.quest.skill_points_reward} SP</span>
                  </div>
                  {assignment.quest.monetary_reward && (
                    <div className="flex items-center col-span-2">
                      <span className="text-sm font-medium">${assignment.quest.monetary_reward}</span>
                    </div>
                  )}
                </div>
                
                {assignment.quest.deadline && (
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Due: {new Date(assignment.quest.deadline).toLocaleDateString()}</span>
                  </div>
                )}
                
                <div className="mt-auto">
                  <Link href={`/dashboard/quests/${assignment.quest.id}`} className="w-full">
                    <Button className="w-full">
                      {assignment.status === 'completed' ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completed
                        </>
                      ) : assignment.status === 'submitted' ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Submitted
                        </>
                      ) : (
                        <>
                          Continue Quest
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}