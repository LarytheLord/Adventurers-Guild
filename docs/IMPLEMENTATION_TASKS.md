# IMPLEMENTATION_TASKS.md — Technical Implementation Guide

## Reading Order

1. Read `CLAUDE.md` first for full project context
2. Read `prisma/schema.prisma` to understand current data model
3. Read this file for what to build and how
4. Read `QUEST_BRIEF_SCHEMA.md` for the quest data format

---

## Phase 0: Database & Infrastructure (Do These First)

### Task 0.1: Add Track and Sub-Quest Fields to Quest Model

**File**: `prisma/schema.prisma`

Add to the existing Quest model:

```prisma
enum QuestTrack {
  INTERN
  BOOTCAMP
}

// Add these fields to the Quest model:
// track          QuestTrack   @default(BOOTCAMP)
// parentQuestId  String?      @db.Text
// parentQuest    Quest?       @relation("SubQuests", fields: [parentQuestId], references: [id])
// subQuests      Quest[]      @relation("SubQuests")
// maxRevisions   Int          @default(2)
// revisionCount  Int          @default(0)
```

**After editing schema.prisma:**
```bash
npx prisma migrate dev --name add-quest-track-and-subquests
npx prisma generate
```

**Acceptance criteria:**
- [ ] Quest model has `track` field (enum: INTERN, BOOTCAMP)
- [ ] Quest model has self-referential `parentQuestId` for sub-quests
- [ ] Quest model has `maxRevisions` (default 2) and `revisionCount` (default 0)
- [ ] Migration runs without errors
- [ ] Existing quests default to BOOTCAMP track

---

### Task 0.2: Add BootcampLink Model

**File**: `prisma/schema.prisma`

New model linking bootcamp students to Adventurer profiles:

```prisma
model BootcampLink {
  id              String   @id @default(cuid())
  
  // Foreign key to existing User model
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Bootcamp data
  bootcampStudentId  String   @unique  // ID from the bootcamp platform
  bootcampTrack      String              // "animal_advocacy" | "climate_action" | "ai_safety" | "hybrid"
  bootcampWeek       Int      @default(1) // Current week (1–10)
  enrolledAt         DateTime @default(now())
  graduatedAt        DateTime?
  
  // Tutorial quest completion tracking
  tutorialQuest1Complete  Boolean  @default(false)
  tutorialQuest2Complete  Boolean  @default(false)
  
  // Eligible for real quests only after both tutorials done
  eligibleForRealQuests   Boolean  @default(false)
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

**Also add to the User model:**
```prisma
// Add to existing User model:
// bootcampLink   BootcampLink?
```

**Acceptance criteria:**
- [ ] BootcampLink model created with all fields
- [ ] User model has optional relation to BootcampLink
- [ ] `eligibleForRealQuests` is false by default (flips true after both tutorials)
- [ ] Migration runs clean

---

### Task 0.3: Add Revision Quest Model

**File**: `prisma/schema.prisma`

```prisma
model RevisionRequest {
  id              String   @id @default(cuid())
  
  questId         String
  quest           Quest    @relation(fields: [questId], references: [id])
  
  // Structured feedback from client (NOT freeform)
  unmetCriteria   String[] // Which acceptance criteria were not met
  description     String   // Specific changes needed
  isNewScope      Boolean  @default(false) // True = scope creep, becomes new quest
  
  // Status tracking
  status          RevisionStatus @default(PENDING)
  deadline        DateTime?
  
  createdAt       DateTime @default(now())
  resolvedAt      DateTime?
}

enum RevisionStatus {
  PENDING
  IN_PROGRESS
  RESOLVED
  ESCALATED
}
```

**Also add to Quest model:**
```prisma
// Add to Quest model:
// revisionRequests  RevisionRequest[]
```

---

### Task 0.4: GitHub Actions CI

**File**: `.github/workflows/ci.yml`

```yaml
name: CI
on:
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - name: Lint
        run: npx eslint . --ext .ts,.tsx --max-warnings 0
      - name: Type Check
        run: npx tsc --noEmit
      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
```

**Acceptance criteria:**
- [ ] CI runs on every PR to main
- [ ] Lint, type check, and build must all pass
- [ ] Failing CI blocks merge

---

### Task 0.5: PR Template

**File**: `.github/PULL_REQUEST_TEMPLATE.md`

```markdown
## Quest Reference
- Quest ID/Link:
- Track: INTERN / BOOTCAMP
- Rank: F / E / D / C / B+

## Changes
<!-- What did you change and why? -->

