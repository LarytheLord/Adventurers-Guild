# Quest Edit & Admin Bypass — Complete Context

**Branch:** `fix/quest-edit-admin-bypass` (from `main`)
**Started:** 2026-06-11
**Status:** COMPLETE — 1 commit, build + lint pass, PR created

---

## THE PROBLEM (What Was Broken)

Companies who posted a quest couldn't edit it. The root cause was a **stack of 3 overlapping bugs**, not one broken button:

1. **Auth/session instability** — NextAuth JWT token resolution is fragile (multiple cookie mode fallbacks in middleware + api-auth). When token fails, every company mutation looks "broken" from the UI. This is a pre-existing issue, not introduced by this fix.

2. **Admin authorization bug** — PUT/DELETE handlers in `app/api/company/quests/route.ts` used `companyId = authUser.id` with no admin bypass. Admins could reach company quest surfaces but always 403'd on edit/cancel because `quest.companyId !== authUser.id` (admin has no companyId).

3. **Create/edit contract mismatch** — Quest creation supports `fieldTemplateId`, `briefData`, `acceptanceCriteria`, `partnerOrgName`, `track`, `source`. The edit screen didn't load or submit most of these fields. The PUT allowlist was out of sync with the actual schema (had non-schema fields, missing schema fields).

---

## ALL FILES AUDITED (Full list of ownership-check patterns)

### Files with `companyId` ownership checks (all reviewed):
| File | Lines | Status |
|------|-------|--------|
| `app/api/company/quests/route.ts` | 168, 223 | ✅ FIXED |
| `app/api/quests/[id]/assignments/route.ts` | 30, 92 | ✅ Already correct (has admin bypass) |
| `app/api/quests/[id]/revisions/route.ts` | 42, 115 | ✅ Already correct (has admin bypass) |
| `app/api/quests/[id]/route.ts` | 122-123 | ✅ Already correct (has admin bypass) |
| `app/api/payments/route.ts` | 169, 176 | ✅ Already correct (has admin bypass) |
| `app/api/qa/reviews/route.ts` | 149 | ✅ Already correct (has admin bypass) |
| `app/api/quests/submissions/route.ts` | 208-209 | ✅ Already correct (has admin bypass) |
| `app/dashboard/company/quests/[id]/edit/page.tsx` | 104 | ✅ FIXED (added fields) |
| `lib/services/quest-service.ts` | 93 | ✅ Already correct |
| `lib/services/assignment-service.ts` | 158 | ✅ Already correct (has admin bypass) |
| `components/PaymentProcessor.tsx` | 68 | Client-side check only, not a blocker |

### Files with `user.role !== 'admin'` checks (all reviewed):
| File | Lines | Status |
|------|-------|--------|
| `app/admin/layout.tsx` | 18 | ✅ Admin-only layout, correct |
| `app/dashboard/company/quests/[id]/page.tsx` | 88 | ✅ Already correct (allows admin) |
| `app/dashboard/company/quests/page.tsx` | 70 | ✅ Already correct (allows admin) |
| `app/api/quests/assignments/route.ts` | 31 | ✅ Already correct (adventurer + admin) |
| `app/api/quests/submissions/route.ts` | 119 | ✅ Already correct (has admin bypass) |
| `app/api/parties/[id]/members/route.ts` | 79 | ✅ Already correct (has admin bypass) |

### Key Finding:
**Most files already have correct admin bypasses.** The only broken ones were in `app/api/company/quests/route.ts` (PUT/DELETE/GET) — the ownership check used `companyId = authUser.id` with no `isOwner` flag.

---

## WHAT WAS FIXED (1 commit)

### Commit: `3062fac` — Company quest edit flow fixes

**`app/api/company/quests/route.ts`** — 3 fixes:

1. **GET** — Admin quest list:
   - Before: `where = { companyId: authUser.id }` → admins got empty list
   - After: `isOwner = authUser.role === 'company'`, `where = isOwner ? { companyId: ownerCompanyId } : {}`

2. **PUT** — Admin bypass + allowlist sync:
   - Before: `if (!quest || quest.companyId !== companyId)` → admins always 403
   - After: `isOwner` flag, only check ownership when `role === 'company'`
   - Before allowlist: `submissionInstructions`, `expectedDeliverables` (non-schema), missing `fieldTemplateId`, `briefData`, `acceptanceCriteria`, `parentQuestId`
   - After allowlist: synced to Quest model exactly

3. **DELETE** — Admin bypass:
   - Before: `if (!quest || quest.companyId !== companyId)` → admins always 403
   - After: `isOwner` flag, only check ownership when `role === 'company'`

**`app/dashboard/company/quests/[id]/edit/page.tsx`** — 3 fixes:

