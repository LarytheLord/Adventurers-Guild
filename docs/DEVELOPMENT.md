# Development Guide

This guide covers local setup and day-to-day development for Adventurers Guild.

## Prerequisites
- Node.js LTS
- npm
- Git
- Neon Postgres database

## Setup
1. Clone repository:
```bash
git clone https://github.com/LarytheLord/adventurers-guild.git
cd adventurers-guild
```
2. Install dependencies:
```bash
npm install
```
3. Create local env file:
```bash
cp .env.example .env.local
```
4. Fill required variables in `.env.local`:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## Database
- ORM: Prisma
- Primary schema: `prisma/schema.prisma`
- Generate client:
```bash
npx prisma generate
```
- Push schema (dev only):
```bash
npm run db:push
```
- Seed sample data:
```bash
npm run db:seed
```

## Run App
```bash
npm run dev
```
App runs on `http://localhost:3000`.

## Quality Checks
- Lint:
```bash
npm run lint
```
- Type check:
```bash
npm run type-check
```
- Production build:
```bash
npm run build
```

## Testing
- Playwright config exists at `playwright.config.ts`.
- Add E2E tests under `__tests__/e2e`.
- Run E2E tests:
```bash
npx playwright test
```
- Run full phase gate before moving to the next phase:
```bash
npm run test:phase-gate
```
This validates type safety, lint, and cross-browser end-to-end flows in one command.

## Architecture (Current)
- Frontend/API: Next.js App Router
- Auth: NextAuth credentials provider (JWT sessions)
- Database: Neon Postgres + Prisma
- Deployment: Vercel

## Key Paths
- `app/` app routes and API handlers
- `components/` UI and feature components
- `lib/` auth, DB client, domain helpers
- `prisma/` schema + seed
- `docs/` project and architecture docs

## Notes
- Prefer `lib/api-auth.ts` helpers (`getAuthUser`, `requireAuth`) for API route auth checks.
- Keep API responses backward-compatible where existing clients rely on legacy keys.
