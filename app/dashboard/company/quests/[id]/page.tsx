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
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Applicant {
  id: string;
  userId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  user: {
    name: string;
    email: string;
    image?: string;
    rank: string;
    xp: number;
  };
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
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
  }, [id, status, router]);

  const handleApplicantAction = async (assignmentId: string, newStatus: 'accepted' | 'rejected') => {
    setProcessingId(assignmentId);
    try {
      const response = await fetch(`/api/quests/${id}/assignments`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId, status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Applicant ${newStatus === 'accepted' ? 'accepted' : 'rejected'}`);
        // Update local state
        setQuest(prev => prev ? {
          ...prev,
          assignments: prev.assignments.map(a => 
            a.id === assignmentId ? { ...a, status: newStatus } : a
          )
        } : null);
      } else {
        toast.error(data.error || 'Action failed');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setProcessingId(null);
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
            <Badge variant={quest.status === 'open' ? 'default' : 'secondary'}>
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
          <Button variant="outline">Edit Quest</Button>
          <Button variant="destructive">Close Quest</Button>
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
                quest.assignments.map((applicant) => (
                  <Card key={applicant.id}>
                    <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={applicant.user.image} />
                          <AvatarFallback>{applicant.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{applicant.user.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">{applicant.user.rank}-Rank</Badge>
                            <span>• {applicant.user.xp} XP</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Applied {new Date(applicant.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {applicant.status === 'pending' ? (
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
                          <Badge variant={applicant.status === 'accepted' ? 'default' : 'destructive'}>
                            {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
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
                    </CardContent>
                  </Card>
                ))
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
                  {quest.assignments.filter(a => a.status === 'accepted').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-bold text-yellow-600">
                  {quest.assignments.filter(a => a.status === 'pending').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}