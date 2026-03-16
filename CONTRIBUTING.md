# Contributing to Adventurers Guild

This document is the source of truth for how work gets done on this project — whether you're a human developer or an AI agent picking up a GitHub issue.

---

## Table of Contents

1. [Project Context](#project-context)
2. [Local Setup](#local-setup)
3. [How Work Is Organized](#how-work-is-organized)
4. [Rules for Solving Issues](#rules-for-solving-issues)
5. [Branch and PR conventions](#branch-and-pr-conventions)
6. [Code Standards](#code-standards)
7. [Definition of Done](#definition-of-done)

---

## Project Context

Adventurers Guild is a gamified developer marketplace. Adventurers (developers) complete Quests for Companies (clients), earn XP, and climb ranks F → S. It's also the delivery backbone for the Open Paws Bootcamp — a 10-week coding program where bootcamp students complete real client work as ranked Adventurers.

**Tech Stack:**
- Next.js 15 App Router — framework and BFF
- TypeScript — all code is typed
- Neon (serverless PostgreSQL) + Prisma 6 ORM — database
- NextAuth.js v4 (credentials + JWT, 30-day sessions) — auth
- shadcn/ui + Tailwind CSS + Radix UI — UI components
- Vercel — deployment

**Key docs to read before contributing:**
- [`CLAUDE.md`](./CLAUDE.md) — full project context, architecture, and rules
- [`docs/ARCHITECTURE_DECISIONS.md`](./docs/ARCHITECTURE_DECISIONS.md) — why things are the way they are (do not revisit)
- [`docs/IMPLEMENTATION_TASKS.md`](./docs/IMPLEMENTATION_TASKS.md) — current task queue
- [`docs/ISSUE_RESOLUTION_GUIDE.md`](./docs/ISSUE_RESOLUTION_GUIDE.md) — detailed rules for completing issues
- [`prisma/schema.prisma`](./prisma/schema.prisma) — authoritative database schema

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/LarytheLord/Adventurers-Guild.git
cd Adventurers-Guild
npm install
```

### 2. Configure environment

Copy the example env file:

```bash
cp .env.example .env.local
```

Required variables:

```bash
# Database — get from Neon dashboard
DATABASE_URL="postgresql://..."
DATABASE_URL_UNPOOLED="postgresql://..."

# Auth — generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Bootcamp webhook (optional for most tasks)
ONBOARD_WEBHOOK_SECRET="dev-secret"

# Discord notifications (optional)
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."

# Stripe (only needed for payment tasks)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Razorpay (only needed for payment tasks — India)
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
```

### 3. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Apply migrations (dev only)
npx prisma migrate dev

# Seed with sample data
npm run db:seed
```

### 4. Run the dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## How Work Is Organized

### GitHub Issues = Quests

Every piece of work is a GitHub issue. Issues are labeled by rank:

| Label | Rank | What it means |
|-------|------|---------------|
| `F-rank` | F | Isolated, well-defined. Good first issue. < 100 lines. |
| `E-rank` | E | Small feature or fix. Follows clear existing patterns. |
| `D-rank` | D | Moderate complexity. May touch multiple files. |
| `C-rank` | C | Feature with schema changes or new API routes. |
| `B-rank` | B | Multi-file feature, significant logic. |
| `A-rank` | A | Complex system. Requires architecture understanding. |
| `S-rank` | S | Epic. Multi-phase, cross-cutting. Plan before building. |

### Branches

All work goes to `development` via PR. Never push directly to `main` or `development`.

Branch naming:
```
feat/squad-party-schema
fix/revision-count-not-incrementing
docs/update-contributing-guide
chore/remove-legacy-footer-component
```

---

## Rules for Solving Issues

> **Read [`docs/ISSUE_RESOLUTION_GUIDE.md`](./docs/ISSUE_RESOLUTION_GUIDE.md) for the full version.** The summary is here.

### 1. Read the issue completely before writing code

Every issue has:
- **Context** — why this exists and how it fits the system
- **Spec** — exact schema changes, API contracts, UI requirements
- **Files to touch** — explicit list of what to create or modify
- **Acceptance criteria** — checkboxes you must satisfy before opening a PR
- **What NOT to do** — common mistakes and off-limits changes

Read all of it. The issue is the spec. Don't invent behavior that isn't in the spec.

### 2. Read the files before editing them

Never edit a file you haven't read in the current session. Check the surrounding code for patterns to follow.

### 3. Follow existing patterns exactly

- API auth: use `requireAuth(...roles)` from `lib/api-auth.ts` — never roll your own
- Enum validation: `Object.values(SomeEnum).includes(val as SomeEnum)` before casting
- Prisma enums in queries: cast strings — `where.status = status as QuestStatus`
- Error responses: `return NextResponse.json({ error: '...' }, { status: N })`
- Admin guard: admin has no `CompanyProfile` — skip `companyProfile.update` for admin role
- DB calls in server components: wrap in `withDbRetry()` from `lib/db.ts`

### 4. Don't over-engineer

- Don't add features not in the spec
- Don't add error handling for scenarios that can't happen
- Don't refactor code you didn't need to touch
- Don't add docstrings or comments unless the logic is genuinely non-obvious

### 5. Schema changes

Every schema change requires a migration:

```bash
npx prisma migrate dev --name describe-what-changed
```

Always use `@default()` for new required fields so existing rows aren't broken.

### 6. Run checks before opening a PR

```bash
npm run lint        # must have 0 errors
npm run type-check  # must have 0 errors
npm run build       # must pass clean
```

Warnings are OK. Errors are not.

---

## Branch and PR Conventions

### Commit messages — conventional commits

```
feat: add squad model and party assignment endpoint
fix: increment revision count on needs_rework status
docs: update implementation tasks for Phase 2
chore: remove unused legacy footer component
```

### PR description template

Every PR must include:

```markdown
## What this does
[1-3 sentences. What problem does this solve?]

## Issue
Closes #[issue number]

## Changes
- [File/feature 1]
- [File/feature 2]

## Schema changes
[List any new models, fields, or enums. Or "None"]

## Test plan
- [ ] [Manual step to verify the happy path]
- [ ] [Edge case to verify]
- [ ] npm run lint → 0 errors
- [ ] npm run type-check → 0 errors
- [ ] npm run build → passes
```

### PR rules

- PR targets `development` branch, not `main`
- One issue per PR (unless explicitly linked)
- No PR merges without all 3 checks passing (lint + type-check + build)
- Reference the issue: "Closes #N" so it auto-closes on merge

---

## Code Standards

### TypeScript

- All new code is TypeScript. No `any` unless absolutely unavoidable (and if so, comment why)
- Prefer explicit interfaces over inline types for anything more than 2 fields
- Cast Prisma enum params: `status as QuestStatus` (not coercion hacks)

### React / Next.js

- App Router: server components by default, `'use client'` only when needed (event handlers, hooks, browser APIs)
- Never add `<Navigation />` or `<SiteFooter />` inside pages — the root layout handles it
- New API routes follow the shape of existing ones in `app/api/`

### Design system

- Primary color: `orange-500`. No other accent colors.
- Rank colors live in `<RankBadge>` only — never hardcode rank colors elsewhere
- Dark backgrounds: `bg-slate-950` / `bg-slate-900`
- Use `shadcn/ui` components as base primitives

### Database

- Schema file `prisma/schema.prisma` is the authoritative source of truth
- Map column names with `@map("snake_case")` and `@@map("table_name")`
- Timestamps: `@db.Timestamptz` for all datetime fields
- UUIDs: `@default(uuid()) @db.Uuid` for all ID fields

---

## Definition of Done

A task is done when:

1. All acceptance criteria in the issue are checked off
2. `npm run lint` passes with 0 errors
3. `npm run type-check` passes with 0 errors
4. `npm run build` passes clean
5. PR is open targeting `development` with a description that matches the template above
6. No unrelated files are modified
