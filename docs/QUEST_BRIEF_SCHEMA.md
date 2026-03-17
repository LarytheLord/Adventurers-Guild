# QUEST_BRIEF_SCHEMA.md — Quest Data Format Reference

## Quest Brief Template

Every quest in the system follows this structure. When creating seed data, tutorial quests, or importing backlog items, use this format.

```typescript
interface QuestBrief {
  // Core identification
  title: string;                    // Clear, descriptive. e.g. "Add email alerts to RescueRadar"
  rank: "F" | "E" | "D" | "C" | "B" | "A" | "S";
  track: "INTERN" | "BOOTCAMP";    // Who can see/accept this quest

  // Client/Source
  clientOrg: string;               // Organization name or "Internal" for Open Paws work
  
  // Scope
  problemStatement: string;         // 2–3 sentences: what exists, what's wrong, desired outcome
  deliverables: string[];           // Exhaustive list of what must be submitted
  acceptanceCriteria: {             // Binary pass/fail. No ambiguity.
    id: string;                     // Unique ID like "ac-1", "ac-2"
    description: string;            // "Email notification sends when new alert is created"
    testable: boolean;              // Always true. If you can't test it, rewrite it.
  }[];

  // Technical
  techStack: string[];              // ["Next.js", "TypeScript", "Prisma", "Neon PostgreSQL"]
  starterRepo?: string;             // GitHub URL or null for greenfield
  
  // Sizing
  estimatedHours: number;           // F: 3–8, E: 8–20, D: 20–40, C+: 40+
  deadline?: string;                // ISO date or null (flexible)
  squadSize: "solo" | "pair" | "squad_3_5" | "squad_5_plus";
  
  // Relationships
  parentQuestId?: string;           // If this is a sub-task of a D+ quest
  
  // IP (set during quest creation)
  ipTerms: "open_source_mit" | "client_owns" | "open_paws_internal";
}
```

## Rank Decision Rules

Use these rules when assigning rank to a quest:

| Rank | Track    | Scope                          | Lines of Code | Squad Size    |
|------|----------|--------------------------------|---------------|---------------|
| F    | BOOTCAMP | Single file, follows patterns  | < 50          | Solo          |
| E    | BOOTCAMP | Single feature, minor variation | < 200         | Pair          |
| D    | INTERN   | Multi-file, new UI + backend   | 200–500       | Squad (3–5)   |
| C    | INTERN   | Full module, architecture      | 500+          | Squad (3–5)   |
| B+   | INTERN   | Full product / system redesign | 1000+         | Large (5+)    |

**Hard rule: Bootcamp students NEVER receive D+ quests.** The track field enforces this at the database level.

## Tutorial Quest Templates

These are the mandatory onboarding quests every bootcamp student completes before accessing real work.

### Tutorial Quest 1: "First Blood"

```json
{
  "title": "Tutorial: First Blood — Fix 3 Bugs",
  "rank": "F",
  "track": "BOOTCAMP",
  "clientOrg": "Internal",
  "problemStatement": "The Adventurers Guild platform has 3 tagged issues that need fixing. This tutorial quest teaches you the PR workflow, CI pipeline, and code review process.",
  "deliverables": [
    "3 separate PRs, one per bug fix",
    "Each PR follows the PR template",
    "All CI checks pass"
  ],
  "acceptanceCriteria": [
    { "id": "t1-1", "description": "Bug 1 is fixed and PR is merged", "testable": true },
    { "id": "t1-2", "description": "Bug 2 is fixed and PR is merged", "testable": true },
    { "id": "t1-3", "description": "Bug 3 is fixed and PR is merged", "testable": true },
    { "id": "t1-4", "description": "All 3 PRs follow the PR template", "testable": true },
    { "id": "t1-5", "description": "All CI checks pass on all 3 PRs", "testable": true }
  ],
  "techStack": ["Next.js", "TypeScript", "Tailwind CSS"],
  "starterRepo": "https://github.com/LarytheLord/Adventurers-Guild",
  "estimatedHours": 4,
  "squadSize": "solo",
  "ipTerms": "open_source_mit"
}
```

### Tutorial Quest 2: "Party Up"

```json
{
  "title": "Tutorial: Party Up — Paired Feature Add",
  "rank": "E",
  "track": "BOOTCAMP",
  "clientOrg": "Internal",
  "problemStatement": "Work with a partner to add a small feature to an Open Paws open-source tool. This teaches collaboration via GitHub, code review as both author AND reviewer, and coordinating with a teammate.",
  "deliverables": [
    "Feature implemented in a single PR",
    "Both partners listed as co-authors (use Co-authored-by in commit)",
    "Each partner has reviewed the other's commits",
    "CI passes"
  ],
  "acceptanceCriteria": [
    { "id": "t2-1", "description": "Feature works as specified in the issue", "testable": true },
    { "id": "t2-2", "description": "Both partners have commits in the PR", "testable": true },
    { "id": "t2-3", "description": "PR has peer review from partner", "testable": true },
    { "id": "t2-4", "description": "CI passes", "testable": true }
  ],
  "techStack": ["Next.js", "TypeScript"],
  "estimatedHours": 8,
  "squadSize": "pair",
  "ipTerms": "open_source_mit"
}
```

## Backlog Decomposition Pattern

When a D+ quest (for interns) is created, it should generate 1–3 F/E sub-quests for bootcamp students.

**Example decomposition:**

```
Parent Quest (D-Rank, INTERN):
  "Build notification dashboard for SufferingWatch"
  
Sub-Quest 1 (F-Rank, BOOTCAMP):
  "Write API documentation for notification endpoints"
  parentQuestId: [parent.id]
  
Sub-Quest 2 (F-Rank, BOOTCAMP):
  "Create test fixtures for 5 notification types"
  parentQuestId: [parent.id]
  
Sub-Quest 3 (E-Rank, BOOTCAMP):
  "Style the empty state and error states for the notification list"
  parentQuestId: [parent.id]
```

**Common F/E sub-task patterns:**
- Write README / API documentation for a module
- Create test fixtures or test data
- Style error states, empty states, loading states
- Add form validation messages
- Write TypeScript type definitions
- Update environment variable documentation
- Add accessibility attributes (aria labels, alt text)
- Create seed data scripts

## Quest Status Flow

```
OPEN → ACCEPTED → IN_PROGRESS → SUBMITTED → UNDER_REVIEW → 
  → APPROVED (done)
  → REVISION_REQUESTED → IN_PROGRESS → SUBMITTED → ... (max 2 cycles)
  → ESCALATED (review team investigates)
```

For revision handling, see Task 1.3 and 1.4 in IMPLEMENTATION_TASKS.md.
