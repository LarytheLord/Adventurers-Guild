# Adventurers Guild: Infra + Product Execution Plan (2026-03-04)

## 1) Verified Baseline (Completed Before Planning)

### Build and static checks
- `npm run lint`: pass (warnings only, no blocking errors)
- `npm run type-check`: pass
- `npm run build`: pass

### Runtime smoke checks
- HTTP auth smoke (local):
  - `POST /api/auth/register`: `201`
  - NextAuth credentials callback: success
  - `GET /api/auth/session`: returns created user session
- Auth provider smoke (direct):
  - valid credentials: success
  - invalid credentials: rejected
  - `lastLoginAt` update: confirmed
- Quest lifecycle smoke (DB + lifecycle sync):
  - `available -> in_progress -> review -> completed`: confirmed
- Quest detail API smoke (local):
  - `GET /api/quests/:id` returns both `quest` and fallback `quests[0]` shape for compatibility

### Agent-style audits run
- API surface scan and frontend fetch mapping
- Auth/role guard consistency scan
- Navigation/layout duplication scan
- UI color/style inconsistency scan
- Documentation drift scan
- Legacy/unused component scan

## 2) Current Gaps To Fix

### G1. Documentation is stale and misleading
- Multiple docs still reference Supabase and old blocker counts.
- Current stack is Neon + Prisma + NextAuth; docs must match production reality.

### G2. Access-control patterns are inconsistent
- Some routes use `requireAuth/getAuthUser`; others use `getServerSession`.
- Needs one shared policy layer and one role-guard strategy.

### G3. UX/design consistency is incomplete
- Hero and some auth pages are strong, but many dashboard surfaces still use mixed visual language.
- Rank/status colors are inconsistent and in places still default-looking.

### G4. Flow reliability is partially implicit
- Lifecycle logic works, but there is no explicit workflow orchestration layer.
- Missing event log/audit trail for each quest state transition.

### G5. Testing depth is not yet production-grade
- CI currently validates lint/type/build only.
- No stable automated E2E flow suite for register/login/quest/payment/ranking lifecycle.

### G6. Legacy and unintegrated components remain
- Several components appear unused or legacy (`components/page.tsx`, multiple dashboard modules).
- This increases maintenance cost and confusion.

## 3) Target Product Model: "Real Guild" Platform

### Core domain modules
1. Identity and Membership
2. Quest Marketplace and Contracting
3. Delivery and Review Pipeline
4. Reputation, Rank, and Seasonal Progression
5. Treasury and Payments
6. Guild Social Systems (teams, mentorship, councils, achievements)
7. Governance and Moderation

### Canonical quest lifecycle
1. `draft`
2. `available`
3. `in_progress`
4. `review`
5. `completed`
6. `cancelled`

### Canonical assignment lifecycle
1. `assigned`
2. `started`
3. `in_progress`
4. `submitted`
5. `review`
6. `completed`
7. `cancelled`

### Gamification layers (next evolution)
1. Quest chains (multi-step arcs, prerequisite completion)
2. Seasons and leagues (time-boxed ranked ladders)
3. Guild reputation events (XP source traceability)
4. Badges and mastery tracks (skill-specific progression)
5. Quality multipliers (review score affects XP/reward multipliers)
6. Company trust score (review fairness, payment reliability, retention)

## 4) Infra Architecture Plan

### Application architecture
1. Keep Next.js App Router as BFF.
2. Move domain logic into explicit service modules under `lib/domain/*`.
3. Standardize API contracts with zod schemas per route.
4. Add event outbox pattern for all state transitions (quest, assignment, submission, payment).

### Data and Neon strategy
1. Keep Prisma as source of truth for schema and migrations.
2. Environment branches:
   - `prod` Neon branch
   - `staging` Neon branch
   - per-PR ephemeral branches for risky schema work
3. Migration process:
   - `prisma migrate dev` locally
   - `prisma migrate deploy` in CI/CD
4. Operational policy:
   - daily automated backup check
   - point-in-time restore drill monthly

### Async and reliability
1. Introduce queue for async jobs (notifications, ranking recompute, settlement, digest emails).
2. Add idempotency keys on all payment and status transition writes.
3. Add retry policy with dead-letter handling for critical jobs.