1. **State** — Added `partnerOrgName`, `track`, `source` to form state
2. **Pre-fill** — Loading those fields from fetched quest data
3. **UI** — Added Track/Source/Partner Org Name fields (3-column grid)
4. **Submit** — Sending those fields in PUT body
5. **Interface** — Added fields to `QuestData` interface

**`lib/services/quest-service.ts:42`** — 1 fix:

- Company visibility: `OR: [{ companyId: user.id }, { status: 'available', track: 'OPEN' }]`
- → `OR: [{ companyId: user.id }, { companyId: null, status: 'available', track: 'OPEN' }]`
- Explicit `companyId: null` for public quests prevents accidentally matching company-owned quests with wrong status

---

## SIMILAR PATTERNS FOUND (Already Correct)

These files have the **same ownership-check smell** but were already correctly implemented with admin bypass:

```typescript
// app/api/quests/[id]/assignments/route.ts:30,92
if (user.role !== 'admin' && quest.companyId !== user.id) { ... }
// ✅ Correct — admin bypass present

// app/api/quests/[id]/revisions/route.ts:42,115
if (user.role !== 'admin' && quest.companyId !== user.id) { ... }
// ✅ Correct — admin bypass present

// app/api/payments/route.ts:169,176
if (authUser.role !== 'admin' && quest.companyId !== authUser.id) { ... }
// ✅ Correct — admin bypass present

// app/api/qa/reviews/route.ts:149
if (authUser.role !== 'admin' && existingSubmission.assignment.quest?.companyId !== authUser.id) { ... }
// ✅ Correct — admin bypass present

// app/api/quests/submissions/route.ts:208-209
if (user.role !== 'admin' && ...) { ... }
// ✅ Correct — admin bypass present
```

### The Pattern That Was Broken (in company/quests/route.ts):
```typescript
// BEFORE — broken:
const companyId = authUser.id;
if (!quest || quest.companyId !== companyId) { ... }
// Admins have no companyId, so this always fails for them

// AFTER — fixed:
const isOwner = authUser.role === 'company';
const ownerCompanyId = authUser.id;
if (isOwner && quest.companyId !== ownerCompanyId) { ... }
// Admins skip the ownership check entirely
```

---

## WHAT REMAINS (Known Issues Not Fixed)

### 1. Auth/session instability (pre-existing)
- NextAuth JWT token resolution is fragile
- Middleware has 5 fallback attempts for token retrieval
- API routes have similar fallbacks
- When token fails, every company mutation looks "broken"
- **Not fixed in this PR** — requires separate investigation into NextAuth v4 + Next.js 15 edge runtime compatibility
- **Affected files:** `lib/auth.ts`, `middleware.ts`, `lib/api-auth.ts`

### 2. Company quest detail page ownership check (client-side only)
- `app/dashboard/company/quests/[id]/page.tsx:88` — `session?.user?.role !== 'company' && session?.user?.role !== 'admin'`
- ✅ Already correct — allows admin

### 3. No admin UI for managing quests
- Admins can now edit/cancel quests via API, but there's no dedicated admin UI for this
- The `/dashboard/company/quests/[id]` page is accessible to admins but shows company-specific UI
- **Not a bug, just a missing feature**

---

## PRs CREATED

### PR #286 — Responsive mobile layout fixes
- **Branch:** `fix/responsive-mobile-layout`
- **URL:** https://github.com/LarytheLord/Adventurers-Guild/pull/286
- **3 commits:** core layout, responsive grids, remaining fixes + cleanup
- **Status:** Created, not yet merged

### PR — Quest edit admin bypass
- **Branch:** `fix/quest-edit-admin-bypass`
- **URL:** https://github.com/LarytheLord/Adventurers-Guild/pull/new/fix/quest-edit-admin-bypass
- **1 commit:** admin bypass + allowlist sync + visibility
- **Status:** Created, not yet merged

---

## VERIFICATION

- `npm run build` ✅ passes
- `npm run lint` ✅ no errors (all warnings are pre-existing)
- No changes to `main` branch
- Both fix branches created from clean `main`

---

## HOW TO CONTINUE

```bash
# To review the quest edit fixes:
git checkout fix/quest-edit-admin-bypass
git diff main...HEAD

# To review the responsive fixes:
git checkout fix/responsive-mobile-layout
git diff main...HEAD

# To merge either PR:
gh pr merge <pr-number> --squash --delete-branch
```

---

## KEY CONTEXT

- **Framework:** Next.js 15 (App Router), React 18, TypeScript
- **Auth:** NextAuth v4, JWT strategy, Credentials + GitHub + Google providers
- **DB:** Neon PostgreSQL via Prisma 6
- **Roles:** adventurer, company, admin
- **Admin rules:** Admin has NO CompanyProfile, skip companyProfile.update for admin
- **Design:** Orange-500 primary, 5-level grayscale, rank colors in RankBadge only
