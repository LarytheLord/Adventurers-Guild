import { prisma } from '@/lib/db';
import { getUserQualityMetrics, getReviewerQualityMetrics } from '@/lib/qa-utils';

jest.mock('@/lib/db', () => ({
  prisma: { questSubmission: { findMany: jest.fn() } },
}));

const findMany = jest.mocked(prisma.questSubmission.findMany);
type Submission = Awaited<ReturnType<typeof prisma.questSubmission.findMany>>[number];

// Only fields read by the metric calculations are needed by these fixtures.
function submission(fields: Partial<Submission>): Submission {
  return { status: 'pending', qualityScore: null, submittedAt: null, reviewedAt: null,
    ...fields } as unknown as Submission;
}

beforeEach(() => jest.resetAllMocks());

describe('getUserQualityMetrics', () => {
  it('returns zero metrics for a user with no submissions', async () => {
    findMany.mockResolvedValue([]);
    await expect(getUserQualityMetrics('user-1')).resolves.toEqual({
      totalSubmissions: 0, approvedSubmissions: 0, rejectedSubmissions: 0,
      averageQualityScore: 0, approvalRate: 0,
    });
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
  });

  it('counts all statuses and includes zero scores while excluding null scores', async () => {
    const rows = Object.freeze([
      Object.freeze(submission({ status: 'approved', qualityScore: 80 })),
      Object.freeze(submission({ status: 'approved', qualityScore: 0 })),
      Object.freeze(submission({ status: 'rejected', qualityScore: 40 })),
      Object.freeze(submission({ status: 'needs_rework' })),
      Object.freeze(submission({ status: 'pending' })),
    ]);
    findMany.mockResolvedValue(rows as unknown as Submission[]);
    await expect(getUserQualityMetrics('user-1')).resolves.toEqual({
      totalSubmissions: 5, approvedSubmissions: 2, rejectedSubmissions: 1,
      averageQualityScore: 40, approvalRate: 40,
    });
  });

  it('returns zero average for nonempty submissions without scores', async () => {
    findMany.mockResolvedValue([submission({ status: 'approved' })]);
    await expect(getUserQualityMetrics('user-1')).resolves.toEqual({
      totalSubmissions: 1, approvedSubmissions: 1, rejectedSubmissions: 0,
      averageQualityScore: 0, approvalRate: 100,
    });
  });
});

describe('getReviewerQualityMetrics', () => {
  it('returns zero metrics when no reviews match', async () => {
    findMany.mockResolvedValue([]);
    await expect(getReviewerQualityMetrics('reviewer-1')).resolves.toEqual({
      totalReviews: 0, averageQualityScore: 0, approvalRate: 0, avgReviewTimeHours: 0,
    });
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({
      where: { reviewerId: 'reviewer-1', reviewedAt: { not: null } },
    });
  });

  it('averages scores over all reviews and times only timestamped rows', async () => {
    findMany.mockResolvedValue([
      submission({ status: 'approved', qualityScore: 90,
        submittedAt: new Date('2026-01-01T23:30:00Z'), reviewedAt: new Date('2026-01-02T01:00:00Z') }),
      submission({ status: 'rejected', qualityScore: null,
        submittedAt: new Date('2026-01-01T00:00:00Z'), reviewedAt: new Date('2026-01-02T00:00:00Z') }),
      submission({ status: 'approved', qualityScore: 0, reviewedAt: new Date('2026-01-02T00:00:00Z') }),
      submission({ status: 'needs_rework', qualityScore: 30, submittedAt: new Date('2026-01-01T00:00:00Z') }),
    ]);
    await expect(getReviewerQualityMetrics('reviewer-1')).resolves.toEqual({
      totalReviews: 4, averageQualityScore: 30, approvalRate: 50, avgReviewTimeHours: 12.75,
    });
  });

  it('returns zero review time for nonempty results with no timestamp pairs', async () => {
    findMany.mockResolvedValue([submission({ status: 'approved', qualityScore: 80 })]);
    await expect(getReviewerQualityMetrics('reviewer-1')).resolves.toEqual({
      totalReviews: 1, averageQualityScore: 80, approvalRate: 100, avgReviewTimeHours: 0,
    });
  });

  it('preserves fractional scores and negative elapsed times without rounding or clamping', async () => {
    findMany.mockResolvedValue([
      submission({ status: 'approved', qualityScore: 1,
        submittedAt: new Date('2026-01-01T02:00:00Z'), reviewedAt: new Date('2026-01-01T01:30:00Z') }),
      submission({ status: 'rejected', qualityScore: 0 }),
      submission({ status: 'rejected', qualityScore: 0 }),
    ]);
    const metrics = await getReviewerQualityMetrics('reviewer-1');
    expect(metrics.averageQualityScore).toBeCloseTo(1 / 3);
    expect(metrics.approvalRate).toBeCloseTo(100 / 3);
    expect(metrics.avgReviewTimeHours).toBe(-0.5);
  });
});

it.each([getUserQualityMetrics, getReviewerQualityMetrics])(
  'propagates database failures from %p', async (calculateMetrics) => {
    const error = new Error('read failed');
    findMany.mockRejectedValue(error);
    await expect(calculateMetrics('missing')).rejects.toBe(error);
  },
);
