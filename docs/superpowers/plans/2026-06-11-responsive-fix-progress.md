# Responsive Mobile Layout Fix — Complete Context

**Branch:** `fix/responsive-mobile-layout` (from `main`)
**Started:** 2026-06-11
**Status:** In Progress — 2 commits done, ~4 tasks remaining

---

## THE PROBLEM (What's Going On)

The Adventurers-Guild platform works fine on PC/laptop but is **broken on mobile**. Three overlapping issues:

1. **Shared layout chrome problems:** duplicate anchor IDs, fixed nav covering headings, floating buttons overlapping content, missing `flex` on root wrapper
2. **Responsive discipline problems:** hardcoded `grid-cols-3/5` that never collapse, fixed-width inputs causing horizontal overflow, text too large on mobile
3. **Design-system drift:** two footer implementations (`footer-taped-design` vs `site-footer.tsx`), unused `styles/globals.css` backup file

---

## WHAT'S BEEN FIXED (2 commits on branch)

### Commit 1: `f108771` — Core layout + navigation overlap
- `app/layout.tsx:68` — `min-h-screen flex-col` → `min-h-screen flex flex-col` (wrapper now actually flexes)
- `app/page.tsx:69-84` — Removed `<section id="ranks">`, `<section id="how-it-works">`, `<section id="quests">` wrappers. Child components already have their own `id` attributes, so navigation detection still works. This fixes flaky hash navigation and wrong active-nav highlighting.
- `components/ui/go-to-top.tsx:49` — `fixed bottom-8 right-8 w-12 h-12` → `fixed bottom-4 right-4 w-10 h-10 sm:bottom-8 sm:right-8 sm:w-12 sm:h-12` (smaller on mobile to prevent content overlap)
- `components/landing/RankJourney.tsx:101` — Added `pt-20 lg:pt-0` so fixed nav doesn't cover "The Rank Journey" heading on mobile
- `components/landing/HowItWorks.tsx:109` — Added `pt-20 lg:pt-0` + `pt-20 lg:pt-0` on inner container
- `components/landing/QuestShowcase.tsx:81` — Added `pt-20 lg:pt-0` so fixed nav doesn't cover "Real work. Real people." heading on mobile

### Commit 2: `cd39594` — Responsive grids, fixed widths, hero sizing
**Grid layouts fixed (7 files):**
- `app/dashboard/settings/page.tsx:63` — `grid-cols-3` → `grid-cols-2 md:grid-cols-3`
- `app/dashboard/company/profile/page.tsx:140` — `grid-cols-3` → `sm:grid-cols-2 md:grid-cols-3`
- `app/quests/page.tsx:673` — `grid-cols-3` → `grid-cols-2 md:grid-cols-3`
- `components/QualityAssuranceDashboard.tsx:311` — `grid-cols-5` → `grid-cols-3 sm:grid-cols-5`
- `components/ui/onboarding-prompt.tsx:256` — `grid-cols-3` → `grid-cols-1 sm:grid-cols-3`
- `components/QuestMatcher.tsx:237` — `grid-cols-3` → `grid-cols-1 sm:grid-cols-3`
- `app/admin/quests/page.tsx:283` — `grid-cols-2 sm:grid-cols-5` (broken) → `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`
- `app/admin/analytics/page.tsx:332` — `grid-cols-2 lg:grid-cols-4` → `grid-cols-2 md:grid-cols-4`

**Fixed-width elements fixed (4 files):**
- `app/dashboard/quests/page.tsx:250` — `min-w-[180px]` → `min-w-[140px] sm:min-w-[180px]`
- `app/dashboard/quests/page.tsx:254` — `w-32` → `w-24 sm:w-32`
- `app/dashboard/leaderboard/page.tsx:167` — `min-w-[72px]` → `min-w-[60px] sm:min-w-[72px]`
- `app/admin/quests/page.tsx:439` — `w-[140px]` → `w-[120px] sm:w-[140px]`

**Hero + text sizing (3 files):**
- `components/ui/animated-shader-hero.tsx:361` — `h-screen` → `min-h-[500px] md:h-screen` (prevents GPU stalls on phones)
- `components/landing/QuestShowcase.tsx:94` — `text-[36px]` → `text-2xl sm:text-[36px] md:text-[44px]`
- `components/landing/HowItWorks.tsx:151` — `text-[22px]` → `text-xl sm:text-[22px]`

---

## WHAT REMAINS TO FIX

### Task A: Dashboard settings referral row (partial)
**File:** `app/dashboard/settings/page.tsx:50`
**Issue:** `flex items-center gap-3` — copy button sits beside a long referral link on mobile, causing cramped layout.
**Fix:** Already changed to `flex-col sm:flex-row gap-3` in commit 2. Verify the copy button has `sm:shrink-0`.

### Task B: Dashboard quests header and party chips
**File:** `app/dashboard/quests/page.tsx:230`
**Issue:** `flex items-center justify-between gap-4` — header with title and create button doesn't stack on mobile.
**Fix needed:** Add `flex-col sm:flex-row` or similar responsive stacking.

**File:** `app/dashboard/quests/page.tsx:302`
**Issue:** `flex flex-wrap items-center gap-2` — party toggle + active chips. Uses flex-wrap but could be tighter.
**Fix needed:** Review if chips need smaller sizing on mobile.