## Acceptance Criteria Checklist
<!-- Copy from the Quest Brief and check off each one -->
- [ ] Criteria 1
- [ ] Criteria 2

## Screenshots (if UI changes)

## Peer Review Checklist (for reviewer)
- [ ] Code does what the quest brief asks
- [ ] All acceptance criteria are met
- [ ] Follows existing code patterns in the repo
- [ ] No obvious bugs or unhandled edge cases
- [ ] I would be comfortable if this went to a client
```

---

## Phase 1: Core Features

### Task 1.1: Onboard Webhook Endpoint

**File**: `app/api/onboard/route.ts`

POST endpoint that receives a webhook from the Open Paws Bootcamp platform when a student reaches Week 4+ and opts into the Guild.

```typescript
// Expected payload from bootcamp platform:
interface OnboardPayload {
  bootcampStudentId: string;
  name: string;
  email: string;
  bootcampTrack: "animal_advocacy" | "climate_action" | "ai_safety" | "hybrid";
  bootcampWeek: number;
  webhookSecret: string; // Must match env var BOOTCAMP_WEBHOOK_SECRET
}

// Endpoint behavior:
// 1. Validate webhookSecret against env var
// 2. Check if BootcampLink already exists for this bootcampStudentId (idempotent)
// 3. If new: create User (role: ADVENTURER, rank: F) + BootcampLink
// 4. If existing: update bootcampWeek
// 5. Return { success: true, adventurerId: user.id, rank: "F" }
```

**Security:**
- Validate `webhookSecret` matches `process.env.BOOTCAMP_WEBHOOK_SECRET`
- Rate limit: 10 req/min
- Idempotent: calling with same `bootcampStudentId` twice doesn't create duplicates

**Acceptance criteria:**
- [ ] POST `/api/onboard` creates new Adventurer + BootcampLink
- [ ] Validates webhook secret
- [ ] Idempotent on duplicate bootcampStudentId
- [ ] Returns 401 on bad secret, 200 on success, 409 on duplicate with different email
- [ ] Created user has role ADVENTURER and rank F

---

### Task 1.2: Quest Board Track Filtering

**Files**: Quest listing pages + API routes

The quest board must respect tracks:

```typescript
// When fetching quests for a user:
// 1. Check if user has a BootcampLink
// 2. If bootcamp student: ONLY show quests where track === "BOOTCAMP"
// 3. If bootcamp student && !eligibleForRealQuests: ONLY show tutorial quests
// 4. If intern or other user: show quests matching their role/rank as before
// 5. Admins see everything

// Add to quest listing API:
// where: {
//   track: isBootcampStudent ? "BOOTCAMP" : undefined,
//   rank: { lte: userRank }, // existing rank-based filtering
// }
```

**Also add track filter dropdown to the quest board UI:**
- Admins and companies see: All / Intern / Bootcamp
- Adventurers only see their eligible track

**Acceptance criteria:**
- [ ] Bootcamp students only see BOOTCAMP track quests
- [ ] Bootcamp students who haven't completed tutorials only see tutorial quests
- [ ] Interns see all quests at or below their rank
- [ ] Track filter appears for admins/companies
- [ ] No cross-track visibility leak

---

### Task 1.3: Structured Modification Request Form

**Files**: Company portal quest detail page

When a client clicks "Request Changes" on a delivered quest, show a structured form — NOT a freeform text box.

```typescript
interface ModificationRequest {
  questId: string;
  
  // Client must select which acceptance criteria are NOT met
  unmetCriteria: string[]; // Array of criteria IDs from the quest brief
  
  // Specific description of what needs to change
  description: string; // Max 1000 chars
  
