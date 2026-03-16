# Issue Resolution Guide

Rules and process for solving GitHub issues on Adventurers Guild. This applies equally to human developers and AI coding agents.

---

## Before You Write a Single Line of Code

### 1. Read these files first

Every issue assumes you've read the following. Read them before starting any task:

| File | Why |
|------|-----|
| `CLAUDE.md` | Full project context, architecture, role system, key rules |
| `docs/ARCHITECTURE_DECISIONS.md` | Decisions that are final — do not revisit or work around them |
| `docs/contributor-onboarding.md` | Setup, conventions, auth patterns, DB patterns |
| `prisma/schema.prisma` | The database. Authoritative. Read this before touching models. |
| The issue itself | Contains context, spec, files to touch, acceptance criteria, and what NOT to do |

### 2. Read the files you're about to edit

Never edit a file you haven't read in the current session. Use your editor or tool to read the full file, understand the existing patterns, then make targeted changes.

### 3. Check what already exists

Before creating anything, grep for it:
```bash
# Does a route already exist?
grep -r "api/parties" app/api/

# Does a component exist?
find components/ -name "*party*"

# Is the model already in schema?
grep -A 10 "model Party" prisma/schema.prisma
```

Don't create duplicates. Don't create files the issue doesn't ask for.

---

## The Resolution Process

### Step 1: Understand the issue

Every issue has these sections. Understand each one before building:

- **Context** — why this feature exists and how it fits the platform
- **Spec** — exact schema, API contracts, UI requirements. This is what to build.
- **Files to touch** — explicit list. Create or modify only these files unless you have a clear reason.
- **Acceptance criteria** — checkboxes. Every box must be satisfiable before you open a PR.
- **What NOT to do** — traps. Avoid these explicitly.

If the issue links to a spec doc (e.g., `docs/SQUAD_PARTY_SYSTEM.md`), read that doc in full.

### Step 2: Plan before building

For any issue D-rank or above, write down what you're going to do before writing code:

1. Schema changes needed (if any)
2. New files to create
3. Existing files to modify
4. Order of operations (schema → migration → server logic → UI)

### Step 3: Schema first

If the issue requires schema changes:

1. Add models/fields to `prisma/schema.prisma`
2. Run the migration: `npx prisma migrate dev --name descriptive-name`
3. Verify with `npx prisma studio` or a quick query

Never modify the DB directly (no raw SQL outside migrations). Prisma schema is the single source of truth.

### Step 4: API routes before UI

Build and verify the API logic before building UI components. This avoids building UI against wrong data shapes.

### Step 5: UI last

Once the API is correct and tested, build the UI against it.

---

## Mandatory Patterns

These patterns are non-negotiable. Any deviation will be flagged in review.

### API auth — always use `requireAuth`

```typescript
import { requireAuth } from '@/lib/api-auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const auth = await requireAuth('adventurer', 'admin');
  if (auth instanceof NextResponse) return auth; // 401 or 403 returned automatically
  const { id: userId, role } = auth;
  // ...
}
```

Never use `getServerSession` directly in API routes.

### Prisma enum validation and casting

```typescript
import { QuestStatus } from '@prisma/client';

const { status } = await req.json();
if (status && !Object.values(QuestStatus).includes(status as QuestStatus)) {
  return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
}
// Safe to cast after validation:
where.status = status as QuestStatus;
```

### Admin has no CompanyProfile — skip profile ops

```typescript
if (role !== 'admin') {
  await db.companyProfile.update({
    where: { userId },
    data: { questsPosted: { increment: 1 } }
  });
}
```

### DB calls in server components — use withDbRetry

```typescript
import { withDbRetry } from '@/lib/db';

const quests = await withDbRetry(() =>
  db.quest.findMany({ where: { status: 'available' } })
);
```

### Error responses — consistent shape

```typescript
return NextResponse.json({ error: 'Human-readable message' }, { status: 400 });
return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
return NextResponse.json({ error: 'Not found' }, { status: 404 });
```

### Prisma schema conventions

```prisma
model MyModel {
  id        String   @id @default(uuid()) @db.Uuid
  someField String   @map("some_field")
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz

  @@map("my_models")
}
```

