# CLAUDE.md — Adventurers Guild

## What This Project Is

A gamified developer marketplace where **Adventurers** (developers) complete real coding **Quests** for **Companies** (clients). Adventurers earn XP, climb ranks (F → S), and get paid. Companies get production code with a built-in quality signal: rank = vetted skill.

The platform is expanding to integrate with the **Open Paws Bootcamp** — a 10-week coding bootcamp. This creates a two-track talent pipeline: professional interns and bootcamp students sharing the same quest infrastructure.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | Neon (serverless PostgreSQL) via Prisma 6 ORM |
| Auth | NextAuth.js v4 (Credentials Provider, JWT strategy, 30-day sessions) |
| UI | shadcn/ui + Tailwind CSS + Radix UI + Lucide React |
| Deployment | Vercel |
| Payments | Simulated (Stripe Connect integration planned) |

## Repository Structure

```
app/                    # Next.js App Router
  api/                  # API routes (auth, quests, admin, payments, public)
  dashboard/            # Adventurer + company dashboards
  admin/                # Admin panel
  home/                 # Landing page
  login/, register/     # Auth pages
components/
  ui/                   # shadcn/ui + custom (rank-badge, xp-bar, animated-shader-hero)
  landing/              # Landing page sections (StatsSection, QuestShowcase, BentoGrid, etc.)
lib/                    # Core utilities
  auth.ts               # NextAuth config + JWT/session callbacks
  db.ts                 # Prisma client singleton + withDbRetry helper
  api-auth.ts           # requireAuth(...roles) for API routes
  payment-utils.ts      # Payment processing functions
  xp-utils.ts           # XP/rank update logic
  quest-lifecycle.ts    # Quest status sync after assignment changes
  quest-constants.ts    # Shared constants + getQuestListPath()
middleware.ts           # RBAC route protection (longest-prefix-match)
prisma/
  schema.prisma         # DATABASE SCHEMA — authoritative source of truth
  seed.ts               # Development seed data
types/
  next-auth.d.ts        # Module augmentation (JWT/Session with id, role, rank, xp)
docs/                   # Project documentation
```

## User Roles

| Role | Access | Profile |
|------|--------|---------|
| `adventurer` | Dashboard, quest board, apply/submit | `AdventurerProfile` (skills, streak, completion rate) |
| `company` | Company dashboard, post quests, review submissions | `CompanyProfile` (companyName, questsPosted, totalSpent) |
| `admin` | All routes + `/admin/**`, quest management, user management | No profile (skip company-scoped operations) |

## Ranking System

`F → E → D → C → B → A → S` — XP thresholds determine rank. Higher rank = access to harder quests with bigger rewards.

## What Currently Works

- **Auth**: Register, login, JWT sessions, password reset, role-based redirects
- **Quest CRUD**: Create (company/admin), browse, filter, apply, assign, submit, review (approve/rework/reject)
- **Multi-participant quests**: `maxParticipants` controls slots; quest stays `available` until filled
- **XP/Ranking engine**: Approval triggers XP grant, rank-up, leaderboard update
- **Payment system**: Simulated transaction recording, earnings/spending dashboards
- **Admin panel**: User management, quest management (status change, notes, cancel), revenue overview
- **Landing page**: All sections pull live data from `/api/public/stats` and `/api/public/quests`
- **E2E tests**: 4 Playwright tests covering auth, quest flow, API ownership
- **CI**: GitHub Actions runs lint + type-check + build on push to main

## The Two-Track Architecture (Planned — Not Yet Implemented)

Two distinct talent pools will share the same platform:

### Track A: Interns (Professional)
- 20 paid, externally recruited interns
- Handle D+ rank quests (complex features, full modules)
- Can work in squads of 3–5

### Track B: Bootcamp Students (Apprentice)
- 20–50 enrolled in Open Paws Bootcamp
- Handle F and E rank quests ONLY
- Work solo (F) or in pairs (E)
- Must complete 2 tutorial quests before real work

**Implementation**: A `track` field on Quest controls visibility. A `BootcampLink` model ties bootcamp student IDs to Adventurer accounts. A `parentQuestId` enables sub-quest relationships. **None of these exist in the schema yet — see IMPLEMENTATION_TASKS.md for the build plan.**

## Key Files Reference

| Purpose | File |
|---------|------|
| NextAuth config | `lib/auth.ts` |
| Prisma client + retry | `lib/db.ts` |
| API auth helper | `lib/api-auth.ts` |
| RBAC middleware | `middleware.ts` |
| Registration | `app/api/auth/register/route.ts` |
| Quest lifecycle | `lib/quest-lifecycle.ts` |
| XP/rank updates | `lib/xp-utils.ts` |
| Payment utils | `lib/payment-utils.ts` |
| Type augmentation | `types/next-auth.d.ts` |
| DB schema | `prisma/schema.prisma` |

## Key Rules

1. **Prisma enums**: Always cast string params → `as QuestStatus`, `as UserRole`, etc. Validate with `Object.values()`.
2. **Neon cold-start**: Wrap server-component DB calls in `withDbRetry()`. API routes have try/catch returning JSON 500.
3. **Admin isolation**: Admin has NO `CompanyProfile`. Skip `companyProfile.update` operations for admin role.
4. **Landing page data**: All landing sections use `/api/public/stats` and `/api/public/quests`. No hardcoded fake data.
5. **Auth pages**: Dark split layout. Left branding panel, right form panel.
6. **Design**: Orange-500 primary. One accent color only. Rank colors quarantined to `<RankBadge>`.
7. **Navigation**: Root layout renders `<Navigation />` + `<SiteFooter />`. Dashboard has its own sidebar. Don't add nav/footer inline.

## Documentation Map

| File | Purpose |
|------|---------|
| `CLAUDE.md` | This file — project context |
| `CLAUDE_CODE_INSTRUCTIONS.md` | Working rules for Claude Code sessions |
| `docs/IMPLEMENTATION_TASKS.md` | Task queue with code-level specs |
| `docs/QUEST_BRIEF_SCHEMA.md` | Quest data format reference |
| `docs/ARCHITECTURE_DECISIONS.md` | 10 non-negotiable architecture decisions |
| `docs/INFRA_AND_PRODUCT_PLAN_2026-03-04.md` | Full infrastructure and product plan |
| `docs/contributor-onboarding.md` | Setup guide for new contributors |
| `FINANCIAL_MODEL.md` | Revenue model and growth projections |
| `MONETIZATION_ROADMAP.md` | Technical implementation plan for monetization |
