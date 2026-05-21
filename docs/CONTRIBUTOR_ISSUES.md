# Open Issues for Contributors

## 🔴 P1: Fix TypeScript Errors in New Features

**Files affected**: `app/api/admin/analytics/route.ts`, `app/api/public/quests/[id]/route.ts`, `app/quests/[id]/page.tsx`, `app/admin/analytics/page.tsx`

**What**: Several TypeScript errors remain in the new public pages and analytics:
- `avgCompletionTime` variable in analytics route is now unused (line 37-ish)
- Quest detail page needs edge case handling (404 for non-existent quests)
- Analytics page needs proper error boundaries
- Quest detail page needs responsive refinements on mobile
- Clean up unused imports across all new files

**Acceptance**: `npx tsc --noEmit` passes with zero errors. All new pages render without console errors.

**Effort**: ~2 hours

---

## 🔴 P2: Connect Streak System to Quest Completion Flow

**Files**: `lib/streak-utils.ts` (✅ already built), `lib/xp-utils.ts` (needs update)

**What**: The streak system is built (`updateStreakOnCompletion`, `getStreakLabel`, etc.) but needs integration into the actual quest completion flow:
- After a quest is approved/completed, call `updateStreakOnCompletion(userId)`
- Display streak info on the adventurer dashboard
- Show streak XP bonus in the completion confirmation
- Add streak badge to the dashboard profile card

**Spec**:
```typescript
// In xp-utils.ts updateUserXp function — already partially wired
// Need to:
// 1. Ensure updateStreakOnCompletion is called after every quest approval
// 2. Add streak info to the quest completion response
// 3. Build dashboard streak widget component
```

**Effort**: ~3 hours

---

## 🟡 P3: Admin Analytics UI — Connect to Real API

**Files**: `app/admin/analytics/page.tsx`, `app/api/admin/analytics/route.ts`

**What**: The admin analytics page renders but uses placeholder data. Need to:
- Connect the `dateRange` selector (7d/30d/90d) to actually filter data
- Add proper loading states for each section (not just full-page loader)
- Add date-based filtering to the API endpoint
- Build a real line chart component (Recharts) for user growth over time
- Add export-to-CSV button for analytics data

**Effort**: ~4 hours

---

## 🟡 P4: Reddit Lead Machine — Setup & Deploy

**Files**: `scripts/reddit_lead_machine.py`, `scripts/.env.example`

**What**: Python script to monitor Reddit for potential users. Needs:
- Create Reddit API credentials (reddit.com/prefs/apps)
- Set up a cron job / GitHub Actions scheduled workflow
- Configure SMTP for daily digest emails (`send_digest_email` needs refactoring to work with any SMTP provider)
- Add tests for intent classification
- Add support for monitoring additional Indian dev communities

**Effort**: ~2 hours (setup) + ongoing maintenance

---

## 🟡 P5: Product Hunt Launch Prep

**Files**: `docs/PRODUCT_HUNT_LAUNCH_STRATEGY.md`, `docs/PRODUCT_HUNT_ASSET_KIT.md`

**What**: Full Product Hunt launch requires:
- **Screenshots** (7 total — quest board, detail page, dashboard, guild card, analytics, mobile views)
- **45-second demo video** showing the quest flow
- **Gather testimonials** from existing 14+ users
- **Write killer description** (already drafted — needs polish)
- **Pre-launch outreach** to 50+ people
- **Prep comment strategy** (5 staggered comments)

**Checklist**: See `docs/PRODUCT_HUNT_QUICK_REFERENCE.md` for full checklist.

**Effort**: ~6 hours total

---

## 🟡 P6: OG Image Generation for Quest Pages

**Files**: Create `app/api/og/quests/[id]/route.ts`

**What**: When someone shares a quest on X/LinkedIn, we need dynamic OG images showing:
- Quest title and difficulty rank badge
- XP reward and monetary reward
- Company name
- Platform branding (AG logo + color scheme)

Use `@vercel/og` which is already in dependencies.

**Effort**: ~2 hours

---

## 🟢 P7: Quest Detail Edge Cases

**What**: The public quest detail page needs polish:
- Better 404 page when quest not found
- Handle expired quests gracefully (show "This quest is no longer available")
- Add breadcrumb navigation
- Show "Posted by Company" with company page link (future)
- Add estimated time to complete field

**Effort**: ~2 hours

---

## 🟢 P8: Test Coverage for New Features

**What**: Add unit/integration tests:
- Public quest API endpoint tests
- Streak system unit tests
- Quest detail page render tests (Playwright)
- Analytics API tests

**Effort**: ~3 hours