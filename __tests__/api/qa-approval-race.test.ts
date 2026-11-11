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
// One entry per transaction: the tables it took a row lock on, in order.
const lockLog: string[][] = [];

const tick = () => new Promise<void>((resolve) => setImmediate(resolve));

function matches(row: Row, where: Row): boolean {
  return Object.entries(where).every(([key, cond]) => {
    if (cond && typeof cond === 'object' && !(cond instanceof Date)) {
      // Every operator in the filter has to hold, like a Prisma filter object.
      return Object.entries(cond).every(([op, val]) => {
        if (op === 'not') return row[key] !== val;
        if (op === 'notIn') return !(val as unknown[]).includes(row[key]);
        if (op === 'in') return (val as unknown[]).includes(row[key]);
        if (op === 'equals') return row[key] === val;
        throw new Error(`fake db: unsupported operator ${op}`);
      });
    }
    return row[key] === cond;
  });
}

/**
 * Row locks. A write takes the lock on its row and holds it until the
 * transaction ends, like a Postgres UPDATE does. A transaction that waits for a
 * lock someone else holds, while that someone waits for one of ours, gets the
 * 40P01 deadlock error. Both tables have a single row here, so the lock key is
 * the table name.
 */
class Tx {
  held = new Set<string>();
  undo: Array<() => void> = [];
  waitingKey: string | null = null;
  locks: string[] = [];
}
const owners = new Map<string, Tx>();
const waiters = new Map<string, Array<() => void>>();
let holdAfterFirstLock = false;

async function acquire(tx: Tx, key: string): Promise<void> {
  for (;;) {
    const owner = owners.get(key);
    if (!owner || owner === tx) {
      owners.set(key, tx);
      if (!tx.held.has(key)) {
        tx.held.add(key);
        tx.locks.push(key);
        // Optional pause after the first lock so concurrent requests are all
        // holding their first row before anyone asks for a second one.
        if (holdAfterFirstLock && tx.locks.length === 1) {
          for (let i = 0; i < 8; i++) await tick();
        }
      }
      return;
    }
    // Deadlock check: follow owner -> what the owner waits for -> its owner ...
    let cur: Tx | undefined = owner;
    while (cur) {
      if (cur === tx) {
        throw Object.assign(new Error('deadlock detected (40P01)'), { code: '40P01' });
      }
      cur = cur.waitingKey ? owners.get(cur.waitingKey) : undefined;
    }
    tx.waitingKey = key;
    await new Promise<void>((resolve) => {
      const list = waiters.get(key) ?? [];
      list.push(resolve);
      waiters.set(key, list);
    });
    tx.waitingKey = null;
  }
}

function release(tx: Tx) {
  for (const key of tx.held) {
    if (owners.get(key) === tx) owners.delete(key);
    const list = waiters.get(key) ?? [];
    waiters.delete(key);
    list.forEach((wake) => wake());
  }
  tx.held.clear();
}

async function write<T>(tx: Tx | null, key: string, fn: (t: Tx) => T): Promise<T> {
  // Outside a transaction a write is its own statement: lock, write, unlock.
  const own = tx ?? new Tx();
  try {
    await acquire(own, key);
    return fn(own);
  } finally {
    if (!tx) release(own);
  }
}

function snapshot(row: Row, tx: Tx) {
  const before = { ...row };
  tx.undo.push(() => {
    Object.keys(row).forEach((k) => delete row[k]);
    Object.assign(row, before);
  });
}

function table(
  key: string,
  getRow: () => Row,
  decorate: (row: Row) => Row = (r) => r
) {
  return (tx: Tx | null) => ({
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
      return write(tx, key, (t) => {
        snapshot(getRow(), t);
        Object.assign(getRow(), data);
        return { ...getRow() };
      });
    },
    updateMany: async ({ where, data }: { where: Row; data: Row }) => {
      await tick();
      // Lock first, then check the filter against the row as it is now
      // (Postgres re-checks the WHERE after waiting for a row lock).
      return write(tx, key, (t) => {
        if (!matches(getRow(), where)) return { count: 0 };
        snapshot(getRow(), t);
        Object.assign(getRow(), data);
        return { count: 1 };
      });
    },
  });
}

