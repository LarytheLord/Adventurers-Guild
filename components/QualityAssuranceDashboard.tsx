// components/QualityAssuranceDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Star,
  Users,
  Target,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface Submission {
  id: string;
  assignment_id: string;
  user_id: string;
  submission_content: string;
  submission_notes?: string;
  submitted_at: string;
  status: string;
  reviewer_id?: string;
  reviewed_at?: string;
  review_notes?: string;
  quality_score?: number;
  users: {
    name: string;
    email: string;
    rank: string;
  };
  reviewers?: {
    name: string;
    email: string;
    rank: string;
  };
  quest_assignments: {
    quest_id: string;
  };
}

interface QualityMetrics {
  totalSubmissions: number;
  reviewedSubmissions: number;
  averageQualityScore: number;
  approvalRate: number;
}

interface QualityAssuranceDashboardProps {
  userId: string;
  userRole: string; // 'admin', 'reviewer', 'adventurer'
}

export default function QualityAssuranceDashboard({ userId, userRole }: QualityAssuranceDashboardProps) {
  const [activeTab, setActiveTab] = useState('pending');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [metrics, setMetrics] = useState<QualityMetrics>({
    totalSubmissions: 0,
    reviewedSubmissions: 0,
    averageQualityScore: 0,
    approvalRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [reviewForm, setReviewForm] = useState({
    submissionId: '',
    qualityScore: 8,
    reviewNotes: '',
    status: 'approved'
  });

  // Fetch submissions based on user role and active tab
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        
        // Determine status based on active tab
        let statusFilter = '';
        if (activeTab === 'pending') statusFilter = 'pending';
        else if (activeTab === 'review') statusFilter = 'under_review';
        else if (activeTab === 'approved') statusFilter = 'approved';
        else if (activeTab === 'rework') statusFilter = 'needs_rework';
        else if (activeTab === 'rejected') statusFilter = 'rejected';
        
        let url = `/api/qa/reviews`;
        const params = new URLSearchParams();
        
        if (statusFilter) params.append('status', statusFilter);
        
        // If user is not admin or reviewer, only show their submissions
        if (userRole !== 'admin' && userRole !== 'reviewer') {
          params.append('user_id', userId);
        }
        
        url += `?${params.toString()}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          setSubmissions(data.submissions);
        } else {
          toast.error(data.error || 'Failed to fetch submissions');
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
        toast.error('Error fetching submissions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [activeTab, userId, userRole]);

  // Fetch quality metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      // In a real implementation, this would call an API to get metrics
      // For now, we'll simulate the data
      setMetrics({
        totalSubmissions: 128,
        reviewedSubmissions: 95,
        averageQualityScore: 7.8,
        approvalRate: 78
      });
    };

    fetchMetrics();
  }, []);

  const handleReviewSubmission = async () => {
    try {
      const response = await fetch('/api/qa/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submission_id: reviewForm.submissionId,
          reviewer_id: userId,
          quality_score: reviewForm.qualityScore,
          review_notes: reviewForm.reviewNotes,
          status: reviewForm.status
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Submission reviewed successfully');
        
        // Reset form and close modal
        setReviewForm({
          submissionId: '',
          qualityScore: 8,
          reviewNotes: '',
          status: 'approved'
        });
        setSelectedSubmission(null);
        
        // Refresh submissions list
        const params = new URLSearchParams();
        params.append('status', activeTab === 'pending' ? 'pending' : activeTab);
        
        const refreshResponse = await fetch(`/api/qa/reviews?${params.toString()}`);
        const refreshData = await refreshResponse.json();
        
        if (refreshData.success) {
          setSubmissions(refreshData.submissions);
        }
      } else {
        toast.error(data.error || 'Failed to review submission');
      }
    } catch (error) {
      console.error('Error reviewing submission:', error);
      toast.error('Error reviewing submission');
    }
  };

  const getSubmissionStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { variant: 'secondary', text: 'Pending', icon: <AlertTriangle className="h-4 w-4" /> };
      case 'under_review':
        return { variant: 'outline', text: 'In Review', icon: <Eye className="h-4 w-4" /> };
      case 'approved':
        return { variant: 'default', text: 'Approved', icon: <CheckCircle className="h-4 w-4" /> };
      case 'needs_rework':
        return { variant: 'destructive', text: 'Rework', icon: <XCircle className="h-4 w-4" /> };
      case 'rejected':
        return { variant: 'destructive', text: 'Rejected', icon: <XCircle className="h-4 w-4" /> };
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

  const startReview = (submission: Submission) => {
    setSelectedSubmission(submission);
    setReviewForm({
      submissionId: submission.id,
      qualityScore: submission.quality_score || 8,
      reviewNotes: submission.review_notes || '',
      status: 'approved'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Quality Assurance</h2>
          <p className="text-muted-foreground">
            {userRole === 'admin' || userRole === 'reviewer' 
              ? 'Review submissions and maintain quality standards' 
              : 'Track your submission reviews and quality scores'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviewed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.reviewedSubmissions}</div>
            <p className="text-xs text-muted-foreground">{Math.round(metrics.approvalRate)}% reviewed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Quality Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageQualityScore.toFixed(1)}/10</div>
            <p className="text-xs text-muted-foreground">+0.3 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.approvalRate}%</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="review">In Review</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rework">Needs Rework</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : submissions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Submissions</h3>
                <p className="text-muted-foreground">
                  {activeTab === 'pending' 
                    ? 'There are no submissions pending review' 
                    : `There are no submissions with status: ${activeTab}`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Submission Queue</CardTitle>
                <CardDescription>
                  {submissions.length} submission{submissions.length !== 1 ? 's' : ''} in queue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Adventurer</TableHead>
                      <TableHead>Submission</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => {
                      const statusBadge = getSubmissionStatusBadge(submission.status);
                      return (
                        <TableRow key={submission.id}>
                          <TableCell>
                            <div className="font-medium">{submission.users.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <span className={getRankColor(submission.users.rank)}>
                                {submission.users.rank}-Rank
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">{submission.submission_content.substring(0, 50)}...</div>
                          </TableCell>
                          <TableCell>
                            {new Date(submission.submitted_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusBadge.variant as any}>
                              {statusBadge.icon && <span className="mr-1">{statusBadge.icon}</span>}
                              {statusBadge.text}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {submission.quality_score ? (
                              <div className="flex items-center">
                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 mr-1" />
                                {submission.quality_score}/10
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {(userRole === 'admin' || userRole === 'reviewer') && 
                                 (submission.status === 'pending' || submission.status === 'under_review') && (
                                <Button 
                                  size="sm"
                                  onClick={() => startReview(submission)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Review
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => console.log('View details:', submission.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Modal */}
      {selectedSubmission && (
        <Card className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <CardContent className="max-w-2xl w-full bg-background p-6 rounded-lg">
            <CardHeader>
              <CardTitle>Review Submission</CardTitle>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{selectedSubmission.users.name}</div>
                  <div className="text-sm text-muted-foreground">
                    <span className={getRankColor(selectedSubmission.users.rank)}>
                      {selectedSubmission.users.rank}-Rank
                    </span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Submitted: {new Date(selectedSubmission.submitted_at).toLocaleString()}
                </div>
              </div>
            </CardHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Submission Content</h4>
                <div className="bg-muted p-4 rounded-md">
                  {selectedSubmission.submission_content}
                </div>
              </div>
              
              {selectedSubmission.submission_notes && (
                <div>
                  <h4 className="font-medium mb-2">Adventurer Notes</h4>
                  <div className="bg-muted p-4 rounded-md">
                    {selectedSubmission.submission_notes}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Quality Score</label>
                  <div className="flex items-center mt-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        className={`h-8 w-8 rounded-full ${
                          num <= reviewForm.qualityScore
                            ? 'bg-primary text-primary-foreground'
                            : 'border'
                        }`}
                        onClick={() => setReviewForm({...reviewForm, qualityScore: num})}
                      >
                        {num}
                      </button>
                    ))}
                    <span className="ml-2">{reviewForm.qualityScore}/10</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="flex space-x-2 mt-1">
                    <Button
                      variant={reviewForm.status === 'approved' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setReviewForm({...reviewForm, status: 'approved'})}
                    >
                      Approve
                    </Button>
                    <Button
                      variant={reviewForm.status === 'needs_rework' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setReviewForm({...reviewForm, status: 'needs_rework'})}
                    >
                      Rework
                    </Button>
                    <Button
                      variant={reviewForm.status === 'rejected' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setReviewForm({...reviewForm, status: 'rejected'})}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Reviewer Notes</label>
                <Textarea
                  value={reviewForm.reviewNotes}
                  onChange={(e) => setReviewForm({...reviewForm, reviewNotes: e.target.value})}
                  placeholder="Provide feedback for the adventurer..."
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedSubmission(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReviewSubmission}
                >
                  Submit Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}