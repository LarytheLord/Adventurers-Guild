# Contributor Onboarding Guide

Welcome to Adventurers Guild. This guide gives you the fastest path to productive contributions.

## What This Project Is
Adventurers Guild is a gamified engineering marketplace:
- Adventurers complete coding quests
- Companies post and review quests
- Platform tracks rank, XP, quality, and payouts

## Stack
- Next.js 15 (App Router)
- TypeScript + Tailwind + shadcn/ui
- NextAuth (credentials, JWT sessions)
- Neon Postgres + Prisma

## Local Setup
1. Fork and clone:
```bash
git clone https://github.com/YOUR_USERNAME/adventurers-guild.git
cd adventurers-guild
```
2. Install:
```bash
npm install
```
3. Configure env:
```bash
cp .env.example .env.local
```
4. Fill required vars:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
5. Run:
```bash
npm run dev
```

## Data Layer
- Prisma schema: `prisma/schema.prisma`
- Generate client:
```bash
npx prisma generate
```
- Push schema (dev):
```bash
npm run db:push
```
- Seed:
```bash
npm run db:seed
```

## Project Structure
```text
app/                  # App routes + API handlers
app/api/              # API endpoints
app/dashboard/        # Adventurer/company dashboards
components/           # Reusable components
lib/                  # Auth, DB, domain utilities
prisma/               # DB schema and seed
docs/                 # Documentation
```

## Contribution Workflow
1. Create branch:
```bash
git checkout -b feature/short-description
```
2. Make focused change
3. Run checks:
```bash
npm run lint
npm run type-check
npm run build
```
4. Push and open PR

## Standards
- Use TypeScript for all new code.
- Prefer `lib/api-auth.ts` helpers for API auth/role checks.
- Keep API responses stable unless updating all callers.
- Add/adjust tests when changing core flow behavior.

## Where To Start
- Read `docs/INFRA_AND_PRODUCT_PLAN_2026-03-04.md`
- Pick a task from current roadmap/issues
- Start with Phase 0 stabilization items if unsure
