# Responsive Mobile Layout Fix - Progress Tracker

**Branch:** `fix/responsive-mobile-layout` (from `main`)
**Started:** 2026-06-11
**Status:** In Progress — 4/13 tasks complete

---

## Problem Summary

The entire Adventurers-Guild platform looks fine on desktop/laptop but is broken on mobile:
- Fixed nav covers section headings
- Duplicate IDs in DOM causing flaky hash navigation
- Root layout wrapper missing `flex` class
- Fixed elements overlapping content
- `grid-cols-3/5` layouts that never collapse on mobile
- Fixed-width inputs causing horizontal overflow
- Hero `h-screen` causing GPU stalls on phones
- Design system drift (two footers, two globals.css files)

---

## Files That Need Changes (Full List)

### CORE ISSUES (Shared chrome)
1. `app/layout.tsx:68` — missing `flex` class on wrapper
2. `app/page.tsx:69-84` — duplicate section IDs (wrappers around components that already have ids)
3. `components/Navigation.tsx` — fixed nav, no anchor offset
4. `components/ui/go-to-top.tsx:49` — fixed button overlapping content on mobile
5. `components/ConditionalFooter.tsx` — renders `footer-taped-design`
6. `components/site-footer.tsx` — separate full footer (design drift)
7. `styles/globals.css` — unused backup globals (design drift)

### LANDING PAGES (Section overlap + animations)
8. `components/landing/RankJourney.tsx:101` — section id="ranks" (already correct, wrapper in page.tsx was duplicate)
9. `components/landing/HowItWorks.tsx:109` — section id="how-it-works", sticky sidebar, no top padding
10. `components/landing/QuestShowcase.tsx:81` — section id="quests", two-panel grid on mobile
11. `components/ui/animated-shader-hero.tsx:361` — h-screen, WebGL on low-end devices

### DASHBOARD PAGES (grid-cols-N without responsive breakpoints)
12. `app/dashboard/settings/page.tsx:63` — `grid-cols-3` stats
13. `app/dashboard/settings/page.tsx:50` — flex row with copy button + long link
14. `app/dashboard/company/profile/page.tsx:140` — `grid-cols-3` quick stats
15. `app/dashboard/quests/page.tsx:250` — `min-w-[180px]` search input
16. `app/dashboard/quests/page.tsx:254` — `w-32` select trigger
17. `app/dashboard/leaderboard/page.tsx:167` — `min-w-[72px]` XP display

### QUESTS PAGES
18. `app/quests/page.tsx:673` — `grid-cols-3` skeleton loading
19. `app/quests/[id]/page.tsx:560` — `max-w-[140px]` company name

### ADMIN PAGES
20. `app/admin/quests/page.tsx:283` — broken `grid-cols-2 sm:grid-cols-5`
21. `app/admin/quests/page.tsx:439` — `w-[140px]` fixed select
22. `app/admin/analytics/page.tsx:277` — `grid-cols-2 md:grid-cols-4` skeleton
23. `app/admin/analytics/page.tsx:332` — `grid-cols-2 lg:grid-cols-4` skips md

### COMPONENTS
24. `components/QualityAssuranceDashboard.tsx:311` — `grid-cols-5` tabs
25. `components/ui/onboarding-prompt.tsx:256` — `grid-cols-3` career selector
26. `components/QuestMatcher.tsx:237` — `grid-cols-3` reward info

### REMAINING LANDING ISSUES
27. `components/landing/QuestShowcase.tsx:94` — `text-[36px]` fixed on mobile
28. `components/landing/HowItWorks.tsx:151` — `text-[22px]` fixed on mobile
29. `components/landing/HowItWorks.tsx:138` — `lg:grid-cols-12` sidebar layout

---

## Fix Patterns to Apply

### Grid responsive pattern
```
Before: grid-cols-3          →  After: sm:grid-cols-2 md:grid-cols-3
Before: grid-cols-5          →  After: grid-cols-3 sm:grid-cols-5
Before: grid-cols-2 sm:grid-cols-5  →  After: grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5
Before: grid-cols-2          →  After: grid-cols-2 (already fine for 2 items on mobile)
```

### Fixed width responsive pattern
```
Before: min-w-[180px]        →  After: min-w-[140px] sm:min-w-[180px]
Before: w-32                 →  After: w-24 sm:w-32
Before: max-w-[140px]        →  After: max-w-[120px] sm:max-w-[140px]
Before: min-w-[72px]         →  After: min-w-[60px] sm:min-w-[72px]
Before: w-[140px]            →  After: w-[120px] sm:w-[140px]
```

### Section padding pattern
```
Before: py-24                →  After: pt-20 lg:pt-0 py-24
```

---

## Commits Made So Far

### Commit 1: Core layout + navigation fixes
- `app/layout.tsx` — added `flex` to wrapper div
- `app/page.tsx` — removed duplicate section ID wrappers
- `components/ui/go-to-top.tsx` — responsive sizing for mobile
- `components/landing/RankJourney.tsx` — added pt-20 lg:pt-0
- `components/landing/HowItWorks.tsx` — added pt-20 lg:pt-0, added padding to inner container
- `components/landing/QuestShowcase.tsx` — added pt-20 lg:pt-0

### Remaining commits needed:
- Hero + WebGL improvements
- All grid-cols-N responsive fixes (7 files)
- All fixed-width responsive fixes (5 files)
- Dashboard pages responsive
- Admin pages responsive
- Remaining landing page responsive
- Cleanup unused files (styles/globals.css, site-footer.tsx if duplicate)

---

## Notes for Continuation

- Main branch is the latest work
- Working on branch: `fix/responsive-mobile-layout`
- After all fixes: run `npm run build && npm run lint`
- Then create PR to main with detailed description
