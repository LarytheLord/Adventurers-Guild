import {
  fetchSubmissionsForReview,
  fetchUserSubmissions,
  submitReview,
  getUserQualityMetrics,
  getReviewerQualityMetrics,
} from '@/lib/qa-utils';

jest.mock('@/lib/db', () => ({
  prisma: { questSubmission: { findMany: jest.fn() } },
}));

import { prisma } from '@/lib/db';

const findMany = prisma.questSubmission.findMany as unknown as jest.Mock;

beforeEach(() => {
  findMany.mockReset();
});

describe('fetchSubmissionsForReview', () => {
  it('excludes finished statuses by default', async () => {
    findMany.mockResolvedValue([]);
    await fetchSubmissionsForReview('r1');
    expect(findMany.mock.calls[0][0].where).toEqual({
      status: { notIn: ['approved', 'rejected', 'superseded'] },
    });
  });

  it('filters to an exact status when one is given', async () => {
    findMany.mockResolvedValue([]);
    await fetchSubmissionsForReview('r1', 'needs_rework');
    expect(findMany.mock.calls[0][0].where).toEqual({ status: 'needs_rework' });
  });

  it('returns what the query returns', async () => {
    const rows = [{ id: 's1' }];
    findMany.mockResolvedValue(rows);
    await expect(fetchSubmissionsForReview('r1')).resolves.toBe(rows);
  });
});

describe('fetchUserSubmissions', () => {
  it('scopes to the user and orders newest first', async () => {
    findMany.mockResolvedValue([]);
    await fetchUserSubmissions('u1');
    const arg = findMany.mock.calls[0][0];
    expect(arg.where).toEqual({ userId: 'u1' });
    expect(arg.orderBy).toEqual({ submittedAt: 'desc' });
  });

  it('adds the status filter when provided', async () => {
    findMany.mockResolvedValue([]);
    await fetchUserSubmissions('u1', 'approved');
    expect(findMany.mock.calls[0][0].where).toEqual({ userId: 'u1', status: 'approved' });
  });
});

describe('submitReview', () => {
  const originalFetch = global.fetch;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    global.fetch = originalFetch;
    errorSpy.mockRestore();
  });

  it('posts the review payload and returns the submission', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      json: async () => ({ success: true, submission: { id: 's1' } }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await submitReview('s1', 'r1', 8, 'good', 'approved');

    expect(result).toEqual({ id: 's1' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/qa/reviews');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({
      submissionId: 's1',
      reviewer_id: 'r1',
      quality_score: 8,
      review_notes: 'good',
      status: 'approved',
    });
  });

  it('throws a generic error when the API reports failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ success: false, error: 'nope' }),
    }) as unknown as typeof fetch;
    await expect(submitReview('s1', 'r1', 1, '', 'rejected')).rejects.toThrow(
      'Failed to submit review'
    );
  });

  it('throws when the network call rejects', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;
    await expect(submitReview('s1', 'r1', 1, '', 'rejected')).rejects.toThrow(
      'Failed to submit review'
    );
  });
});

describe('getUserQualityMetrics', () => {
  it('returns zeros for a user with no submissions', async () => {
    findMany.mockResolvedValue([]);
    await expect(getUserQualityMetrics('u1')).resolves.toEqual({
      totalSubmissions: 0,
      approvedSubmissions: 0,
      rejectedSubmissions: 0,
      averageQualityScore: 0,
      approvalRate: 0,
    });
  });

  it('counts statuses and averages only scored submissions', async () => {
    findMany.mockResolvedValue([
      { status: 'approved', qualityScore: 8 },
      { status: 'approved', qualityScore: 6 },
      { status: 'rejected', qualityScore: null },
      { status: 'pending', qualityScore: null },
    ]);
    await expect(getUserQualityMetrics('u1')).resolves.toEqual({
      totalSubmissions: 4,
      approvedSubmissions: 2,
      rejectedSubmissions: 1,
      averageQualityScore: 7,
      approvalRate: 50,
    });
  });
});

describe('getReviewerQualityMetrics', () => {
  it('returns zeros when the reviewer has reviewed nothing', async () => {
    findMany.mockResolvedValue([]);
    await expect(getReviewerQualityMetrics('r1')).resolves.toEqual({
      totalReviews: 0,
      averageQualityScore: 0,
      approvalRate: 0,
      avgReviewTimeHours: 0,
    });
  });

  it('computes averages, approval rate and review time in hours', async () => {
    findMany.mockResolvedValue([
      {
        status: 'approved',
        qualityScore: 9,
        submittedAt: new Date('2026-01-01T00:00:00Z'),
        reviewedAt: new Date('2026-01-01T02:00:00Z'),
      },
      {
        status: 'rejected',
        qualityScore: 3,
        submittedAt: new Date('2026-01-01T00:00:00Z'),
        reviewedAt: new Date('2026-01-01T04:00:00Z'),
      },
    ]);
    await expect(getReviewerQualityMetrics('r1')).resolves.toEqual({
      totalReviews: 2,
      averageQualityScore: 6,
      approvalRate: 50,
      avgReviewTimeHours: 3,
    });
  });

  it('treats a missing quality score as 0 and skips rows without timestamps in review time', async () => {
    findMany.mockResolvedValue([
      { status: 'approved', qualityScore: null, submittedAt: null, reviewedAt: null },
    ]);
    await expect(getReviewerQualityMetrics('r1')).resolves.toEqual({
      totalReviews: 1,
      averageQualityScore: 0,
      approvalRate: 100,
      avgReviewTimeHours: 0,
    });
  });
});
