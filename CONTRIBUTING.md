# Contributing to Adventurers Guild

This document describes how work gets done on this project. The product runs at [guilds.work](https://guilds.work).

External pull requests are welcome for bug fixes. For anything larger than a bug fix (new features, schema changes, design changes), please open an issue and agree on the approach with a maintainer before writing code.

Security issues are not reported through issues or pull requests. See [SECURITY.md](./SECURITY.md).

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
- [`docs/ARCHITECTURE_DECISIONS.md`](./docs/ARCHITECTURE_DECISIONS.md) — why things are the way they are (do not revisit)
- [`docs/DATABASE_SAFETY.md`](./docs/DATABASE_SAFETY.md) - rules for anything that touches the database
- [`docs/IMPLEMENTATION_TASKS.md`](./docs/IMPLEMENTATION_TASKS.md) — current task queue
- [`docs/ISSUE_RESOLUTION_GUIDE.md`](./docs/ISSUE_RESOLUTION_GUIDE.md) — detailed rules for completing issues
- [`prisma/schema.prisma`](./prisma/schema.prisma) — authoritative database schema

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/LarytheLord/Adventurers-Guild.git
cd Adventurers-Guild
npm ci
```

### 2. Configure environment

Copy the example env file:

```bash
cp .env.example .env.local
```

Required variables:

```bash
# Database - point at a Neon development branch, NEVER production
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

# Push schema to your own development database (see docs/DATABASE_SAFETY.md)
npm run db:push
```

### 4. Run the dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

Never put a production connection string in your local env. The `db:*` scripts refuse to run against production, and `docs/DATABASE_SAFETY.md` explains why.

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

All work goes to `main` via pull request. Never push directly to `main`. Fork the repo or branch from `main`, and open the PR against `main`.

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

Schema changes need an issue and maintainer agreement first. After editing `prisma/schema.prisma`, push the changes to your own development database:

```bash
npm run db:push
```

Always use `@default()` for new required fields so existing rows aren't broken. Do not add or edit files under `prisma/migrations/` unless a maintainer asks you to. Production migrations are applied only by the `db-migrate-deploy` workflow after merge (see `docs/DATABASE_SAFETY.md`).

### 6. Run checks before opening a PR

These are the same steps CI runs:

```bash
npm ci
npx prisma generate
npm run lint        # must have 0 errors
npm run type-check  # must have 0 errors
npm run test        # must pass
npm run build       # must pass clean
```

Warnings are OK. Errors are not.

### 7. Secret and PII guardrails

CI runs `.github/workflows/secret-scan.yml` on every PR and on pushes to `main`. It does two things, and both look only at the change being submitted, never at the full history:

- **gitleaks** (config: `.gitleaks.toml`) scans the commits in the PR for secrets.
- **`scripts/check-pii.mjs`** fails if an added line contains an email address or an Indian mobile number that is not on the allow-list. The allow-list lives in `scripts/lib/pii-core.cjs` (the team address, `example.com`/`.org`/`.net`, and `noreply` style addresses).

If a hit is intentional, put `pii-allow` in a comment on that line. If a secret was committed, rotate it first, then remove it.

Optional local pre-commit hook (runs both checks on staged changes only):

```bash
npm run hooks:install     # sets core.hooksPath to .githooks
npm run hooks:uninstall   # undo
```

The PII check needs only Node. The gitleaks step runs if you have [gitleaks](https://github.com/gitleaks/gitleaks) installed and is skipped with a notice otherwise. To check your branch by hand: `npm run check:pii` (compares against `origin/main`). Bypass once with `git commit --no-verify`; CI will still run.

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
- [ ] npm run test -> passes
- [ ] npm run build → passes
```

### PR rules

- PR targets `main`
- **One purpose per PR.** A bug fix is one PR. Do not mix in refactors, formatting changes, dependency bumps, or unrelated fixes; send those separately.
- Keep the diff small and limited to what the change needs
- No PR merges without CI passing (lint, type-check, test, build)
- Link the issue with "Closes #N" in the PR body so it auto-closes on merge. The "Require closing issue reference" check passes if the body has "Closes #N", if a maintainer applied the `no-issue` label, or if the author is the repository owner. If your PR has no issue, say so in the description and a maintainer will decide.

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
4. `npm run test` passes
5. `npm run build` passes clean
6. PR is open targeting `main` with a description that matches the template above
7. No unrelated files are modified
