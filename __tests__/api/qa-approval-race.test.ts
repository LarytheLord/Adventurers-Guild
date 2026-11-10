/**
 * Regression tests for #458: concurrent QA approvals must apply rewards once.
 *
 * The fake database below yields to the event loop on every call, so two
 * requests started together interleave the same way two real requests do:
 * both read the "before" state before either one writes. updateMany with a
 * status condition is atomic in the fake (check and write in one step), which
 * matches a single SQL UPDATE ... WHERE status = ... in Postgres.
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

type Row = Record<string, any>;

const state = {
  submission: {} as Row,
  assignment: {} as Row,
  quest: {} as Row,
  completions: [] as Row[],
  transactions: [] as Row[],
};
const xpAwards: unknown[][] = [];

const tick = () => new Promise<void>((resolve) => setImmediate(resolve));

function matches(row: Row, where: Row): boolean {
  return Object.entries(where).every(([key, cond]) => {
    if (cond && typeof cond === 'object' && !(cond instanceof Date)) {
      if ('not' in cond) return row[key] !== cond.not;
      if ('notIn' in cond) return !cond.notIn.includes(row[key]);
      if ('in' in cond) return cond.in.includes(row[key]);
    }
    return row[key] === cond;
  });
}

function table(getRow: () => Row, decorate: (row: Row) => Row = (r) => r) {
  return {
    findUnique: async () => {
      await tick();
      return decorate({ ...getRow() });
    },
    findUniqueOrThrow: async () => {
      await tick();
      return decorate({ ...getRow() });
    },
    update: async ({ data }: { data: Row }) => {
      await tick();
      Object.assign(getRow(), data);
      return { ...getRow() };
    },
    updateMany: async ({ where, data }: { where: Row; data: Row }) => {
      await tick();
      // Check and write happen in one synchronous step, like one SQL UPDATE.
      if (!matches(getRow(), where)) return { count: 0 };
      Object.assign(getRow(), data);
      return { count: 1 };
    },
  };
}

const fakeDb: Row = {
  questSubmission: table(
    () => state.submission,
    (s) => ({ ...s, assignment: { ...state.assignment, quest: { companyId: 'company-1' } } })
  ),
  questAssignment: table(
    () => state.assignment,
    (a) => ({
      ...a,
      quest: { ...state.quest, companyId: 'company-1' },
      user: { id: a.userId },
      submissions: [{ ...state.submission }],
    })
  ),
  quest: {
    findUnique: async () => {
      await tick();
      return { ...state.quest };
    },
    update: async () => {
      await tick();
      return { ...state.quest };
    },
  },
  questCompletion: {
    create: async ({ data }: { data: Row }) => {
      await tick();
      state.completions.push(data);
      return data;
    },
    upsert: async ({ where, create }: { where: Row; create: Row }) => {
      await tick();
      const key = where.questId_userId;
      const existing = state.completions.find(
        (c) => c.questId === key.questId && c.userId === key.userId
      );
      if (!existing) state.completions.push(create);
      return create;
    },
    count: async () => state.completions.length,
  },
  dailyUpdate: { count: async () => 0 },
  bootcampLink: { findUnique: async () => null, update: async () => ({}) },
  transaction: {
    create: async ({ data }: { data: Row }) => {
      await tick();
      state.transactions.push(data);
      return data;
    },
  },
};
fakeDb.$transaction = async (fn: (tx: Row) => Promise<unknown>) => fn(fakeDb);

jest.mock('@/lib/db', () => ({ prisma: fakeDb }));
jest.mock('@/lib/api-auth', () => {
  const admin = { id: 'admin-1', role: 'admin' };
  return {
    requireAuth: async () => admin,
    getAuthUser: async () => admin,
  };
});
jest.mock('@/lib/quest-lifecycle', () => ({ syncQuestLifecycleStatus: async () => undefined }));
jest.mock('@/lib/activity-logger', () => ({ logActivity: async () => undefined }));
jest.mock('@/lib/referral-utils', () => ({ processReferralMilestone: async () => undefined }));
jest.mock('@/lib/xp-utils', () => ({
  updateUserXpAndSkills: async (...args: unknown[]) => {
    await tick();
    xpAwards.push(args);
    return { newXp: 0, newLevel: 1, newRank: 'F', rankChanged: false };
  },
}));

function resetState(assignmentStatus: string) {
  state.submission = { id: 's1', assignmentId: 'a1', status: 'pending', reviewNotes: null };
  state.assignment = {
    id: 'a1',
    questId: 'q1',
    userId: 'u1',
    status: assignmentStatus,
    startedAt: new Date(),
    assignedAt: new Date(),
  };
  state.quest = {
    id: 'q1',
    title: 'Real quest',
    track: 'FRONTEND',
    source: 'COMPANY',
    xpReward: 100,
    skillPointsReward: 5,
    monetaryReward: 1000,
  };
  state.completions = [];
  state.transactions = [];
  xpAwards.length = 0;
}

function jsonRequest(method: string, body: unknown) {
  return new NextRequest('http://localhost:3000/api/test', {
    method,
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

describe('QA approval race (#458)', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  describe('PUT /api/quests/submissions', () => {
    beforeEach(() => resetState('submitted'));

    it('grants XP and payment once when two approvals run at the same time', async () => {
      const { PUT } = await import('@/app/api/quests/submissions/route');
      const body = { submissionId: 's1', status: 'approved', quality_score: 90 };

      const [a, b] = await Promise.all([
        PUT(jsonRequest('PUT', body)),
        PUT(jsonRequest('PUT', body)),
      ]);

      expect(xpAwards).toHaveLength(1);
      expect(state.transactions).toHaveLength(1);
      expect(state.completions).toHaveLength(1);
      expect([a.status, b.status].sort()).toEqual([200, 409]);
    });

    it('still approves a single request normally', async () => {
      const { PUT } = await import('@/app/api/quests/submissions/route');
      const res = await PUT(jsonRequest('PUT', { submissionId: 's1', status: 'approved', quality_score: 90 }));
      expect(res.status).toBe(200);
      expect(xpAwards).toHaveLength(1);
      expect(state.transactions).toHaveLength(1);
      expect(state.assignment.status).toBe('completed');
    });
  });

  describe('POST /api/qa/reviews', () => {
    beforeEach(() => resetState('submitted'));

    it('grants XP once when two approvals run at the same time', async () => {
      const { POST } = await import('@/app/api/qa/reviews/route');
      const body = { submissionId: 's1', status: 'approved', quality_score: 90 };

      const [a, b] = await Promise.all([
        POST(jsonRequest('POST', body)),
        POST(jsonRequest('POST', body)),
      ]);

      expect(xpAwards).toHaveLength(1);
      expect(state.completions).toHaveLength(1);
      expect([a.status, b.status].sort()).toEqual([200, 409]);
    });

    it('still approves a single request normally', async () => {
      const { POST } = await import('@/app/api/qa/reviews/route');
      const res = await POST(jsonRequest('POST', { submissionId: 's1', status: 'approved', quality_score: 90 }));
      expect(res.status).toBe(200);
      expect(xpAwards).toHaveLength(1);
      expect(state.assignment.status).toBe('completed');
    });
  });

  describe('PATCH /api/admin/qa-queue/[assignmentId]', () => {
    beforeEach(() => resetState('pending_admin_review'));
    const ctx = { params: Promise.resolve({ assignmentId: 'a1' }) };

    it('grants XP once when two approvals run at the same time', async () => {
      const { PATCH } = await import('@/app/api/admin/qa-queue/[assignmentId]/route');

      const [a, b] = await Promise.all([
        PATCH(jsonRequest('PATCH', { action: 'approve' }), ctx),
        PATCH(jsonRequest('PATCH', { action: 'approve' }), ctx),
      ]);

      expect(xpAwards).toHaveLength(1);
      expect(state.completions).toHaveLength(1);
      expect([a.status, b.status].sort()).toEqual([200, 409]);
    });

    it('lets only one of an approve and a reject win', async () => {
      const { PATCH } = await import('@/app/api/admin/qa-queue/[assignmentId]/route');

      const [a, b] = await Promise.all([
        PATCH(jsonRequest('PATCH', { action: 'approve' }), ctx),
        PATCH(jsonRequest('PATCH', { action: 'reject', notes: 'needs work' }), ctx),
      ]);

      if (state.assignment.status === 'completed') {
        expect(xpAwards).toHaveLength(1);
      } else {
        expect(state.assignment.status).toBe('needs_rework');
        expect(xpAwards).toHaveLength(0);
      }
      expect([a.status, b.status].sort()).toEqual([200, 409]);
    });
  });
  describe('reject vs approve on POST /api/qa/reviews', () => {
    beforeEach(() => resetState('submitted'));

    it.each(['rejected', 'needs_rework'])('lets only one of an approve and a %s win', async (other) => {
      const { POST } = await import('@/app/api/qa/reviews/route');

      const [a, b] = await Promise.all([
        POST(jsonRequest('POST', { submissionId: 's1', status: 'approved', quality_score: 90 })),
        POST(jsonRequest('POST', { submissionId: 's1', status: other, quality_score: 40 })),
      ]);

      expect([a.status, b.status].sort()).toEqual([200, 409]);
      if (state.submission.status === 'approved') {
        expect(state.assignment.status).toBe('completed');
        expect(xpAwards).toHaveLength(1);
        expect(state.completions).toHaveLength(1);
      } else {
        expect(state.submission.status).toBe(other);
        expect(state.assignment.status).toBe('in_progress');
        expect(xpAwards).toHaveLength(0);
        expect(state.completions).toHaveLength(0);
      }
    });

    it('lets only one of two rejects win', async () => {
      const { POST } = await import('@/app/api/qa/reviews/route');
      const body = { submissionId: 's1', status: 'rejected', quality_score: 40 };

      const [a, b] = await Promise.all([POST(jsonRequest('POST', body)), POST(jsonRequest('POST', body))]);

      expect([a.status, b.status].sort()).toEqual([200, 409]);
    });
  });

  describe('reject vs approve on PUT /api/quests/submissions', () => {
    beforeEach(() => resetState('submitted'));

    it.each(['rejected', 'needs_rework'])('lets only one of an approve and a %s win', async (other) => {
      const { PUT } = await import('@/app/api/quests/submissions/route');

      const [a, b] = await Promise.all([
        PUT(jsonRequest('PUT', { submissionId: 's1', status: 'approved', quality_score: 90 })),
        PUT(jsonRequest('PUT', { submissionId: 's1', status: other, quality_score: 40 })),
      ]);

      expect([a.status, b.status].sort()).toEqual([200, 409]);
      if (state.submission.status === 'approved') {
        expect(state.assignment.status).toBe('completed');
        expect(xpAwards).toHaveLength(1);
      } else {
        expect(state.submission.status).toBe(other);
        expect(state.assignment.status).toBe('in_progress');
        expect(xpAwards).toHaveLength(0);
      }
    });
  });

  describe('cross-route double award (qa-queue approve, then submissions approve)', () => {
    beforeEach(() => resetState('pending_admin_review'));
    const ctx = { params: Promise.resolve({ assignmentId: 'a1' }) };

    it('qa-queue approve marks the submission approved', async () => {
      const { PATCH } = await import('@/app/api/admin/qa-queue/[assignmentId]/route');
      const res = await PATCH(jsonRequest('PATCH', { action: 'approve' }), ctx);
      expect(res.status).toBe(200);
      expect(state.submission.status).toBe('approved');
      expect(state.assignment.status).toBe('completed');
    });

    it('PUT /api/quests/submissions cannot approve afterwards', async () => {
      const { PATCH } = await import('@/app/api/admin/qa-queue/[assignmentId]/route');
      const { PUT } = await import('@/app/api/quests/submissions/route');

      expect((await PATCH(jsonRequest('PATCH', { action: 'approve' }), ctx)).status).toBe(200);
      const res = await PUT(jsonRequest('PUT', { submissionId: 's1', status: 'approved', quality_score: 90 }));

      expect(res.status).toBe(409);
      expect(xpAwards).toHaveLength(1);
      expect(state.completions).toHaveLength(1);
      expect(state.transactions).toHaveLength(0);
    });

    it('POST /api/qa/reviews cannot approve afterwards', async () => {
      const { PATCH } = await import('@/app/api/admin/qa-queue/[assignmentId]/route');
      const { POST } = await import('@/app/api/qa/reviews/route');

      expect((await PATCH(jsonRequest('PATCH', { action: 'approve' }), ctx)).status).toBe(200);
      const res = await POST(jsonRequest('POST', { submissionId: 's1', status: 'approved', quality_score: 90 }));

      expect(res.status).toBe(409);
      expect(xpAwards).toHaveLength(1);
      expect(state.completions).toHaveLength(1);
    });

    it('the submission routes refuse a completed assignment even if the submission is still pending', async () => {
      // Rows approved before the qa-queue fix can have a completed assignment
      // and a submission that never left pending.
      state.assignment.status = 'completed';
      const { PUT } = await import('@/app/api/quests/submissions/route');
      const { POST } = await import('@/app/api/qa/reviews/route');

      const a = await PUT(jsonRequest('PUT', { submissionId: 's1', status: 'approved', quality_score: 90 }));
      const b = await POST(jsonRequest('POST', { submissionId: 's1', status: 'approved', quality_score: 90 }));

      expect([a.status, b.status]).toEqual([409, 409]);
      expect(xpAwards).toHaveLength(0);
      expect(state.completions).toHaveLength(0);
      expect(state.transactions).toHaveLength(0);
    });

    it('qa-queue approve and a submissions approve at the same time award once', async () => {
      const { PATCH } = await import('@/app/api/admin/qa-queue/[assignmentId]/route');
      const { PUT } = await import('@/app/api/quests/submissions/route');

      const [a, b] = await Promise.all([
        PATCH(jsonRequest('PATCH', { action: 'approve' }), ctx),
        PUT(jsonRequest('PUT', { submissionId: 's1', status: 'approved', quality_score: 90 })),
      ]);

      expect([a.status, b.status].sort()).toEqual([200, 409]);
      expect(xpAwards).toHaveLength(1);
      expect(state.completions).toHaveLength(1);
    });
  });
});
