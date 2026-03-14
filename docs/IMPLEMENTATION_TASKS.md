# Implementation Tasks — Adventurers Guild

Task queue for the Open Paws Bootcamp integration and platform monetization. Tasks are ordered by dependency — do not skip ahead.

---

## Phase 0: Schema & Infrastructure (Prerequisites)

### Task 0.1: Add `track` field to Quest model

**What**: Add a `track` enum to differentiate intern quests from bootcamp quests.

**Schema changes** (`prisma/schema.prisma`):
```prisma
enum QuestTrack {
  INTERN
  BOOTCAMP
}

model Quest {
  // Add after questCategory:
  track  QuestTrack  @default(INTERN)
}
```

**Migration**:
```bash
npx prisma migrate dev --name add-quest-track
```

**After migration**:
- All existing quests default to `INTERN` (they're company-posted professional work)
- Update `app/api/company/quests/route.ts` POST to accept `track` field
- Update `app/api/admin/quests/route.ts` POST/PUT to accept `track` field
- Import and validate: `Object.values(QuestTrack).includes(track as QuestTrack)`

**Acceptance criteria**:
- [ ] `QuestTrack` enum exists in schema
- [ ] Existing quests have `track = INTERN` after migration
- [ ] Quest creation API accepts and stores `track` field
- [ ] `npm run build` passes

---

### Task 0.2: Add `parentQuestId` for sub-quest relationships

**What**: Allow D+ quests to spawn F/E sub-quests for bootcamp students.

**Schema changes** (`prisma/schema.prisma`):
```prisma
model Quest {
  // Add self-referential relation:
  parentQuestId  String?  @map("parent_quest_id") @db.Uuid
  parentQuest    Quest?   @relation("SubQuests", fields: [parentQuestId], references: [id])
  subQuests      Quest[]  @relation("SubQuests")
}
```

**After migration**:
- Update `GET /api/quests/[id]` to include `subQuests` (title, rank, status, track) when the quest has children
- Update quest detail pages to show parent/child links
- Admin quest creation form: optional "Parent Quest" dropdown

**Acceptance criteria**:
- [ ] `parentQuestId` field exists, nullable, with self-relation
- [ ] Quest detail API returns sub-quests for parent quests
- [ ] Quest detail API returns parent link for sub-quests
- [ ] No circular references possible (parentQuestId cannot equal own id)

---

### Task 0.3: Add `BootcampLink` model

**What**: Link Open Paws Bootcamp student IDs to Adventurer accounts.

**Schema changes** (`prisma/schema.prisma`):
```prisma
model BootcampLink {
  id                      String   @id @default(uuid()) @db.Uuid
  userId                  String   @unique @map("user_id") @db.Uuid
  bootcampStudentId       String   @unique @map("bootcamp_student_id")
  cohort                  String   // e.g. "2026-Q1"
  enrolledAt              DateTime @map("enrolled_at") @db.Timestamptz
  tutorialQuest1Complete  Boolean  @default(false) @map("tutorial_quest_1_complete")
  tutorialQuest2Complete  Boolean  @default(false) @map("tutorial_quest_2_complete")
  eligibleForRealQuests   Boolean  @default(false) @map("eligible_for_real_quests")
  createdAt               DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt               DateTime @updatedAt @map("updated_at") @db.Timestamptz

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("bootcamp_links")
}

// Add to User model:
model User {
  bootcampLink  BootcampLink?
}
```

**Logic**: `eligibleForRealQuests` is a computed guard — set to `true` only when BOTH `tutorialQuest1Complete` AND `tutorialQuest2Complete` are true. Update it in a Prisma middleware or in the quest completion handler.

**Acceptance criteria**:
- [ ] `BootcampLink` model exists with all fields
- [ ] User has optional `bootcampLink` relation
- [ ] `eligibleForRealQuests` cannot be true unless both tutorials are complete
- [ ] Migration runs clean

---

### Task 0.4: Add `revisionCount` and `maxRevisions` to Quest

**What**: Track revision cycles per quest. Cap at 2 before escalation.

**Schema changes**:
```prisma
model Quest {
  revisionCount   Int  @default(0) @map("revision_count")
  maxRevisions    Int  @default(2) @map("max_revisions")
}
```

**After migration**:
- Update submission review flow: when status → `needs_rework`, increment `revisionCount`
- When `revisionCount >= maxRevisions`, block further revision requests and return escalation path
- Update company review UI to show revision count and warn at limit

**Acceptance criteria**:
- [ ] Fields exist with correct defaults
- [ ] `needs_rework` increments revision count
- [ ] Revision blocked when count >= max
- [ ] Company UI shows revision count

---

## Phase 1: Core Integration Features

### Task 1.1: Onboard webhook endpoint

**What**: `POST /api/onboard` — called by Open Paws Bootcamp to create Adventurer accounts for enrolled students.

**File**: `app/api/onboard/route.ts`

**Request body**:
```typescript
{
  secret: string;           // Webhook secret (validate against env ONBOARD_WEBHOOK_SECRET)
  studentId: string;        // Bootcamp's student ID
  name: string;
  email: string;
  cohort: string;           // e.g. "2026-Q1"
}
```

**Logic**:
1. Validate webhook secret (return 401 if mismatch)
2. Check if email already registered (return 409 if exists)
3. Create User (role: adventurer, rank: F, generated password hash)
4. Create AdventurerProfile
5. Create BootcampLink (studentId, cohort, eligibleForRealQuests: false)
6. Return 201 with userId

**Security**: No auth middleware — secret-based validation only. Rate limit to 10 req/min.

**Acceptance criteria**:
- [ ] Invalid secret returns 401
- [ ] Duplicate email returns 409
- [ ] Successful creation returns 201 with userId
- [ ] BootcampLink created with eligibleForRealQuests = false
- [ ] Response time < 500ms

---

### Task 1.2: Quest board track filtering

**What**: Filter quest board by track. Bootcamp students only see BOOTCAMP quests.

**Files**:
- `app/api/quests/route.ts` (GET handler)
- `app/dashboard/quests/page.tsx` (quest board page)

**API changes**:
- Add `track` query param to GET `/api/quests`
- If requesting user has a `bootcampLink`, force `track = BOOTCAMP` regardless of param
- If requesting user has a `bootcampLink` with `eligibleForRealQuests = false`, only return tutorial quests
- Validate track enum if provided

**Frontend changes**:
- Add track filter toggle to quest board (visible to non-bootcamp users only)
- Bootcamp students see no toggle — always filtered to their track

**Acceptance criteria**:
- [ ] `?track=BOOTCAMP` returns only bootcamp quests
- [ ] `?track=INTERN` returns only intern quests
- [ ] Bootcamp-linked user always sees bootcamp quests only (API enforced, not just UI)
- [ ] Ineligible bootcamp user sees only tutorial quests
- [ ] Direct URL access to intern quest detail returns 403 for bootcamp user

---

### Task 1.3: Structured modification request form

**What**: Replace freeform revision requests with a structured form tied to acceptance criteria.

**File**: `app/dashboard/company/quests/[id]/review/page.tsx` (new page)

**UI spec**:
- Display the quest's acceptance criteria as a checklist
- Company checks which criteria the submission fails
- Optional notes field (supplementary, not primary)
- Submit creates a structured revision request

**Data flow**:
- When company clicks "Request Revision" on a submission, show this form
- On submit: update submission status → `needs_rework`, increment quest `revisionCount`
- If `revisionCount >= maxRevisions`: show escalation message instead of revision form
- Store failed criteria IDs in submission `reviewNotes` as JSON

**Acceptance criteria**:
- [ ] Form displays quest's acceptance criteria as checkable items
- [ ] At least one criterion must be checked to submit
- [ ] Revision increments `revisionCount`
- [ ] At `revisionCount >= maxRevisions`, form shows escalation path instead
- [ ] Failed criteria stored in submission review notes

---

### Task 1.4: Tutorial quest gating

**What**: Block bootcamp students from real quests until both tutorial quests are complete.

**Files**:
- `app/api/quests/assignments/route.ts` (POST handler — quest application)
- Quest completion handler (where XP is granted)

**Logic for quest application**:
1. If user has `bootcampLink` AND `eligibleForRealQuests = false`:
   - Only allow application to quests where title starts with "Tutorial:"
   - Return 403 with message "Complete both tutorial quests first" for all other quests

**Logic for quest completion**:
1. After granting XP for a completed quest:
2. If quest title starts with "Tutorial: First Blood" → set `bootcampLink.tutorialQuest1Complete = true`
3. If quest title starts with "Tutorial: Party Up" → set `bootcampLink.tutorialQuest2Complete = true`
4. If both tutorials complete → set `eligibleForRealQuests = true`

**Acceptance criteria**:
- [ ] Ineligible bootcamp user cannot apply to non-tutorial quests (API returns 403)
- [ ] Completing tutorial 1 sets `tutorialQuest1Complete = true`
- [ ] Completing tutorial 2 sets `tutorialQuest2Complete = true`
- [ ] Completing both sets `eligibleForRealQuests = true`
- [ ] After becoming eligible, user can apply to real bootcamp quests

---

### Task 1.5: Company portal transparency notice

**What**: Show companies that their quests may be worked on by bootcamp students (for BOOTCAMP track quests).

**File**: `app/dashboard/company/quests/[id]/page.tsx`

**UI spec**:
- If quest.track === 'BOOTCAMP', show an info banner:
  > "This quest is assigned to the Bootcamp track. It will be completed by Open Paws Bootcamp students under mentorship. Expected turnaround may differ from professional track."
- Show on quest detail and in quest creation form (when BOOTCAMP track selected)

**Acceptance criteria**:
- [ ] Banner visible on BOOTCAMP track quests
- [ ] Banner NOT visible on INTERN track quests
- [ ] Banner shown during quest creation when BOOTCAMP selected

---

## Phase 2: Monetization Foundation

### Task 2.1: Stripe Connect integration

See `MONETIZATION_ROADMAP.md` for full spec. Summary:
- Install `stripe` package
- Create `/lib/stripe.ts` singleton
- Add `stripeAccountId` to AdventurerProfile, `stripeCustomerId` to CompanyProfile
- Build Connect onboarding flow for adventurers
- Replace simulated `txn_${Date.now()}` with real Stripe PaymentIntents

### Task 2.2: Service fee calculation

- Add `platformFee` and `platformFeeRate` to Transaction model
- Compute 15% fee at payment time
- Display fee breakdown in quest creation and company payment pages

### Task 2.3: Company subscription plans

- Stripe Billing for Starter (free) / Guild Partner ($149) / Enterprise ($499)
- Enforce quest limits per plan (3/mo for Starter)
- Build billing settings page in company dashboard

---

## Phase 3: Platform Polish

### Task 3.1: Quest event audit trail
- Log all state transitions (quest status, assignment status, submission status)
- Store in an `EventLog` model with userId, questId, action, timestamp
- Admin can view full event history per quest

### Task 3.2: Admin revenue dashboard
- `/admin/revenue` page with GMV, MRR, take rate, fill rate charts
- Data from `/api/admin/revenue` endpoint

### Task 3.3: Seasonal ladders
- Time-boxed ranking periods (quarterly)
- Leaderboard resets, season rewards, historical records

---

## Task Dependency Graph

```
0.1 (track field) ──┬── 1.2 (quest board filtering)
                     ├── 1.5 (transparency notice)
                     └── 0.2 (parentQuestId) ── sub-quest UI

0.3 (BootcampLink) ─┬── 1.1 (onboard webhook)
                     └── 1.4 (tutorial gating) ── 1.2 (board filtering)

0.4 (revisionCount) ── 1.3 (modification form)

Phase 1 complete ──── Phase 2 (monetization)
Phase 2 complete ──── Phase 3 (polish)
```

**Start with Task 0.1** — everything else depends on the `track` field existing.