### Task C: Quest detail page sub-nav
**File:** `app/quests/[id]/page.tsx:158`
**Issue:** `sticky top-[72px] z-40` sub-navigation bar with back button and action buttons forced horizontal on mobile.
**Fix needed:** Make buttons stack on mobile, e.g., `flex-col sm:flex-row`.

### Task D: Design system cleanup (low priority)
**Files:** `styles/globals.css` (unused backup), `components/site-footer.tsx` (separate footer alongside `footer-taped-design`)
**Decision needed:** Which footer to keep? `ConditionalFooter.tsx` renders `footer-taped-design` on public routes. `site-footer.tsx` is a full footer that renders on non-dashboard routes. They likely both show on some pages = design drift.
**Action:** Review which one is actually used, remove the duplicate.

### Task E: Final verification
**Command:** `npm run build && npm run lint`
**Goal:** Ensure no TypeScript errors, no build failures, no lint warnings introduced by the responsive changes.

---

## ALL FILES REFERENCED (Full audit from subagent)

### Core chrome files
| File | Key lines | Status |
|------|-----------|--------|
| `app/layout.tsx` | 68 (flex wrapper) | ✅ Fixed |
| `app/page.tsx` | 69-84 (duplicate section IDs) | ✅ Fixed |
| `components/Navigation.tsx` | 290 (fixed nav pill) | ✅ Nav padding fixed via section pt |
| `components/ui/go-to-top.tsx` | 49 (floating button) | ✅ Fixed |
| `components/ConditionalFooter.tsx` | 4 (footer-taped-design) | ⏳ Review |
| `components/site-footer.tsx` | 1 (full footer) | ⏳ Review |
| `styles/globals.css` | 90 lines (unused backup) | ⏳ Review |

### Landing pages
| File | Key lines | Status |
|------|-----------|--------|
| `components/landing/RankJourney.tsx` | 101 (section id, padding) | ✅ Fixed |
| `components/landing/HowItWorks.tsx` | 109 (section id, padding), 151 (heading size) | ✅ Fixed |
| `components/landing/QuestShowcase.tsx` | 81 (section id, padding), 94 (heading size) | ✅ Fixed |
| `components/ui/animated-shader-hero.tsx` | 361 (h-screen) | ✅ Fixed |

### Dashboard pages
| File | Key lines | Status |
|------|-----------|--------|
| `app/dashboard/settings/page.tsx` | 50 (flex row), 63 (grid-cols-3) | ✅ Fixed |
| `app/dashboard/company/profile/page.tsx` | 140 (grid-cols-3) | ✅ Fixed |
| `app/dashboard/quests/page.tsx` | 250 (min-w), 254 (w-32) | ✅ Fixed |
| `app/dashboard/leaderboard/page.tsx` | 167 (min-w) | ✅ Fixed |

### Quests pages
| File | Key lines | Status |
|------|-----------|--------|
| `app/quests/page.tsx` | 673 (grid-cols-3 skeleton) | ✅ Fixed |
| `app/quests/[id]/page.tsx` | 158 (sticky sub-nav) | ⏳ Remaining |

### Admin pages
| File | Key lines | Status |
|------|-----------|--------|
| `app/admin/quests/page.tsx` | 283 (broken grid), 439 (w-[140px]) | ✅ Fixed |
| `app/admin/analytics/page.tsx` | 277 (grid-cols), 332 (grid-cols) | ✅ Fixed |

### Components
| File | Key lines | Status |
|------|-----------|--------|
| `components/QualityAssuranceDashboard.tsx` | 311 (grid-cols-5) | ✅ Fixed |
| `components/ui/onboarding-prompt.tsx` | 256 (grid-cols-3) | ✅ Fixed |
| `components/QuestMatcher.tsx` | 237 (grid-cols-3) | ✅ Fixed |

---

## FIX PATTERNS USED

### Grid responsive pattern
```
grid-cols-3          →  sm:grid-cols-2 md:grid-cols-3
grid-cols-5          →  grid-cols-3 sm:grid-cols-5
grid-cols-2 sm:grid-cols-5  →  grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5
```

### Fixed-width responsive pattern
```
min-w-[180px]        →  min-w-[140px] sm:min-w-[180px]
w-32                 →  w-24 sm:w-32
w-[140px]            →  w-[120px] sm:w-[140px]
min-w-[72px]         →  min-w-[60px] sm:min-w-[72px]
```

### Section padding pattern
```
py-24                →  pt-20 lg:pt-0 py-24
```

### Hero height pattern
```
h-screen             →  min-h-[500px] md:h-screen
```

### Text size responsive pattern
```
text-[36px]          →  text-2xl sm:text-[36px] md:text-[44px]
text-[22px]          →  text-xl sm:text-[22px]
```

---

## NEXT SESSION CHECKLIST

When continuing this work:

1. `git checkout fix/responsive-mobile-layout`
2. Review remaining tasks A-E above
3. Apply remaining fixes
4. Run `npm run build && npm run lint`
5. Create PR to `main` with description of all changes

## KEY CONTEXT

- **Framework:** Next.js 15 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS 3 with breakpoints: xs:475px, sm:640px, md:768px, lg:1024px, xl:1280px, 2xl:1536px
- **Design system:** Orange-500 primary accent, 5-level grayscale, rank colors in RankBadge only
- **Auth:** NextAuth v4, roles: adventurer/company/admin
- **DB:** Neon PostgreSQL via Prisma 6
- **Main branch is latest work** — all fixes are on top of main
