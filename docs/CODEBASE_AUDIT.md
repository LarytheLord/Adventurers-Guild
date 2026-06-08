# Codebase Audit — The Adventurers Guild
**Date:** 2026-03-10
**Auditor:** Claude Sonnet 4.6
**Status:** ✅ All critical issues resolved

---

## 1. Architecture Overview

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui (Radix) |
| Database | Neon PostgreSQL (serverless) |
| ORM | Prisma 6 |
| Auth | NextAuth v4 (JWT, 30-day sessions) |
| Password hashing | bcryptjs (12 rounds) |
| Validation | Zod + React Hook Form |
| Hosting | Vercel |

### Folder Structure
```
app/
  api/            ← API routes (Next.js Route Handlers)
    admin/        ← Admin-only endpoints (users, quests)
    auth/         ← NextAuth + register + password reset
    company/      ← Company quest CRUD
    quests/       ← Quest discovery, assignments, submissions
    rankings/     ← Leaderboard
    users/        ← User stats/quests
  admin/          ← Admin dashboard pages
    quests/       ← Admin quest management page
  dashboard/      ← Authenticated user dashboards
    company/      ← Company-specific views
      quests/[id]/edit/ ← Quest edit form
    quests/       ← Quest board (adventurer)
  home/           ← Public landing page
  login/register/ ← Auth pages
components/
  ui/             ← shadcn/ui primitives (50+ components)
  guild/          ← Custom styled layout primitives
  landing/        ← Landing page sections
lib/
  auth.ts         ← NextAuth config
  db.ts           ← Prisma client singleton + withDbRetry
  api-auth.ts     ← requireAuth() helper
  quest-lifecycle.ts ← Quest status machine
  xp-utils.ts     ← XP/rank award logic
prisma/
  schema.prisma   ← Source of truth for DB schema
middleware.ts     ← Edge RBAC (role-based route protection)
```

---

## 2. Authentication Flow

**Provider:** CredentialsProvider (email + password)
**Strategy:** JWT (30-day maxAge)

```
1. User submits email + password
2. NextAuth CredentialsProvider:
   a. Normalizes email (trim + lowercase)
   b. Fetches user by email from DB
   c. bcrypt.compare(password, user.passwordHash)
   d. Updates lastLoginAt
   e. Returns { id, email, name, role, rank, xp }
3. JWT callback enriches token with id, role, rank, xp
4. Session callback surfaces them as session.user.*
5. Middleware reads JWT via getToken() and enforces RBAC
```

**User Roles:**
- `adventurer` → quest board, my-quests, leaderboard, skill-tree
- `company` → quest creation, applicant management, analytics
- `admin` → all company routes + all admin routes (full access)

---

## 3. Quest Lifecycle

```
DRAFT → (admin/company publishes) → AVAILABLE
AVAILABLE → (adventurers apply, company accepts) → IN_PROGRESS
IN_PROGRESS → (adventurer submits) → REVIEW
REVIEW → (company approves) → COMPLETED
       → (company reworks) → IN_PROGRESS (repeat)
       → (company rejects) → IN_PROGRESS
Any → (admin/company cancels) → CANCELLED
```

**Status derivation** (`lib/quest-lifecycle.ts`):
- Quest stays `available` until filled slots (started/in_progress/submitted/review/completed) ≥ `maxParticipants`
- Any active assignment in `submitted`/`review` → quest moves to `review`
- All active assignments `completed` → quest moves to `completed`

**XP/SP award** (`lib/xp-utils.ts`):
- On submission approval: creates `QuestCompletion`, increments user XP/SP, checks for rank-up, sends notification

---

## 4. Database Schema Summary

Applied via `prisma db push` (no migrations folder).

**Key models:** `User`, `AdventurerProfile`, `CompanyProfile`, `Quest`, `QuestAssignment`, `QuestSubmission`, `QuestCompletion`, `Notification`, `Team`, `SkillProgress`, `Transaction`, `Mentorship`, `PasswordResetToken`, `ErrorLog`

**Quest fields of note:**
- `status: QuestStatus` — draft/available/in_progress/review/completed/cancelled
- `difficulty: UserRank` — F/E/D/C/B/A/S (same enum as user rank)
- `questCategory: QuestCategory` — frontend/backend/fullstack/mobile/ai_ml/devops/security/qa/design/data_science
- `questType: QuestType` — commission/internal/bug_bounty/code_refactor/learning
- `adminNotes: Json?` — array of `{id, timestamp, author, note}` for Phase 1 observations *(added this session)*
- `maxParticipants: Int?` — null = unlimited; if set, caps accepted slots

---