  // System detects if this is new scope
  hasNewRequirements: boolean; // Client checkbox: "I'm requesting features not in the original brief"
}
```

**UI requirements:**
- Show the quest's acceptance criteria as a checklist. Client checks the ones that are NOT met.
- Text field for description (max 1000 chars, required)
- Checkbox: "I need features that were not in the original quest brief" (triggers new quest flow instead of revision)
- Submit creates a RevisionRequest record

**If `hasNewRequirements` is true:**
- Don't create a revision. Show a message: "These are new requirements. They'll be submitted as a separate quest."
- Pre-fill a new quest form with the context from the modification request.

**If `hasNewRequirements` is false AND quest.revisionCount < quest.maxRevisions:**
- Create a RevisionRequest with status PENDING
- Increment quest.revisionCount
- Notify the assigned squad/student via the notification system

**If revisionCount >= maxRevisions:**
- Show message: "This quest has reached the maximum revision limit. It will be escalated to the review team."
- Create RevisionRequest with status ESCALATED

**Acceptance criteria:**
- [ ] Form shows quest acceptance criteria as checkable items
- [ ] Description field is required, max 1000 chars
- [ ] New scope checkbox routes to new quest form
- [ ] Within-scope creates RevisionRequest and increments counter
- [ ] Blocks at maxRevisions and sets status to ESCALATED
- [ ] Client sees clear feedback on what happens next

---

### Task 1.4: Revision Quest Flow

**Files**: API routes + quest detail pages

When a RevisionRequest is created (status: PENDING), the system needs to:

```typescript
// POST /api/quests/[id]/revision
// 1. Validate the request (quest exists, user is the client, revision limit not hit)
// 2. Create RevisionRequest record
// 3. Update quest status to REVISION_REQUESTED (add this to quest status enum)
// 4. Set revision deadline = now + 7 days
// 5. The assigned adventurer/squad sees the revision on their dashboard
//    with: unmet criteria highlighted, client description, deadline
// 6. When student resubmits: RevisionRequest status → RESOLVED, quest goes back to client review
```

**Add to Quest status enum:**
```prisma
// Add REVISION_REQUESTED to existing QuestStatus enum
```

**Acceptance criteria:**
- [ ] Revision request creates RevisionRequest record
- [ ] Quest status updates to REVISION_REQUESTED
- [ ] Assigned adventurer sees revision details on their dashboard
- [ ] Resubmission resolves the revision and returns quest to client review
- [ ] Deadline is set and visible

---

### Task 1.5: Company Portal Transparency Notice

**Files**: Company portal quest submission page, Company portal landing page

Add a clear, non-dismissable notice:

```
Projects are completed by trained developers in our supervised guild program. 
All work passes through automated quality checks and senior review before delivery.
```

**Where it appears:**
- Company portal landing/dashboard page (banner)
- Quest submission form (above the submit button)
- Quest submission must include a checkbox: "I understand my project will be completed by guild members under senior review."

**Acceptance criteria:**
- [ ] Notice visible on company dashboard
- [ ] Notice visible on quest submission form
- [ ] Checkbox required before quest submission
- [ ] Cannot bypass or dismiss

---

### Task 1.6: Sub-Quest Display

**Files**: Quest detail pages, quest listing

When a quest has `parentQuestId`, display the relationship:

- On the parent quest page: show a "Sub-quests" section listing all child quests with their status
- On the sub-quest page: show a "Part of" link back to the parent quest
- On the quest board: sub-quests show a small badge indicating they're part of a larger quest

```typescript
// Fetching sub-quests:
// const subQuests = await prisma.quest.findMany({
//   where: { parentQuestId: questId },
//   select: { id: true, title: true, rank: true, status: true, track: true }
// });
```

**Acceptance criteria:**
- [ ] Parent quest shows list of sub-quests
- [ ] Sub-quest shows "Part of [Parent Quest Title]" link
- [ ] Quest board shows sub-quest badge
- [ ] Sub-quests inherit the parent's client/org but can have different track and rank

---

## Implementation Order

**Do these in exact order — each depends on the previous:**

```
Phase 0 (do first, no user-facing changes):
  0.1 Quest track + sub-quest fields  ← database foundation
  0.2 BootcampLink model              ← student tracking
  0.3 RevisionRequest model           ← modification handling
  0.4 GitHub Actions CI               ← quality gate
  0.5 PR template                     ← review process

Phase 1 (user-facing features):
  1.1 Onboard webhook                 ← depends on 0.2 (BootcampLink exists)
  1.2 Quest board track filtering     ← depends on 0.1 (track field exists)
  1.3 Modification request form       ← depends on 0.3 (RevisionRequest exists)
  1.4 Revision quest flow             ← depends on 1.3 (form submits data)
  1.5 Transparency notice             ← independent, do anytime in Phase 1
  1.6 Sub-quest display               ← depends on 0.1 (parentQuestId exists)
```

---

## Testing Notes

- All database changes should be tested against the Neon dev branch (not production)
- Webhook endpoint needs integration test with mock payload
- Track filtering needs tests for each user type (bootcamp student, intern, admin, company)
- Modification form needs edge case tests: max revisions hit, new scope flag, empty unmet criteria
- CI should be green before any Phase 1 work begins

## Environment Variables Needed

```
# Add to .env.local:
BOOTCAMP_WEBHOOK_SECRET=generate-a-secure-random-string
```
