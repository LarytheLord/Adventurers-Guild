# Contributor Onboarding — Adventurers Guild

This guide gets you from zero to first PR as fast as possible. Read it once before touching any code.

---

## What This Project Is

Adventurers Guild is a gamified developer marketplace where:
- **Adventurers** (developers) complete coding **Quests** for XP, rank progression, and payment
- **Companies** post and review quests, pay on approval
- **Admin** (Open Paws team) mediates all quality and client relations
- **Bootcamp students** (Open Paws Bootcamp) enter as F-rank Adventurers, unlock real work by completing 2 tutorial quests

The platform runs two tracks:
- **INTERN track** — 20 paid interns, D+ rank quests, squads of 3–5
- **BOOTCAMP track** — 20–50 students, F/E rank quests only, solo or pairs

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 App Router |
| Language | TypeScript |
| Database | Neon (serverless PostgreSQL) |
| ORM | Prisma 6 |
| Auth | NextAuth.js v4 (credentials + JWT, 30-day sessions) |
| UI | shadcn/ui + Tailwind CSS + Radix UI |
| Deployment | Vercel |
| Payments | Stripe Connect (international) + Razorpay (India) |
| Notifications | Discord webhooks |

---

## Repository Map

```
app/
  api/                    # All API routes (auth, quests, admin, payments, public)
  dashboard/              # Adventurer + company dashboards
  admin/                  # Admin panel (quest management, user management, QA)
  home/                   # Landing page
  login/, register/       # Auth pages (dark split layout)
components/
  ui/                     # shadcn/ui base + custom (rank-badge, xp-bar, hero)
  landing/                # Landing page section components
lib/
  auth.ts                 # NextAuth config + JWT/session callbacks
  db.ts                   # Prisma client singleton + withDbRetry()
  api-auth.ts             # requireAuth(...roles) helper
  payment-utils.ts        # Payment processing
  xp-utils.ts             # XP/rank update logic
  quest-lifecycle.ts      # Quest status sync after assignment changes
  stripe.ts               # Stripe singleton
  razorpay.ts             # Razorpay singleton
  payment-provider.ts     # Unified provider (routes Stripe vs Razorpay by currency)
middleware.ts             # RBAC route protection (longest-prefix-match)
prisma/
  schema.prisma           # DATABASE SCHEMA — single source of truth
  seed.ts                 # Development seed data
types/
  next-auth.d.ts          # Module augmentation (JWT/Session with id, role, rank, xp)
docs/                     # All documentation
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- A Neon account (free tier is fine for dev) — [neon.tech](https://neon.tech)

### Steps

```bash
# 1. Clone
git clone https://github.com/LarytheLord/Adventurers-Guild.git
cd Adventurers-Guild

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
```

Edit `.env.local` with your values:

```bash
# Required
DATABASE_URL="postgresql://..."              # from Neon — pooled connection
DATABASE_URL_UNPOOLED="postgresql://..."     # from Neon — direct connection
NEXTAUTH_SECRET="..."                        # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Bootcamp
ONBOARD_WEBHOOK_SECRET="dev-secret-local"

# Optional — only needed for specific tasks
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
```

```bash
# 4. Set up database
npx prisma generate          # generate Prisma client
npx prisma migrate dev        # apply migrations
npm run db:seed               # seed sample data

# 5. Start dev server
npm run dev
```

Visit `http://localhost:3000`. The seed creates:
- `admin@guild.com` / `password123` (admin)
- `company@test.com` / `password123` (company)
- `adventurer@test.com` / `password123` (adventurer)

---

## Key Architecture Rules

These are non-negotiable. Read [`docs/ARCHITECTURE_DECISIONS.md`](./ARCHITECTURE_DECISIONS.md) for the full reasoning.

### Auth
Use `requireAuth(...roles)` from `lib/api-auth.ts` for all API route protection. Never use `getServerSession` directly in API routes.

```typescript
// In any API route handler:
const auth = await requireAuth('adventurer', 'admin');
if (auth instanceof NextResponse) return auth; // returns 401/403 automatically
const { id: userId, role } = auth;
```

### Admin has no CompanyProfile
Admin can access all company routes but has no `CompanyProfile` row. Any code that does `companyProfile.update` must check `role !== 'admin'` first.

```typescript
if (role !== 'admin') {
  await db.companyProfile.update({ where: { userId }, data: { questsPosted: { increment: 1 } } });
}
```

### Prisma enum casting
String query params must be cast to Prisma enum types after validation:

```typescript
if (!Object.values(QuestStatus).includes(status as QuestStatus)) {
  return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
}
where.status = status as QuestStatus;
```

### DB calls in server components
Wrap in `withDbRetry()` to handle Neon cold-start:

```typescript
const quests = await withDbRetry(() => db.quest.findMany({ ... }));
```

### No layout duplication
`app/layout.tsx` renders `<Navigation />` and `<SiteFooter />` for all pages. Never add these inside pages or layouts that already inherit from root.

---

## User Roles

| Role | Access | Has Profile |
|------|--------|-------------|
| `adventurer` | Dashboard, quest board, apply/submit | `AdventurerProfile` |
| `company` | Company dashboard, post quests, review | `CompanyProfile` |
| `admin` | All routes + `/admin/**` | None (skip profile ops) |

---

## Quest and Assignment Lifecycles

**Quest**: `draft → available → in_progress → review → completed / cancelled`

**Assignment**: `assigned → started → in_progress → submitted → review → completed / cancelled`

The `lib/quest-lifecycle.ts` file keeps quest status in sync with its assignments. Multi-participant quests stay `available` until all slots are filled.

---

## Running Checks

Before every commit and before opening a PR:

```bash
npm run lint          # 0 errors required
npm run type-check    # 0 errors required
npm run build         # must pass clean
```

Warnings are fine. Errors block merge.

---

## Contribution Workflow

1. **Pick an issue** from the GitHub Issues page
2. **Read the issue completely** — especially Context, Spec, Files to touch, and Acceptance criteria
3. **Read the files** before editing them — understand the existing pattern first
4. **Create a branch**: `feat/squad-party-schema` or `fix/revision-count`
5. **Build to spec** — don't add features not in the issue
6. **Run checks**: lint + type-check + build must all pass
7. **Open PR** targeting `development` branch with the standard PR description template (see `CONTRIBUTING.md`)

---

## Where to Get Help

- **Architecture questions**: `docs/ARCHITECTURE_DECISIONS.md`
- **Task specs**: `docs/IMPLEMENTATION_TASKS.md` and the linked GitHub issues
- **Issue resolution rules**: `docs/ISSUE_RESOLUTION_GUIDE.md`
- **DB schema**: `prisma/schema.prisma`
- **Discord**: #guild-dev channel for real-time questions
