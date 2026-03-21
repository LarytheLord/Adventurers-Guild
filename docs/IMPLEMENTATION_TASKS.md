# Implementation Tasks — Adventurers Guild

Task queue for the Open Paws Bootcamp integration and platform scale-up. Tasks are ordered by dependency. Do not skip ahead.

**Current date**: 2026-03-21
**Sprint target**: Platform operational for intern + bootcamp launch by May 2026

---

## Status Overview

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 0: Schema & Prerequisites | ✅ Complete | All schema changes merged |
| Phase 1: Bootcamp Integration | ✅ Complete | All 5 tasks done (PR #103) |
| Phase 2: Squad System + Payments | ✅ Core done | 2.A + 2.B done, 2.C + 2.D delegated |
| Phase 2.5: Credential System | 🔨 In Progress | Guild Card, Analytics, Streaks — NEW |
| Phase 3: Platform Polish + Scale | ⏳ Planned | 6 tasks, target ~May 11 |

---

## ✅ Phase 0: Schema & Infrastructure (Complete)

### ~~Task 0.1: Add `track` field to Quest model~~ ✅
- `QuestTrack` enum added: `OPEN`, `INTERN`, `BOOTCAMP`
- Default: `OPEN`
- APIs updated: `company/quests`, `admin/quests`, `public/quests`

### ~~Task 0.2: Add `parentQuestId` for sub-quest relationships~~ ✅
- Self-referential relation added to Quest
- `GET /api/quests/[id]` returns `subQuests[]` and `parentQuest`
- Quest detail pages show parent/child links

### ~~Task 0.3: Add `BootcampLink` model~~ ✅
- Model added: `bootcampStudentId`, `cohort`, `bootcampTrack`, `bootcampWeek`
- Tutorial completion flags: `tutorialQuest1Complete`, `tutorialQuest2Complete`
- `eligibleForRealQuests` computed guard
- Cascade-deletes with user

### ~~Task 0.4: Add `revisionCount` and `maxRevisions` to Quest~~ ✅
- Both fields added with defaults (0 and 2)
- Revision cap enforced in review flow

---

## ✅ Phase 1: Core Integration Features (Complete)

### ~~Task 1.1: Onboard webhook~~ ✅
- `POST /api/onboard` — called by Open Paws Bootcamp on enrollment
- Creates User + AdventurerProfile + BootcampLink in one transaction
- 401 on bad secret, 409 on duplicate email, 201 on success

### ~~Task 1.2: Quest board track filtering~~ ✅
- `GET /api/quests` accepts `?track=BOOTCAMP|INTERN|OPEN`
- Bootcamp-linked users forced to BOOTCAMP track at API level
- Ineligible bootcamp users only see Tutorial quests

### ~~Task 1.3: Structured revision request form~~ ✅
- Company review uses acceptance criteria checklist (not freeform)
- Unmet criteria stored as JSON in `reviewNotes`
- At `revisionCount >= maxRevisions`, shows escalation path

### ~~Task 1.4: Tutorial quest gating~~ ✅
- Bootcamp users with `eligibleForRealQuests = false` get 403 on non-Tutorial quests
- Completing "Tutorial: First Blood" → `tutorialQuest1Complete = true`
- Completing "Tutorial: Party Up" → `tutorialQuest2Complete = true`
- Both done → `eligibleForRealQuests = true`

### ~~Task 1.5: Company transparency notice~~ ✅
- Info banner on BOOTCAMP-track quests: mentorship context, different turnaround
- Banner shown during quest creation when BOOTCAMP track is selected

---

## ✅ Phase 2: Squad System + Payment Infrastructure

**Target: ~April 13, 2026 (2 weeks)**
**GitHub issues**: See linked issues for full spec.
**Updated**: 2026-03-21

---

### ~~Task 2.A: Squad/Party System — Schema and API~~ ✅

**GitHub issue**: [#104](https://github.com/LarytheLord/Adventurers-Guild/issues/104) (closed)
**Full spec**: [`docs/SQUAD_PARTY_SYSTEM.md`](./SQUAD_PARTY_SYSTEM.md)
**Rank**: S

**What**: The core delivery mechanism for both tracks. Mixed-rank squads complete quests together. Senior Adventurers lead as Party Leaders. Required for intern launch.

**Schema additions**:
```prisma
model Party {
  id        String   @id @default(uuid()) @db.Uuid
  questId   String   @unique @map("quest_id") @db.Uuid
  leaderId  String   @map("leader_id") @db.Uuid
  track     QuestTrack
  maxSize   Int      @default(5) @map("max_size")
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz

  quest   Quest          @relation(fields: [questId], references: [id])
  leader  User           @relation("PartyLeader", fields: [leaderId], references: [id])
  members PartyMember[]

  @@map("parties")
}

model PartyMember {
  id       String   @id @default(uuid()) @db.Uuid
  partyId  String   @map("party_id") @db.Uuid
  userId   String   @map("user_id") @db.Uuid
  isLeader Boolean  @default(false) @map("is_leader")
  joinedAt DateTime @default(now()) @map("joined_at") @db.Timestamptz

  party Party @relation(fields: [partyId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id])

  @@unique([partyId, userId])
  @@map("party_members")
}
```

**API endpoints**:
- `POST /api/parties` — create party for a quest (party leader calls this)
- `POST /api/parties/[id]/members` — add member to party
- `DELETE /api/parties/[id]/members/[userId]` — remove member
- `GET /api/parties/[id]` — party details + member list
- `GET /api/quests/[id]` — update to include `party` relation if exists

**Constraints**:
- BOOTCAMP track: max 2 members (pairs only)
- INTERN track: max 5 members
- Party leader must have rank >= quest difficulty (D for D-rank quest, etc.)
- Each quest can have at most 1 party

**Acceptance criteria**:
- [ ] `Party` and `PartyMember` models in schema with migration
- [ ] `POST /api/parties` creates party and auto-adds leader as member (isLeader: true)
- [ ] `POST /api/parties/[id]/members` adds member, respects maxSize
- [ ] BOOTCAMP parties capped at 2 members, INTERN at 5
- [ ] Leader rank constraint enforced
- [ ] `GET /api/quests/[id]` includes `party` with members
- [ ] `npm run build` passes

---

### ~~Task 2.B: Admin QA Mediation Layer~~ ✅

**GitHub issue**: [#105](https://github.com/LarytheLord/Adventurers-Guild/issues/105) (closed)
**Full spec**: [`docs/ADMIN_QA_MEDIATION.md`](./ADMIN_QA_MEDIATION.md)
**Rank**: A

**What**: Open Paws (admin) mediates all client relations. Submissions must pass admin QA review before the client sees them. Adds a `pending_admin_review` state to the assignment flow.

**Schema addition**:
```prisma
// Add to AssignmentStatus enum:
pending_admin_review  // between submitted and review
```

**Logic change**:
- When adventurer submits: `submitted → pending_admin_review` (not `review`)
- Admin reviews in `/admin/qa-queue`:
  - Approve → `review` (client now sees it)
  - Reject → `needs_rework` with admin notes (student revises)
- Client review flow unchanged after this point

**New admin page**: `/admin/qa-queue`
- Table of all `pending_admin_review` assignments
- Shows: quest name, student name, rank, submission date, submission link
- Actions: Approve (forward to client), Reject (send back to student with notes)

**Acceptance criteria**:
- [ ] `pending_admin_review` added to `AssignmentStatus` enum with migration
- [ ] Submission POST transitions to `pending_admin_review` not `review`
- [ ] `/admin/qa-queue` page lists all pending items
- [ ] Admin approve → assignment moves to `review`, company sees it
- [ ] Admin reject → assignment moves to `needs_rework`, `revisionCount` increments
- [ ] Adventurer dashboard shows correct status at each stage
- [ ] `npm run build` passes

---

### Task 2.C: Stripe Connect — Adventurer Payout Onboarding

**GitHub issue**: [#TBD Stripe Connect](https://github.com/LarytheLord/Adventurers-Guild/issues)
**Rank**: A

**What**: Enable adventurers to receive real payouts via Stripe Connect. Companies pay into escrow on quest acceptance; adventurers receive payout on approval.

**Schema additions**:
```prisma
// Add to AdventurerProfile:
stripeAccountId      String? @map("stripe_account_id")
stripeOnboardingDone Boolean @default(false) @map("stripe_onboarding_done")

// Add to CompanyProfile:
stripeCustomerId String? @map("stripe_customer_id")

// Add to Transaction:
stripePaymentIntentId String? @map("stripe_payment_intent_id")
platformFee           Int     @default(0) @map("platform_fee")    // in paise/cents
platformFeeRate       Float   @default(0.15) @map("platform_fee_rate")
```

**API endpoints**:
- `POST /api/payments/stripe/connect` — create Stripe Connect account + return onboarding URL
- `GET /api/payments/stripe/connect/callback` — handle OAuth return, save `stripeAccountId`
- `POST /api/payments/stripe/intent` — create PaymentIntent for quest reward (company pays)
- Stripe webhook already exists at `POST /api/payments/webhooks/stripe`

**Onboarding flow**:
1. Adventurer clicks "Set up payouts" in dashboard
2. FE calls `POST /api/payments/stripe/connect`
3. API creates Stripe Express account, returns onboarding URL
4. Redirect to Stripe, return to `/dashboard/settings?stripe=success`
5. Callback saves `stripeAccountId` to `AdventurerProfile`

**Acceptance criteria**:
- [ ] `stripeAccountId` + `stripeOnboardingDone` added to schema
- [ ] `POST /api/payments/stripe/connect` returns valid onboarding URL
- [ ] Callback route saves account ID and marks `stripeOnboardingDone = true`
- [ ] Dashboard settings shows payout setup status
- [ ] Existing simulated payment flow still works when Stripe not configured
- [ ] `npm run build` passes

---

### Task 2.D: API Key Budget Tracking

**GitHub issue**: [#TBD API Key Budget](https://github.com/LarytheLord/Adventurers-Guild/issues)
**Rank**: D

**What**: Log API key spend per user per week. Admin view shows current week burn vs cap. Allows monitoring the $10/week intern cap and $5/week bootcamp cap.

**Schema additions**:
```prisma
model ApiKeyBudget {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  weekStart DateTime @map("week_start") @db.Timestamptz  // Monday of the week
  spent     Float    @default(0)   // USD
  cap       Float    @default(5)   // USD — 5 for bootcamp, 10 for intern
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, weekStart])
  @@map("api_key_budgets")
}
```

**API endpoints**:
- `POST /api/admin/api-budgets` — log spend entry (admin or system calls this)
- `GET /api/admin/api-budgets` — list all users with this week's spend vs cap
- `GET /api/admin/api-budgets/[userId]` — per-user spend history

**Admin page**: Add "API Budgets" tab to `/admin` page showing current-week table

**Acceptance criteria**:
- [ ] `ApiKeyBudget` model in schema with migration
- [ ] `POST /api/admin/api-budgets` creates or updates spend for user/week
- [ ] `GET /api/admin/api-budgets` returns current week spend vs cap per user
- [ ] Admin budget tab shows table: user, track, cap, spent, % used, over-cap flag
- [ ] `npm run build` passes

---

## ⏳ Phase 3: Platform Polish + Scale

**Target: ~May 11, 2026 (4 weeks)**

---

### Task 3.A: Squad-Aware Quest Board UI

Update the quest board to show party slots and allow adventurers to join existing parties.

- Quest cards show "Party: 2/5 members" or "Solo quest"
- Detail page shows current party members + join button
- Party leader can invite specific adventurers
- Filter: solo quests vs squad quests

---

### Task 3.B: Hackathon → Quest Continuation Pipeline

When a hackathon team builds for a partner org, that org becomes the client for a direct continuation quest.

- Admin creates quest from hackathon submission (pre-filled form)
- System offers it to the hackathon team first (7-day exclusive window)
- If declined or expired → goes to public board
- Track: `INTERN` by default (continuation work is production-grade)

---

### Task 3.C: Admin Revenue Dashboard

`/admin/revenue` — real-time platform financial overview.

- GMV (gross merchandise value) — total quest rewards processed
- MRR (monthly recurring revenue from subscriptions, Phase 3.E)
- Take rate — platform fee as % of GMV
- Fill rate — % of posted quests that get completed
- Charts: 30-day rolling, month-on-month comparison
- Data from new `/api/admin/revenue` endpoint

---

### Task 3.D: Quest Event Audit Trail

Every quest state transition gets logged in a new `EventLog` model.

```prisma
model EventLog {
  id        String   @id @default(uuid()) @db.Uuid
  questId   String?  @map("quest_id") @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  action    String   // "quest_status_changed", "assignment_approved", etc.
  fromState String?  @map("from_state")
  toState   String?  @map("to_state")
  meta      Json?
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz

  @@map("event_logs")
}
```

Admin quest detail page shows full event timeline.

---

### Task 3.E: Company Subscription Plans

Stripe Billing for tiered plans:
- **Starter** (free) — 3 quests/month, no INTERN track
- **Guild Partner** ($149/month) — unlimited quests, all tracks
- **Enterprise** ($499/month) — white-label, dedicated QA slot

Enforce quest limits in `POST /api/company/quests`. Build billing settings page.

---

### Task 3.F: Seasonal Ladders

Time-boxed ranking periods (quarterly). Leaderboard resets each season. Top adventurers per season get visible badges. Historical seasons stored and browsable.

---

## Task Dependency Graph

```
Phase 0 (complete) ──────────────────────────────────────────────┐
                                                                   │
Phase 1 (complete) ──────────────────────────────────────────────┤
                                                                   ▼
2.A Squad/Party ──────────────────────── 3.A Squad Quest Board UI
2.B Admin QA Mediation ───────────────── 3.C Revenue Dashboard
2.C Stripe Connect ───────────────────── 3.E Subscription Plans
2.D API Budget Tracking                  3.B Hackathon Pipeline
                                         3.D Audit Trail
                                         3.F Seasonal Ladders
```

**Critical path to May launch**: 2.A (squad) → 3.A (squad UI) → intern onboarding.