const submissionTable = table(
  'questSubmission',
  () => state.submission,
  (s) => ({ ...s, assignment: { ...state.assignment, quest: { companyId: 'company-1' } } })
);
const assignmentTable = table(
  'questAssignment',
  () => state.assignment,
  (a) => ({
    ...a,
    quest: { ...state.quest, companyId: 'company-1' },
    user: { id: a.userId },
    submissions: [{ ...state.submission }],
  })
);

function client(tx: Tx | null): Row {
  return {
    questSubmission: submissionTable(tx),
    questAssignment: assignmentTable(tx),
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
        const k = where.questId_userId;
        const existing = state.completions.find((c) => c.questId === k.questId && c.userId === k.userId);
        if (!existing) {
          state.completions.push(create);
          tx?.undo.push(() => {
            state.completions.splice(state.completions.indexOf(create), 1);
          });
        }
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
}

const fakeDb: Row = client(null);
fakeDb.$transaction = async (fn: (tx: Row) => Promise<unknown>) => {
  const tx = new Tx();
  try {
    const result = await fn(client(tx));
    return result;
  } catch (err) {
    // Roll back this transaction's writes (safe: its row locks are still held).
    tx.undo.reverse().forEach((undo) => undo());
    throw err;
  } finally {
    lockLog.push(tx.locks);
    release(tx);
  }
};

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
  lockLog.length = 0;
  holdAfterFirstLock = false;
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

  describe('lock order: assignment row first, then submission row', () => {
    const ctx = { params: Promise.resolve({ assignmentId: 'a1' }) };

    // Each case runs one request and checks the order of row locks its
    // transaction took. Two routes that take the same two locks in opposite
    // orders can deadlock (Postgres 40P01).
    const cases: Array<[string, () => Promise<Response>, string]> = [
      ['PUT /api/quests/submissions approved', async () => (await import('@/app/api/quests/submissions/route')).PUT(jsonRequest('PUT', { submissionId: 's1', status: 'approved', quality_score: 90 })), 'submitted'],
      ['PUT /api/quests/submissions rejected', async () => (await import('@/app/api/quests/submissions/route')).PUT(jsonRequest('PUT', { submissionId: 's1', status: 'rejected', quality_score: 40 })), 'submitted'],
      ['PUT /api/quests/submissions needs_rework', async () => (await import('@/app/api/quests/submissions/route')).PUT(jsonRequest('PUT', { submissionId: 's1', status: 'needs_rework', quality_score: 40 })), 'submitted'],
      ['POST /api/qa/reviews approved', async () => (await import('@/app/api/qa/reviews/route')).POST(jsonRequest('POST', { submissionId: 's1', status: 'approved', quality_score: 90 })), 'submitted'],
      ['POST /api/qa/reviews rejected', async () => (await import('@/app/api/qa/reviews/route')).POST(jsonRequest('POST', { submissionId: 's1', status: 'rejected', quality_score: 40 })), 'submitted'],
      ['POST /api/qa/reviews needs_rework', async () => (await import('@/app/api/qa/reviews/route')).POST(jsonRequest('POST', { submissionId: 's1', status: 'needs_rework', quality_score: 40 })), 'submitted'],
      ['PATCH qa-queue approve', async () => (await import('@/app/api/admin/qa-queue/[assignmentId]/route')).PATCH(jsonRequest('PATCH', { action: 'approve' }), ctx), 'pending_admin_review'],
      ['PATCH qa-queue reject', async () => (await import('@/app/api/admin/qa-queue/[assignmentId]/route')).PATCH(jsonRequest('PATCH', { action: 'reject', notes: 'redo it' }), ctx), 'pending_admin_review'],
    ];

    it.each(cases)('%s', async (_name, run, assignmentStatus) => {
      resetState(assignmentStatus);
      const res = await run();
      expect(res.status).toBe(200);
      expect(lockLog).toHaveLength(1);
      expect(lockLog[0]).toContain('questAssignment');
      expect(lockLog[0]).toContain('questSubmission');
      expect(lockLog[0].indexOf('questAssignment')).toBeLessThan(lockLog[0].indexOf('questSubmission'));
    });
  });

  describe('no deadlock when routes with different entry points overlap', () => {
    const ctx = { params: Promise.resolve({ assignmentId: 'a1' }) };

    async function settle(...calls: Array<Promise<Response>>) {
      const results = await Promise.allSettled(calls);
      // A deadlock victim either throws or comes back as a 500.
      const rejected = results.filter((r) => r.status === 'rejected');
      expect(rejected).toEqual([]);
      return results.map((r) => (r as PromiseFulfilledResult<Response>).value.status);
    }

    beforeEach(() => {
      resetState('pending_admin_review');
      holdAfterFirstLock = true;
    });

    it('qa-queue approve and PUT /api/quests/submissions approve', async () => {
      const { PATCH } = await import('@/app/api/admin/qa-queue/[assignmentId]/route');
      const { PUT } = await import('@/app/api/quests/submissions/route');
      const statuses = await settle(
        PATCH(jsonRequest('PATCH', { action: 'approve' }), ctx),
        PUT(jsonRequest('PUT', { submissionId: 's1', status: 'approved', quality_score: 90 }))
      );
      expect(statuses.sort()).toEqual([200, 409]);
      expect(xpAwards).toHaveLength(1);
    });

    it('qa-queue approve and POST /api/qa/reviews approve', async () => {
      const { PATCH } = await import('@/app/api/admin/qa-queue/[assignmentId]/route');
      const { POST } = await import('@/app/api/qa/reviews/route');
      const statuses = await settle(
        PATCH(jsonRequest('PATCH', { action: 'approve' }), ctx),
        POST(jsonRequest('POST', { submissionId: 's1', status: 'approved', quality_score: 90 }))
      );
      expect(statuses.sort()).toEqual([200, 409]);
      expect(xpAwards).toHaveLength(1);
    });

    it('qa-queue reject and PUT /api/quests/submissions rejected', async () => {
      const { PATCH } = await import('@/app/api/admin/qa-queue/[assignmentId]/route');
      const { PUT } = await import('@/app/api/quests/submissions/route');
      await settle(
        PATCH(jsonRequest('PATCH', { action: 'reject', notes: 'redo it' }), ctx),
        PUT(jsonRequest('PUT', { submissionId: 's1', status: 'rejected', quality_score: 40 }))
      );
    });

    it('PUT /api/quests/submissions approve and POST /api/qa/reviews rejected', async () => {
      resetState('submitted');
      holdAfterFirstLock = true;
      const { PUT } = await import('@/app/api/quests/submissions/route');
      const { POST } = await import('@/app/api/qa/reviews/route');
      await settle(
        PUT(jsonRequest('PUT', { submissionId: 's1', status: 'approved', quality_score: 90 })),
        POST(jsonRequest('POST', { submissionId: 's1', status: 'rejected', quality_score: 40 }))
      );
      expect(xpAwards.length).toBeLessThanOrEqual(1);
    });
  });

  describe('an approved submission cannot be rejected or sent back', () => {
    const ctx = { params: Promise.resolve({ assignmentId: 'a1' }) };

    beforeEach(() => {
      resetState('completed');
      state.submission.status = 'approved';
      state.completions.push({ questId: 'q1', userId: 'u1', xpEarned: 100 });
    });

    it.each(['rejected', 'needs_rework'])('PUT /api/quests/submissions refuses %s', async (other) => {
      const { PUT } = await import('@/app/api/quests/submissions/route');
      const res = await PUT(jsonRequest('PUT', { submissionId: 's1', status: other, quality_score: 40 }));
      expect(res.status).toBe(409);
      expect(state.submission.status).toBe('approved');
      expect(state.assignment.status).toBe('completed');
    });

    it.each(['rejected', 'needs_rework'])('POST /api/qa/reviews refuses %s', async (other) => {
      const { POST } = await import('@/app/api/qa/reviews/route');
      const res = await POST(jsonRequest('POST', { submissionId: 's1', status: other, quality_score: 40 }));
      expect(res.status).toBe(409);
      expect(state.submission.status).toBe('approved');
      expect(state.assignment.status).toBe('completed');
    });

    it('qa-queue reject refuses when the latest submission is already approved', async () => {
      state.assignment.status = 'pending_admin_review';
      const { PATCH } = await import('@/app/api/admin/qa-queue/[assignmentId]/route');
      const res = await PATCH(jsonRequest('PATCH', { action: 'reject', notes: 'redo it' }), ctx);
      expect(res.status).toBe(409);
      expect(state.submission.status).toBe('approved');
      expect(state.assignment.status).toBe('pending_admin_review');
    });
  });
});
