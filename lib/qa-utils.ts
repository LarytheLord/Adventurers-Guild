// lib/qa-utils.ts
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Types
export interface Submission {
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

// Fetch submissions for review
export async function fetchSubmissionsForReview(
  reviewerId: string,
  status: 'pending' | 'under_review' | 'approved' | 'needs_rework' | 'rejected' | null = null
): Promise<Submission[]> {
  let query = supabase
    .from('quest_submissions')
    .select(`
      id,
      assignment_id,
      user_id,
      submission_content,
      submission_notes,
      submitted_at,
      status,
      reviewer_id,
      reviewed_at,
      review_notes,
      quality_score,
      quest_assignments (
        quest_id
      ),
      users (
        name,
        email,
        rank
      )
    `)
    .neq('status', 'approved') // Don't show already approved submissions
    .neq('status', 'rejected'); // Don't show already rejected submissions

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching submissions for review:', error);
    throw new Error('Failed to fetch submissions for review');
  }

  // Transform data to handle array access issues
  return data.map((item: any) => {
    const userData = Array.isArray(item.users) ? item.users[0] : item.users;
    const assignmentData = Array.isArray(item.quest_assignments) ? item.quest_assignments[0] : item.quest_assignments;
    return {
      ...item,
      users: userData || { name: '', email: '', rank: 'F' },
      quest_assignments: assignmentData
    };
  }) as Submission[];
}

// Fetch submissions by a specific user
export async function fetchUserSubmissions(
  userId: string,
  status?: 'pending' | 'under_review' | 'approved' | 'needs_rework' | 'rejected'
): Promise<Submission[]> {
  let query = supabase
    .from('quest_submissions')
    .select(`
      id,
      assignment_id,
      user_id,
      submission_content,
      submission_notes,
      submitted_at,
      status,
      reviewer_id,
      reviewed_at,
      review_notes,
      quality_score,
      quest_assignments (
        quest_id
      ),
      users (
        name,
        email,
        rank
      ),
      reviewers:users (
        name,
        email,
        rank
      )
    `)
    .eq('user_id', userId);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching user submissions:', error);
    throw new Error('Failed to fetch user submissions');
  }

  // Transform data to handle array access issues
  return data.map((item: any) => {
    const userData = Array.isArray(item.users) ? item.users[0] : item.users;
    const assignmentData = Array.isArray(item.quest_assignments) ? item.quest_assignments[0] : item.quest_assignments;
    const reviewerData = Array.isArray(item.reviewers) ? item.reviewers[0] : item.reviewers;
    return {
      ...item,
      users: userData || { name: '', email: '', rank: 'F' },
      quest_assignments: assignmentData,
      reviewers: reviewerData
    };
  }) as Submission[];
}

// Submit a review for a submission
export async function submitReview(
  submissionId: string,
  reviewerId: string,
  qualityScore: number,
  reviewNotes: string,
  status: 'approved' | 'needs_rework' | 'rejected'
): Promise<Submission | null> {
  try {
    const response = await fetch('/api/qa/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        submission_id: submissionId,
        reviewer_id: reviewerId,
        quality_score: qualityScore,
        review_notes: reviewNotes,
        status
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      return data.submission;
    } else {
      throw new Error(data.error || 'Failed to submit review');
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    throw new Error('Failed to submit review');
  }
}

// Get quality metrics for a user
export async function getUserQualityMetrics(userId: string): Promise<{
  totalSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  averageQualityScore: number;
  approvalRate: number;
}> {
  // Get all submissions by the user
  const { data: allSubmissions, error: submissionsError } = await supabase
    .from('quest_submissions')
    .select('*')
    .eq('user_id', userId);

  if (submissionsError) {
    console.error('Error fetching user submissions:', submissionsError);
    throw new Error('Failed to fetch user submissions');
  }

  // Calculate metrics
  const totalSubmissions = allSubmissions.length;
  const approvedSubmissions = allSubmissions.filter(s => s.status === 'approved').length;
  const rejectedSubmissions = allSubmissions.filter(s => s.status === 'rejected').length;
  
  // Calculate average quality score
  const scoredSubmissions = allSubmissions.filter(s => s.quality_score !== null);
  const totalScore = scoredSubmissions.reduce((sum, s) => sum + (s.quality_score || 0), 0);
  const averageQualityScore = scoredSubmissions.length > 0 
    ? totalScore / scoredSubmissions.length 
    : 0;
  
  const approvalRate = totalSubmissions > 0 
    ? (approvedSubmissions / totalSubmissions) * 100 
    : 0;

  return {
    totalSubmissions,
    approvedSubmissions,
    rejectedSubmissions,
    averageQualityScore,
    approvalRate
  };
}

// Get quality metrics for a reviewer
export async function getReviewerQualityMetrics(reviewerId: string): Promise<{
  totalReviews: number;
  averageQualityScore: number;
  approvalRate: number;
  avgReviewTimeHours: number;
}> {
  // Get all reviewed submissions by the reviewer
  const { data: reviewedSubmissions, error: submissionsError } = await supabase
    .from('quest_submissions')
    .select('*, reviewed_at, submitted_at, quality_score')
    .eq('reviewer_id', reviewerId)
    .not('reviewed_at', 'is', null); // Only reviewed submissions

  if (submissionsError) {
    console.error('Error fetching reviewed submissions:', submissionsError);
    throw new Error('Failed to fetch reviewed submissions');
  }

  // Calculate metrics
  const totalReviews = reviewedSubmissions.length;
  
  // Average quality score
  const totalScore = reviewedSubmissions.reduce((sum, s) => sum + (s.quality_score || 0), 0);
  const averageQualityScore = totalReviews > 0 ? totalScore / totalReviews : 0;
  
  // Approval rate
  const approvedSubmissions = reviewedSubmissions.filter(s => s.status === 'approved').length;
  const approvalRate = totalReviews > 0 ? (approvedSubmissions / totalReviews) * 100 : 0;
  
  // Average review time
  const reviewTimes = reviewedSubmissions
    .filter(s => s.reviewed_at && s.submitted_at)
    .map(s => {
      const submittedAt = new Date(s.submitted_at).getTime();
      const reviewedAt = new Date(s.reviewed_at!).getTime();
      return (reviewedAt - submittedAt) / (1000 * 60 * 60); // Convert to hours
    });
  
  const avgReviewTimeHours = reviewTimes.length > 0 
    ? reviewTimes.reduce((sum, time) => sum + time, 0) / reviewTimes.length 
    : 0;

  return {
    totalReviews,
    averageQualityScore,
    approvalRate,
    avgReviewTimeHours
  };
}