// components/MentorshipManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserPlus, 
  UserCheck, 
  UserX, 
  Target, 
  Star,
  MessageCircle,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface Mentorship {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: string;
  start_date?: string;
  end_date?: string;
  goals: string[];
  progress: number;
  created_at: string;
  updated_at: string;
  mentor: {
    id: string;
    name: string;
    email: string;
    rank: string;
    xp: number;
    skill_points: number;
  };
  mentee: {
    id: string;
    name: string;
    email: string;
    rank: string;
    xp: number;
    skill_points: number;
  };
}

interface MentorshipManagerProps {
  userId: string;
  userRole: string; // 'mentor' or 'mentee'
}

export default function MentorshipManager({ userId, userRole }: MentorshipManagerProps) {
  const [activeTab, setActiveTab] = useState('requests');
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestForm, setRequestForm] = useState({
    menteeId: '',
    goals: ''
  });
  const [showRequestForm, setShowRequestForm] = useState(false);

  // Fetch mentorships
  useEffect(() => {
    const fetchMentorships = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('user_id', userId);
        params.append('role', userRole);
        
        const response = await fetch(`/api/mentorship?${params.toString()}`);
        const data = await response.json();
        
        if (data.success) {
          setMentorships(data.mentorships || []);
        } else {
          toast.error(data.error || 'Failed to fetch mentorships');
        }
      } catch (error) {
        console.error('Error fetching mentorships:', error);
        toast.error('Error fetching mentorships');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchMentorships();
    }
  }, [userId, userRole, activeTab]);

  const handleRequestMentorship = async () => {
    if (!requestForm.menteeId || !requestForm.goals.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/mentorship', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mentor_id: userId, // Current user is the mentor
          mentee_id: requestForm.menteeId,
          goals: [requestForm.goals]
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Mentorship request sent successfully');
        setShowRequestForm(false);
        setRequestForm({ menteeId: '', goals: '' });
        
        // Refresh mentorships
        const params = new URLSearchParams();
        params.append('user_id', userId);
        params.append('role', 'mentor');
        
        const refreshResponse = await fetch(`/api/mentorship?${params.toString()}`);
        const refreshData = await refreshResponse.json();
        
        if (refreshData.success) {
          setMentorships(refreshData.mentorships || []);
        }
      } else {
        toast.error(data.error || 'Failed to send mentorship request');
      }
    } catch (error) {
      console.error('Error requesting mentorship:', error);
      toast.error('Error requesting mentorship');
    }
  };

  const handleMentorshipAction = async (mentorshipId: string, action: 'approve' | 'reject' | 'complete' | 'terminate') => {
    try {
      const response = await fetch('/api/mentorship', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mentorship_id: mentorshipId,
          current_user_id: userId,
          action
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Mentorship ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action} successfully`);
        
        // Refresh mentorships
        const params = new URLSearchParams();
        params.append('user_id', userId);
        params.append('role', userRole);
        
        const refreshResponse = await fetch(`/api/mentorship?${params.toString()}`);
        const refreshData = await refreshResponse.json();
        
        if (refreshData.success) {
          setMentorships(refreshData.mentorships || []);
        }
      } else {
        toast.error(data.error || `Failed to ${action} mentorship`);
      }
    } catch (error) {
      console.error(`Error ${action}ing mentorship:`, error);
      toast.error(`Error ${action}ing mentorship`);
    }
  };

  const getMentorshipStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { variant: 'secondary', text: 'Pending', icon: <UserPlus className="h-4 w-4" /> };
      case 'active':
        return { variant: 'default', text: 'Active', icon: <UserCheck className="h-4 w-4" /> };
      case 'completed':
        return { variant: 'default', text: 'Completed', icon: <Star className="h-4 w-4" /> };
      case 'cancelled':
        return { variant: 'destructive', text: 'Cancelled', icon: <UserX className="h-4 w-4" /> };
      default:
        return { variant: 'outline', text: status, icon: null };
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'S': return 'text-yellow-500';
      case 'A': return 'text-red-500';
      case 'B': return 'text-blue-500';
      case 'C': return 'text-green-500';
      case 'D': return 'text-gray-500';
      case 'E': return 'text-purple-500';
      case 'F': return 'text-gray-300';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Mentorship Program</h2>
          <p className="text-muted-foreground">
            {userRole === 'mentor' 
              ? 'Manage your mentees and mentorship relationships' 
              : 'Connect with mentors to accelerate your growth'}
          </p>
        </div>
        
        {userRole === 'mentor' && (
          <Button onClick={() => setShowRequestForm(!showRequestForm)}>
            {showRequestForm ? 'Cancel Request' : 'Request Mentee'}
          </Button>
        )}
      </div>

      {showRequestForm && userRole === 'mentor' && (
        <Card>
          <CardHeader>
            <CardTitle>Request Mentee</CardTitle>
            <CardDescription>Send a mentorship request to an adventurer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Mentee ID</label>
                <input
                  type="text"
                  value={requestForm.menteeId}
                  onChange={(e) => setRequestForm({...requestForm, menteeId: e.target.value})}
                  placeholder="Enter mentee's user ID..."
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Goals</label>
                <Textarea
                  value={requestForm.goals}
                  onChange={(e) => setRequestForm({...requestForm, goals: e.target.value})}
                  placeholder="What are the mentorship goals? What skills should be developed?..."
                  rows={4}
                />
              </div>
              
              <Button onClick={handleRequestMentorship}>
                Send Request
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {mentorships.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Mentorships</h3>
                <p className="text-muted-foreground">
                  {userRole === 'mentor'
                    ? 'You have no mentorship requests or relationships yet'
                    : 'You\'re not currently in any mentorship relationships'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {mentorships
                .filter(m => {
                  if (activeTab === 'requests') return m.status === 'pending';
                  if (activeTab === 'active') return m.status === 'active';
                  return m.status === 'completed' || m.status === 'cancelled';
                })
                .map((mentorship) => {
                  const participant = userRole === 'mentor' ? mentorship.mentee : mentorship.mentor;
                  const statusBadge = getMentorshipStatusBadge(mentorship.status);
                  
                  return (
                    <Card key={mentorship.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {userRole === 'mentor' ? 'Mentee' : 'Mentor'}: {participant.name}
                            </CardTitle>
                            <div className="flex items-center mt-1 space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <span className={getRankColor(participant.rank)}>{participant.rank}</span>
                                <span className="mx-1">•</span>
                                <span>{participant.xp} XP</span>
                              </div>
                            </div>
                          </div>
                          
                          <Badge variant={statusBadge.variant as any}>
                            {statusBadge.icon && <span className="mr-1">{statusBadge.icon}</span>}
                            {statusBadge.text}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pb-4">
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-1">Goals</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {mentorship.goals.slice(0, 3).map((goal, idx) => (
                              <li key={idx} className="flex items-start">
                                <Target className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                                {goal}
                              </li>
                            ))}
                            {mentorship.goals.length > 3 && (
                              <li className="text-xs text-muted-foreground">
                                +{mentorship.goals.length - 3} more goals...
                              </li>
                            )}
                          </ul>
                        </div>
                        
                        {mentorship.status === 'active' && (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{mentorship.progress}%</span>
                            </div>
                            <Progress value={mentorship.progress} />
                          </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Started: {mentorship.start_date ? new Date(mentorship.start_date).toLocaleDateString() : 'N/A'}
                          </div>
                          {mentorship.end_date && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Ended: {new Date(mentorship.end_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </CardContent>
                      
                      <CardFooter className="flex justify-end space-x-2">
                        {mentorship.status === 'pending' && userRole === 'mentee' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMentorshipAction(mentorship.id, 'reject')}
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleMentorshipAction(mentorship.id, 'approve')}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                          </>
                        )}
                        
                        {mentorship.status === 'active' && userRole === 'mentor' && (
                          <Button
                            size="sm"
                            onClick={() => handleMentorshipAction(mentorship.id, 'complete')}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Complete
                          </Button>
                        )}
                        
                        {(mentorship.status === 'active') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMentorshipAction(mentorship.id, 'terminate')}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Terminate
                          </Button>
                        )}
                        
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}