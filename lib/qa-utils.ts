// lib/qa-utils.ts
import { prisma } from './db';
import { Prisma, SubmissionStatus } from '@prisma/client';

// Fetch submissions for review
export async function fetchSubmissionsForReview(
  _reviewerId: string,
  status: string | null = null
) {
  const where: Prisma.QuestSubmissionWhereInput = {
    status: { notIn: ['approved', 'rejected'] },
  };

  if (status) {
    where.status = status as SubmissionStatus;
  }

  const submissions = await prisma.questSubmission.findMany({
    where,
    include: {
      user: { select: { name: true, email: true, rank: true } },
      assignment: { select: { questId: true } },
    },
  });

  return submissions;
}

// Fetch submissions by a specific user
export async function fetchUserSubmissions(userId: string, status?: string) {
  const where: Prisma.QuestSubmissionWhereInput = { userId };
  if (status) where.status = status as Prisma.QuestSubmissionWhereInput['status'];

  return prisma.questSubmission.findMany({
    where,
    include: {
      user: { select: { name: true, email: true, rank: true } },
      reviewer: { select: { name: true, email: true, rank: true } },
      assignment: { select: { questId: true } },
    },
    orderBy: { submittedAt: 'desc' },
  });
}

// Submit a review for a submission
export async function submitReview(
  submissionId: string,
  reviewerId: string,
  qualityScore: number,
  reviewNotes: string,
  status: 'approved' | 'needs_rework' | 'rejected'
) {
  try {
    const response = await fetch('/api/qa/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissionId: submissionId,
        reviewer_id: reviewerId,
        quality_score: qualityScore,
        review_notes: reviewNotes,
        status,
      }),
    });

    const data = await response.json();
    if (data.success) return data.submission;
    throw new Error(data.error || 'Failed to submit review');
  } catch (error) {
    console.error('Error submitting review:', error);
    throw new Error('Failed to submit review');
  }
}

// Get quality metrics for a user
export async function getUserQualityMetrics(userId: string) {
  const allSubmissions = await prisma.questSubmission.findMany({
    where: { userId },
  });

  const totalSubmissions = allSubmissions.length;
  const approvedSubmissions = allSubmissions.filter((s) => s.status === 'approved').length;
  const rejectedSubmissions = allSubmissions.filter((s) => s.status === 'rejected').length;

  const scoredSubmissions = allSubmissions.filter((s) => s.qualityScore !== null);
  const totalScore = scoredSubmissions.reduce((sum, s) => sum + (s.qualityScore || 0), 0);
  const averageQualityScore = scoredSubmissions.length > 0 ? totalScore / scoredSubmissions.length : 0;

  const approvalRate = totalSubmissions > 0 ? (approvedSubmissions / totalSubmissions) * 100 : 0;

  return { totalSubmissions, approvedSubmissions, rejectedSubmissions, averageQualityScore, approvalRate };
}

// Get quality metrics for a reviewer
export async function getReviewerQualityMetrics(reviewerId: string) {
  const reviewedSubmissions = await prisma.questSubmission.findMany({
    where: { reviewerId, reviewedAt: { not: null } },
  });

  const totalReviews = reviewedSubmissions.length;
  const totalScore = reviewedSubmissions.reduce((sum, s) => sum + (s.qualityScore || 0), 0);
  const averageQualityScore = totalReviews > 0 ? totalScore / totalReviews : 0;

  const approvedSubmissions = reviewedSubmissions.filter((s) => s.status === 'approved').length;
  const approvalRate = totalReviews > 0 ? (approvedSubmissions / totalReviews) * 100 : 0;

  const reviewTimes = reviewedSubmissions
    .filter((s) => s.reviewedAt && s.submittedAt)
    .map((s) => {
      const submittedAt = new Date(s.submittedAt).getTime();
      const reviewedAt = new Date(s.reviewedAt!).getTime();
      return (reviewedAt - submittedAt) / (1000 * 60 * 60);
    });

  const avgReviewTimeHours =
    reviewTimes.length > 0 ? reviewTimes.reduce((sum, time) => sum + time, 0) / reviewTimes.length : 0;

  return { totalReviews, averageQualityScore, approvalRate, avgReviewTimeHours };
}