### Observability
1. Structured logs (requestId, userId, questId, action type).
2. Error tracking integration for API and client.
3. Metrics dashboard:
   - auth success/failure
   - assignment conversion
   - submission review time
   - payment success rate

## 5) Role Flow Blueprint

### Adventurer flow
1. Register -> onboarding profile -> skill tags
2. Discover quests -> apply/accept -> start work
3. Submit delivery -> review feedback loop
4. Completion -> XP/skill points/reward -> rank update
5. Leaderboard/achievements -> next quest recommendations

### Company flow
1. Register company -> verification tier
2. Create quest from templates + acceptance criteria
3. Review applicants/assignments
4. Review submissions with rubric
5. Approve + payout + quality feedback
6. Company trust score and hiring analytics

### Admin/Guild Council flow
1. Monitor disputes, fraud, abuse
2. Moderate rankings and suspicious events
3. Audit payment and review fairness
4. Manage season resets, reward policies, and badge definitions

## 6) Frontend System Plan (Design + Consistency)

### UX principles
1. One global marketing navbar, one dashboard shell.
2. Shared design tokens (colors, spacing, border, motion, typography).
3. Rank/status visuals must be semantic and consistent.
4. Component behavior and loading states must be uniform.

### Component strategy
1. Keep `shadcn/ui` base primitives.
2. Build a "Guild design kit" wrapper layer for:
   - primary/secondary/ghost buttons
   - status badges
   - rank chips
   - metric cards
   - activity timeline
3. Remove or archive unused legacy components.

### Immediate visual backlog
1. Replace remaining default blue/purple legacy classes with guild token variants.
2. Normalize all dashboard cards, headers, and table patterns.
3. Improve CTA hierarchy and microcopy across role dashboards.
4. Add motion patterns (stagger, state transition, toast consistency) with strict performance budget.

## 7) Test Strategy (Required Before Major Feature Expansion)

### Add automated E2E (Playwright)
1. Register adventurer
2. Login and redirect to dashboard
3. Company posts quest
4. Adventurer views quest detail and applies
5. Submission -> review -> completion
6. Payment and ranking update visibility

### Add integration tests
1. Auth API
2. Quest assignment transitions
3. Submission review and completion logic
4. Ranking recompute logic

### Quality gates
1. CI required checks: lint + type-check + build + integration + E2E smoke
2. Block merge on failing core flow tests

## 8) Delivery Phases

### Phase 0 (Week 1): Stabilize and clean foundation
1. Unify API auth guards
2. Update stale docs to Neon/Prisma truth
3. Remove/relocate unused legacy components
4. Ship first E2E smoke pack

### Phase 1 (Weeks 2-3): Hard flow reliability
1. Quest event outbox + audit trail
2. Idempotent transitions and payment safeguards
3. Ranking recalculation consistency
4. Error monitoring and trace IDs

### Phase 2 (Weeks 4-6): Dashboard differentiation and UX polish
1. Fully distinct adventurer/company command centers
2. Guild design system rollout to all active pages
3. Improved quest board/search/apply/review interaction quality

### Phase 3 (Weeks 7-9): Real gamification systems
1. Seasonal ladders
2. Achievement and badge service
3. Quest chains/arcs
4. Progression telemetry

### Phase 4 (Weeks 10-12): Scale and governance
1. Dispute workflow
2. Company trust scoring
3. Recommendation engine v1
4. Operational runbooks and SLOs

## 9) Immediate Sprint Backlog (Start Now)

1. Create `docs/architecture/current-state.md` and `docs/architecture/target-state.md`
2. Create `docs/testing/e2e-core-flows.md` and implement Playwright specs
3. Standardize all API routes on shared guard helpers
4. Build `components/guild/*` tokenized primitives and migrate active dashboard screens
5. Fix docs drift in `README.md`, `DEVELOPMENT.md`, and `docs/contributor-onboarding.md`
6. Add ranking event hooks on quest completion and payment settlement

## 10) Success Criteria

1. Auth/register/login flow success rate >= 99%
2. Quest pipeline end-to-end (post -> complete -> pay) success rate >= 95%
3. Zero P0 auth/flow regressions for two consecutive releases
4. Full CI with E2E core suite green on every merge to `main`
5. Dashboard UX consistency score improved (internal audit checklist) across all active pages