## 5. All API Routes

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | `/api/auth/register` | Public | Register new user |
| GET/POST | `/api/auth/[...nextauth]` | Public | NextAuth handler |
| POST | `/api/auth/forgot-password` | Public | Initiate password reset |
| POST | `/api/auth/reset-password` | Public | Complete password reset |
| GET | `/api/quests` | Public | List available quests |
| GET | `/api/quests/[id]` | Public | Get single quest with assignments |
| POST | `/api/quests/assignments` | adventurer | Apply to a quest |
| PUT | `/api/quests/assignments` | adventurer/admin | Update assignment status |
| GET | `/api/quests/[id]/assignments` | company/admin | View quest applicants |
| PUT | `/api/quests/[id]/assignments` | company/admin | Accept/reject applicant |
| POST | `/api/quests/submissions` | adventurer | Submit quest work |
| PUT | `/api/quests/submissions` | company/admin | Review submission |
| GET | `/api/company/quests` | company/admin | Company's quests |
| POST | `/api/company/quests` | company/admin | Create quest |
| PUT | `/api/company/quests` | company/admin | Update quest |
| DELETE | `/api/company/quests` | company/admin | Cancel quest |
| GET | `/api/admin/users` | admin | All users |
| GET | `/api/admin/quests` | admin | All quests |
| **POST** | **`/api/admin/quests`** | **admin** | **Create quest as admin** *(new)* |
| PUT | `/api/admin/quests` | admin | Update quest or add observation notes |
| DELETE | `/api/admin/quests` | admin | Cancel quest |
| GET | `/api/rankings` | Auth | Leaderboard |
| GET | `/api/users/me/stats` | Auth | User stats |

---

## 6. Issues Found & Fixed

### Critical Bugs Fixed (this session)

| # | Issue | Root Cause | Fix |
|---|-------|-----------|-----|
| 1 | **Admin couldn't create quests** | Middleware only allowed `company` on `/dashboard/company/create-quest`; create-quest page hard-coded `role !== 'company'` guard | Added `admin` to all company route entries in `middleware.ts`; changed page guard to accept both |
| 2 | **Admin quest creation crashed** | `companyProfile.update` in POST `/api/company/quests` fails for admin (no `CompanyProfile`) | Wrapped update with `if (authUser.role !== 'admin')` |
| 3 | **Quest editing was a stub** | "Edit Quest" button showed a toast "coming in follow-up" | Built full edit form at `/dashboard/company/quests/[id]/edit`; button now links there |
| 4 | **Admin dashboard was read-only** | `/admin/page.tsx` only showed stats | Added quick actions, Phase 1 checklist, links to quest management |
| 5 | **No admin quest management** | No page existed | Built `/admin/quests` with full list, status control, notes, cancel |

### Bugs Fixed (previous sessions)
- Application limit mismatch: guard now uses `FILLED_STATUSES` not all non-cancelled
- Avatar fallback null dereference: `name?.[0]?.toUpperCase() ?? '?'`
- Neon cold-start: `withDbRetry` in `lib/db.ts`
- WebGL crash in private browsers: shader hero fallback

---

## 7. Known Issues / Technical Debt

| Area | Issue | Priority |
|------|-------|---------|
| Email notifications | No emails sent on quest events | Medium — Phase 2 |
| Payment system | Routes exist but UI not connected | Low — Phase 2 |
| Quest preview mode | No "Preview as adventurer" on create/edit form | Medium |
| Form auto-save | Create/edit form doesn't persist drafts to localStorage | Low |
| Quest editing for admin | PUT `/api/company/quests` ownership check would fail for admin editing other users' quests | Medium — admin should use `/api/admin/quests` PUT instead |
| Skill tree | Exists in DB but UI not fully implemented | Low — Phase 2 |
| Mentorship | API routes exist but no UI | Low — Phase 2 |

---

## 8. Security Status

| Check | Status |
|-------|--------|
| SQL injection | ✅ Prisma ORM with parameterized queries |
| XSS | ✅ React escapes all output |
| Auth bypass | ✅ All routes use `requireAuth`; middleware enforces RBAC |
| Password storage | ✅ bcrypt 12 rounds |
| CSRF | ✅ NextAuth v4 handles CSRF tokens |
| Role escalation | ✅ Role set at registration, no self-service change |

---

## 9. Required Environment Variables

```bash
DATABASE_URL=           # Neon pooled connection string
DATABASE_URL_UNPOOLED=  # Neon direct connection string
NEXTAUTH_SECRET=        # openssl rand -base64 32
NEXTAUTH_URL=           # Production: https://yourdomain.com
NEXT_PUBLIC_APP_URL=    # Same as NEXTAUTH_URL
```

---

## 10. Build Status

```
npm run type-check → 0 errors ✅
npm run lint       → 0 errors (warnings only) ✅
npm run build      → passes clean ✅
```
