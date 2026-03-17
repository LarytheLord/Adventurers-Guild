# Admin QA Mediation Layer — Full Specification

## Context

From the Open Paws org plan:
> "Open Paws mediates all client relations, QA, and payment. Clients never interact directly with students."

Currently, when a student submits work, it goes directly to `review` status and the company/client can see it immediately. This violates the mediation requirement.

This feature adds a QA gate: submissions from intern/bootcamp track quests must pass admin review before the client sees them. Admin can either:
- **Approve** → forward to client review (`review` status)
- **Reject** → send back to student with notes (`needs_rework` status)

OPEN track (professional, non-bootcamp, non-intern) quests skip this gate — they go directly to `review` as before.

---

## Submission Status Flow Change

### Before (current)
```
submitted → review → completed / needs_rework
```

### After (for BOOTCAMP and INTERN track quests)
```
submitted → pending_admin_review → review → completed / needs_rework
                                └→ needs_rework (admin rejects before client)
```

### OPEN track (no change)
```
submitted → review → completed / needs_rework
```

---

## Schema Changes

### Add `pending_admin_review` to `AssignmentStatus` enum

In `prisma/schema.prisma`:

```prisma
enum AssignmentStatus {
  assigned
  started
  in_progress
  submitted
  pending_admin_review   // ← ADD THIS
  review
  completed
  cancelled
  needs_rework
}
```

### Migration

```bash
npx prisma migrate dev --name add-pending-admin-review-status
```

---

## Logic Changes

### Submission endpoint: `POST /api/quests/[id]/submit` (or equivalent)

Find where `submissionStatus → 'submitted'` or `assignmentStatus → 'review'` is set on submission.

**Change**: After submission, check the quest's track:

```typescript
const quest = await db.quest.findUnique({ where: { id: questId }, select: { track: true } });

const nextStatus = quest.track === 'OPEN'
  ? AssignmentStatus.review
  : AssignmentStatus.pending_admin_review;

await db.assignment.update({
  where: { id: assignmentId },
  data: { status: nextStatus }
});
```

**File to modify**: Find the correct route in `app/api/quests/[id]/` — likely the route handling `PUT` or `POST` for submissions.

---

## New Admin Page: `/admin/qa-queue`

### Route: `app/admin/qa-queue/page.tsx`

**Data fetched**: All assignments with status `pending_admin_review`, with relations:
```typescript
db.assignment.findMany({
  where: { status: AssignmentStatus.pending_admin_review },
  include: {
    quest: {
      select: { title: true, track: true, difficulty: true, rewardXp: true }
    },
    user: {
      select: { name: true, email: true },
      include: {
        adventurerProfile: { select: { rank: true } },
        bootcampLink: { select: { cohort: true, bootcampTrack: true } }
      }
    },
    submissions: {
      orderBy: { submittedAt: 'desc' },
      take: 1
    }
  },
  orderBy: { updatedAt: 'asc' }  // oldest first — FIFO queue
})
```

**UI**:

```
┌─────────────────────────────────────────────────────────────────────┐
│  QA Queue  (N pending)                                              │
├─────────────────────────────────────────────────────────────────────┤
│  Quest           │ Student         │ Track    │ Submitted  │ Actions│
├──────────────────┼─────────────────┼──────────┼────────────┼────────┤
│ Fix navbar CSS   │ Abid Khan [E]   │ BOOTCAMP │ 2h ago     │ Review │
│ Auth API module  │ Sam T [D]       │ INTERN   │ 1d ago     │ Review │
└─────────────────────────────────────────────────────────────────────┘
```

"Review" button opens a side panel or navigates to `/admin/qa-queue/[assignmentId]`.

---

### Route: `app/admin/qa-queue/[assignmentId]/page.tsx`

**Shows**:
1. Quest details (title, description, acceptance criteria, difficulty, track)
2. Student info (name, rank, cohort if bootcamp)
3. Submission content (PR link, notes, any files submitted)
4. Previous revision notes (if this is a re-submission)

**Actions**:

**Approve** button:
```typescript
// PATCH /api/admin/qa-queue/[assignmentId]  { action: 'approve' }
await db.assignment.update({
  where: { id: assignmentId },
  data: { status: AssignmentStatus.review }
});
// Optionally notify client via Discord webhook
```

**Reject** button → opens a notes modal:
```typescript
// PATCH /api/admin/qa-queue/[assignmentId]  { action: 'reject', notes: string }
await db.$transaction([
  db.assignment.update({
    where: { id: assignmentId },
    data: { status: AssignmentStatus.needs_rework }
  }),
  db.quest.update({
    where: { id: quest.id },
    data: { revisionCount: { increment: 1 } }
  })
]);
// Notify student via Discord
```

---

## API Endpoint: `PATCH /api/admin/qa-queue/[assignmentId]`

**Auth**: `admin` only

**Request body**:
```typescript
{
  action: 'approve' | 'reject';
  notes?: string;   // required if action === 'reject'
}
```

**Logic**:
1. Validate assignment exists and has status `pending_admin_review`
2. If `approve`:
   - Update assignment status → `review`
   - Log: "Admin QA approved — forwarded to client"
3. If `reject`:
   - Validate `notes` is present and non-empty
   - Update assignment status → `needs_rework`
   - Increment `quest.revisionCount`
   - Store notes in `submission.reviewNotes` (append to existing JSON array)
4. Return updated assignment

**File**: `app/api/admin/qa-queue/[assignmentId]/route.ts`

---

## Navigation

Add "QA Queue" link to admin sidebar in `app/admin/layout.tsx` (or wherever the admin nav lives). Show badge with pending count:

```typescript
const pendingCount = await db.assignment.count({
  where: { status: AssignmentStatus.pending_admin_review }
});
```

---

## Adventurer Dashboard Status Display

The adventurer dashboard shows assignment status. Add display text for the new status:

```typescript
// In wherever assignment statuses are rendered:
const statusLabels: Record<AssignmentStatus, string> = {
  // ... existing ...
  pending_admin_review: 'Under QA Review',
};
```

Student should see "Under QA Review" — they don't need to know it's specifically an admin step.

---

## Files to Create/Modify

| Action | File |
|--------|------|
| Modify | `prisma/schema.prisma` — add `pending_admin_review` to `AssignmentStatus` |
| Run | `npx prisma migrate dev --name add-pending-admin-review-status` |
| Modify | Submission route — change next status based on `quest.track` |
| Create | `app/admin/qa-queue/page.tsx` — queue list |
| Create | `app/admin/qa-queue/[assignmentId]/page.tsx` — review detail |
| Create | `app/api/admin/qa-queue/[assignmentId]/route.ts` — approve/reject PATCH |
| Modify | Admin sidebar/nav — add QA Queue link with badge |
| Modify | Adventurer dashboard status labels — add `pending_admin_review` display text |

---

## Acceptance Criteria

- [ ] `pending_admin_review` added to `AssignmentStatus` enum with migration applied
- [ ] Submissions on BOOTCAMP track quests land in `pending_admin_review`, not `review`
- [ ] Submissions on INTERN track quests land in `pending_admin_review`, not `review`
- [ ] Submissions on OPEN track quests still land in `review` (no change)
- [ ] `/admin/qa-queue` shows all pending assignments in FIFO order
- [ ] Admin "Approve" moves assignment to `review` — company can now see it
- [ ] Admin "Reject" moves assignment to `needs_rework`, increments `revisionCount`
- [ ] Reject requires non-empty notes
- [ ] Adventurer dashboard shows "Under QA Review" for `pending_admin_review` status
- [ ] Admin sidebar shows QA Queue link
- [ ] `npm run lint` → 0 errors
- [ ] `npm run type-check` → 0 errors
- [ ] `npm run build` → passes

---

## What NOT to Do

- Do not add a `pending_admin_review` gate to OPEN track quests — they go direct to client
- Do not notify the client when the submission enters `pending_admin_review` — client only hears once it reaches `review`
- Do not give adventurers access to the QA queue — it's admin-only
- Do not skip the `revisionCount` increment on admin reject — it's the same as a company reject, counts toward the cap
- Do not add async email notifications yet — Discord webhook is sufficient for Phase 2