- IDs: `@id @default(uuid()) @db.Uuid`
- Timestamps: `@db.Timestamptz`
- snake_case in DB: `@map("snake_case")` and `@@map("table_name")`
- New required fields: always add `@default()` — existing rows must not break

---

## Scope Control

### Only touch what the issue says to touch

If the issue says "modify `app/api/parties/route.ts` and `prisma/schema.prisma`", those are the files. Don't refactor other files. Don't improve adjacent code. Don't add features not specified.

This is not about being robotic — it's about keeping PRs reviewable and diffable.

### Don't add extra error handling

Don't add error handling for scenarios that can't happen given the system's guarantees. For example: if `requireAuth` already validates the user exists, don't add a second "user not found" check.

### Don't add docstrings or comments unless the logic is non-obvious

The code should speak for itself. Only comment where there's a non-obvious business rule, a deliberate workaround, or a known caveat.

### Don't over-engineer

One-time operations don't need a utility function. Three similar-looking lines of code is better than a premature abstraction. Build exactly what's needed.

---

## Checks Before Opening a PR

Run all three. All must pass with zero errors:

```bash
npm run lint          # ESLint — must have 0 errors (warnings OK)
npm run type-check    # TypeScript — must have 0 errors
npm run build         # Next.js build — must complete with no errors
```

If any of these fail, fix the failure before opening the PR. Never open a PR with known errors.

---

## PR Checklist

Before submitting, verify:

- [ ] Every acceptance criterion in the issue is satisfied
- [ ] `npm run lint` passes with 0 errors
- [ ] `npm run type-check` passes with 0 errors
- [ ] `npm run build` passes
- [ ] No unrelated files modified
- [ ] No new `console.log` or debug code left in
- [ ] PR description has: what it does, issue reference (`Closes #N`), schema changes, test plan

---

## PR Description Template

```markdown
## What this does
[1-3 sentences describing the feature and why it exists]

## Issue
Closes #[issue number]

## Changes
- `prisma/schema.prisma` — added [X model / Y field]
- `app/api/parties/route.ts` — new POST endpoint for party creation
- `app/dashboard/quests/[id]/page.tsx` — added Party Panel component

## Schema changes
[List new models, fields, or enum values. Or "None".]

## Test plan
- [ ] Create a party as an adventurer with sufficient rank → party created, leader is a member
- [ ] Try to add a 3rd member to a BOOTCAMP party (maxSize=2) → returns 400
- [ ] Admin rejects a submission → assignment moves to needs_rework, revisionCount increments
- [ ] npm run lint → 0 errors
- [ ] npm run type-check → 0 errors
- [ ] npm run build → passes
```

---

## Common Mistakes to Avoid

| Mistake | What to do instead |
|---------|-------------------|
| Using `getServerSession` directly in API routes | Use `requireAuth()` from `lib/api-auth.ts` |
| Forgetting to cast Prisma enum params | Validate with `Object.values(Enum).includes(val)` then cast |
| Updating `companyProfile` for admin users | Check `role !== 'admin'` before `companyProfile.update` |
| Adding `<Navigation />` in a page component | Root layout already renders it — never add it inline |
| Using `any` type | Use the actual type, or `unknown` with a type guard |
| Adding `?track=BOOTCAMP` bypass logic in UI | Track enforcement is at the API level — UI can show what it wants |
| Mutating the quest status directly without `quest-lifecycle.ts` | Use the lifecycle helpers — they keep quest and assignment status in sync |
| Running a migration without `--name` | Always name your migrations: `--name add-party-squad-system` |
| Skipping `@default()` on a new required field | Existing rows will fail — always provide a default for new required fields |
| Creating files not mentioned in the issue | Work within the issue spec; raise a comment if something is missing |

---

## When You're Stuck

1. **Re-read the spec doc** linked in the issue — the answer is usually there
2. **Read the existing similar routes** — pattern-match off the codebase
3. **Check `docs/ARCHITECTURE_DECISIONS.md`** — explains why constraints exist
4. **Add a comment to the issue** describing what you're blocked on — be specific about what you tried

Do not guess at behavior not described in the spec. If the spec is ambiguous, ask.
