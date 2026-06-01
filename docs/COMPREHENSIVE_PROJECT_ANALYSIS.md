# Adventurers Guild - Comprehensive Project Analysis

## Purpose

This document is the full strategic, product, technical, validation, and future-scope analysis for Adventurers Guild.

It combines:

- The product narrative from `docs/IIM_A_VENTURES_MENTOR_BRIEF.md`.
- The validation critique from `docs/MOM_TEST_CUSTOMER_DISCOVERY_AUDIT.md`.
- The actual current codebase and schema.
- Existing roadmap, monetization, growth, Product Hunt, and VC docs.

The goal is to separate reality from ambition, keep the fantasy/RPG identity intact, and define a credible path from current product to a trusted developer work-and-reputation platform.

## Executive Summary

Adventurers Guild is a real-work guild for developers. Developers complete real software tasks called Quests, earn XP, climb ranks from F to S, and build a public proof-of-work identity through their Guild Card. Companies, NGOs, bootcamps, and internal projects can use the platform to turn work into scoped quests and route that work through reviewed delivery.

The strongest long-term thesis is:

> Adventurers Guild turns verified real work into progression, reputation, and opportunity.

The strongest near-term wedge is narrower:

> Concierge delivery of small, non-critical software tasks for SMBs/startups using vetted students or junior developers, with AG-owned scoping, QA, and replacement.

The codebase already has much more than a concept:

- Auth and role-based routing.
- Adventurer, company, and admin roles.
- Quest creation, browsing, filtering, assignment, submission, review, completion.
- XP, levels, ranks, streaks, achievements, leaderboards, and Guild Card direction.
- Bootcamp and intern track primitives.
- Party/squad models and APIs.
- Admin QA queue.
- Public quest board and public adventurer profiles.
- Payment records plus Razorpay/Stripe-related infrastructure.
- Revenue/admin analytics surfaces.
- Tests and CI for core flows.

But the Mom Test audit makes the main strategic issue clear: the product thesis is plausible, not fully validated. The audio conversation strengthened the operational model, especially milestone/phased delivery and verification concerns, but it did not prove customer demand or willingness to pay.

The biggest risk is not the fantasy theme. The biggest risk is trust:

- Will companies trust student/junior delivery?
- Will adventurers finish real work on deadlines?
- Can rank be made trustworthy and hard to game?
- Can AG handle QA, scope, payment, rework, and replacement without huge founder effort?

The correct next step is not more broad feature building. It is an end-to-end proof point:

> One real client task, scoped into a quest, assigned to a vetted adventurer or party, QA'd by AG, accepted by the client, followed by a repeat-task ask.

## The Core Identity

### What Adventurers Guild Is

Adventurers Guild is a platform where real software work becomes quests. Developers are Adventurers. Their progress is shown through XP, rank, completed work, streaks, skills, achievements, and public profiles. Companies and organizations get software tasks completed with a visible review and reputation layer.

Plain-language version:

> Adventurers Guild helps developers build verified proof of work by completing real software quests, while companies get access to ranked, reviewed talent.

Founder/mentor version:

> Adventurers Guild is a developer talent and proof-of-work platform that uses the structure of RPG guilds to make early-career software work more legible, motivating, and trustworthy.

Community version:

> It is the Adventurers Guild from fantasy games, anime, manga, and RPGs, but for real builders shipping code.

### What It Is Not

Do not reduce the product to:

- A gamified education app.
- A freelancer marketplace clone.
- LinkedIn with XP.
- Upwork for students.
- A bootcamp dashboard.
- A points/badges wrapper on generic tasks.

Those comparisons can help people understand pieces of the product, but none of them capture the full loop.

### The Best Positioning

The most accurate positioning is:

> Real software work, structured as quests, reviewed for quality, converted into rank and public proof of skill.

The product's emotional engine is RPG progression. The business engine is trust. The strategic asset is verified work history.

## Cultural And Product Narrative

The mentor brief correctly identifies that the fantasy language is not decoration. It gives users a mental model for growth:

- Beginners start at low rank.
- They accept small quests.
- They work solo or in parties.
- They get reviewed.
- They earn rewards and reputation.
- Harder quests unlock as trust grows.
- Their public Guild Card becomes their proof of competence.

Relevant cultural inspirations:

- Dungeons and Dragons: parties, character sheets, XP, levels, quests, campaigns.
- MMORPGs: persistent identity, guilds, progression, social leveling.
- World of Warcraft: quest chains, guilds, roles, long-term account identity.
- Monster Hunter: contract-based mission loop with preparation, execution, reward, and status.
- Solo Leveling: F/E/D/C/B/A/S rank culture and visible progression.
- Hunter x Hunter: professional licenses, trials, elite identity, earned status.
- DanMachi: adventurer stats, familias, beginner-to-legend journey.
- Goblin Slayer: practical guild contracts, ranking, rewards, operational dispatch.
- Fairy Tail: guild as community, work board, belonging, team missions.

The non-gamer explanation should be:

> Adventurers Guild uses quest and rank language to make skill growth visible and trusted.

## Current Product Reality

### Current Tech Stack

The repo currently uses:

- Next.js 15 App Router.
- TypeScript.
- React 18.
- Neon serverless PostgreSQL.
- Prisma 6 ORM.
- NextAuth.js v4 credentials provider with JWT sessions.
- shadcn/ui, Tailwind, Radix UI, Lucide React.
- Vercel deployment.
- Razorpay and Stripe packages present.
- Jest and Playwright tests.
- Sentry package present.

Key commands:

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run type-check`
- `npm run test`
- `npm run test:e2e`
- `npm run db:push`
- `npm run db:seed`

### Current Domain Model

The Prisma schema includes mature domain coverage:

- `User` with role, username, rank, XP, level, profile fields, mentor fields.
- `AdventurerProfile` with skills, availability, completion rate, streaks, payout account fields.
- `CompanyProfile` with company details, verification, spend, subscription fields.
- `Quest` with status, difficulty, XP, monetary reward, track, source, parent/sub-quest relation, revisions, share count.
- `QuestAssignment` with assignment lifecycle.
- `QuestSubmission` with submission and review metadata.
- `QuestCompletion` with XP, skill points, and quality score.
- `BootcampLink` with tutorial gating and cohort metadata.
- `Party` and `PartyMember` for squads.
- `Transaction` with platform fee, provider IDs, status, and timestamps.
- `Notification`, `VerificationRequest`, `Mentorship`, `ActivityLog`, `Achievement`, `ApiKeyBudget`.

This is not a toy schema. It is already oriented around a full talent/progression marketplace.

### User Roles Implemented

#### Adventurer

Implemented or represented:

- Registration and login.
- Dashboard.
- Quest browsing.
- Quest detail views.
- Quest assignment/application flows.
- Submission flow.
- My quests and completed quests pages.
- Earnings and payment history pages.
- Profile page.
- Skill tree page.
- Leaderboard.
- Teams/party surface.
- Public adventurer profile at `/adventurer/[username]`.
- XP, rank, streak, activity, and achievement models.
- Razorpay payout contact/fund-account infrastructure.

#### Company

Implemented or represented:

- Company registration.
- Company dashboard.
- Company quest creation.
- Company quest management.
- Quest detail/edit pages.
- Company analytics.
- Company payments/spending pages.
- Company profile.
- Company-owned quest visibility.
- Submission review flow after QA gate.
- Subscription-related fields in schema.

#### Admin

Implemented or represented:

- Admin dashboard.
- Admin quest management.
- Admin user management APIs.
- Admin QA queue.
- Admin revenue dashboard and revenue API.
- Admin analytics dashboard/API.
- API budget tracking page/API.
- Activity/admin routes.
- Ability to see broader data and manage workflow states.

### Quest Lifecycle Reality

The current system supports:

- Quest statuses: `draft`, `available`, `in_progress`, `review`, `completed`, `cancelled`.
- Assignment statuses: `assigned`, `started`, `in_progress`, `submitted`, `pending_admin_review`, `review`, `completed`, `cancelled`, `needs_rework`.
- Submission statuses: `pending`, `under_review`, `approved`, `needs_rework`, `rejected`.
- Lifecycle sync logic in `lib/quest-lifecycle.ts`.
- Multi-participant quest status behavior through `maxParticipants` and assignment status counting.
- Admin QA gate for non-OPEN tracks.
- Completion recording through `QuestCompletion`.
- XP/rank updates on approval.

Important nuance:

- OPEN quests can go directly to submitted/review.
- INTERN and BOOTCAMP tracks go through `pending_admin_review` before company review.
- Bootcamp users are track-locked at API level.
- Ineligible bootcamp users should only see tutorial quests.

### Current Public Product Surfaces

The app includes:

- Landing/home page.
- Public quest board at `/quests`.
- Public quest detail at `/quests/[id]`.
- Public Guild Card/adventurer profile at `/adventurer/[username]`.
- FAQ and legal/privacy/terms surfaces.
- Dashboard surfaces for adventurer/company/admin.

### Current Tests And Quality Gates

The repo includes:

- Unit tests for payment utilities.
- Unit tests for XP utilities.
- API tests for quests.
- E2E tests for auth flows.
- E2E tests for quest flow.
- E2E tests for API ownership.
- E2E tests for bootcamp pipeline.
- CI workflow previously verified as green after fixes.

This is a meaningful base, but it still needs production-grade test coverage around payments, admin QA, lifecycle edge cases, track enforcement, party behavior, and public/private data boundaries.

## Current Partial Or Simulated Areas

### Payments

Payments are the most confused area across code and docs.

Current reality:

- `Transaction` model supports provider fields, platform fees, provider IDs, and completed timestamps.
- `app/api/payments/route.ts` still includes simulated payment behavior.
- Razorpay utilities exist for orders, contacts, fund accounts, webhooks, and payouts.
- `lib/razorpay-payout.ts` can create Razorpay payouts if configured, otherwise creates simulated completed transactions.
- Stripe package and webhook route exist, but the monetization roadmap still describes Stripe Connect as future work.
- README says payments are an internal pipeline with Stripe Connect planned.
- Architecture docs say Stripe Connect for interns and XP-only for bootcamp.
- Some recent code and PRs refer to Razorpay payout flows.

Conclusion:

> Payment infrastructure exists, but production money movement is not yet a clean, single source of truth.

The platform should not claim full production payment processing until one provider and one lifecycle are chosen, tested, and documented.

### Subscriptions And Boosts

Current reality:

- Company profile has `subscriptionPlan` and `stripeSubId` fields.
- Revenue API returns `mrr: 0`.
- Monetization roadmap describes subscriptions and boosts as future work.
- Quest model does not currently include `isFeatured`, `featuredUntil`, `isUrgent`, or `urgentUntil`.

Conclusion:

> Subscription and quest-boost monetization are future scope, not shipped product.

### Talent Search And Direct Hire

Current reality:

- Public Guild Card/profile exists directionally.
- Rank, completions, skills, and profile fields exist.
- No complete company-facing talent search/directory appears to be part of current shipped core.
- No `HireOffer` model exists.

Conclusion:

> Talent search and direct hire are a natural future layer, but not current scope.

### AI Copilot

Current reality:

- Product Hunt and VC docs heavily discuss AI Copilot hints/chat/adaptive learning.
- The currently inspected schema/code does not show a complete AI Copilot product as a shipped core capability.
- `ApiKeyBudget` exists, which supports future AI cost tracking.

Conclusion:

> AI Copilot should be treated as future or experimental unless a complete, tested implementation exists elsewhere.

### Traction Claims

Some Product Hunt and VC docs include claims such as:

- 100+ adventurers.
- 50+ companies.
- 500+ hours completed.
- $20K+ paid out.
- 4.2/5 rating.

Growth docs also say:

- External companies: 0.
- Active users: unknown.
- Quest completions: unknown.
- Guild Card views: 0.

Conclusion:

> Do not use the bigger traction claims unless they are backed by real production data. Treat them as placeholders or target copy.

## Validation Analysis

### What The Mom Test Audit Proves

The audio conversation does not prove demand. It proves the following:

- The core story can be understood.
- The student proof-of-work pain is plausible.
- The SMB/freelancer quality-control pain is plausible.
- The listener's primary objections are around verification, commitment, task abandonment, team conflicts, legal/operational complexity, and scalability.
- Milestone/phased delivery is a promising way to reduce trust risk.

The most important line from the audit is:

> The call strengthened the operating model but did not validate demand.

### What Is Still Unvalidated

The critical unvalidated assumptions are:

1. SMBs have small software tasks they want done now.
2. SMBs will trust a student-powered platform if AG owns QA and replacement.
3. SMBs will deposit money, pay per quest, or pay a platform fee.
4. Students will finish real client work under deadlines.
5. Rank can reliably predict delivery quality.
6. AG can keep QA and scoping workload manageable.
7. Companies will care about Guild Cards and rank in hiring.
8. Bootcamps will pay or revenue-share for AG as capstone infrastructure.
9. AI guidance will improve completion, retention, or learning outcomes.
10. Marketplace liquidity can be achieved without excessive manual founder work.

### Validation Priority

The highest-priority validation is not Product Hunt, AI, subscriptions, or more dashboards.

The highest-priority validation is:

> Can AG deliver one real quest for one real client with acceptable quality and repeat intent?

If yes, the platform has a believable foundation. If no, more features will not fix the core trust problem.

## Market And User Segments

### Supply Side: Adventurers

Primary early users:

- Non-tier-1 college students.
- Self-taught developers.
- Bootcamp students.
- Open-source contributors.
- Hackathon builders.
- Junior developers needing proof of work.

Core pains:

- Hard to get trusted without experience.
- Freelancing platforms are saturated.
- Internships are scarce and opaque.
- Resumes do not prove ability.
- Tutorials do not prove production readiness.
- They need feedback, structure, and real-world constraints.

What AG gives them:

- Real tasks.
- Review history.
- XP and rank.
- Public Guild Card.
- Potential payment.
- Team/party experience.
- A story of progression.

### Demand Side: Companies And SMBs

Primary early buyers:

- Founder-led startups.
- Small SaaS teams.
- NGOs and community organizations.
- Agencies with overflow work.
- Internal projects with non-critical backlog.
- Open Paws or known partner networks.

Core pains:

- Small tasks do not justify hiring full-time.
- Agencies can be expensive or slow.
- Freelancers can disappear or underdeliver.
- Non-technical clients struggle to scope what they need.
- Junior hiring requires too much screening.

What AG promises:

- Scoped tasks.
- Reviewed delivery.
- Ranked talent.
- Replacement if someone stalls.
- Lower-cost execution.
- A talent pipeline for future hiring.

Unvalidated buyer question:

> Will they trust AG enough to give a real task and budget?

### Institutional Segment: Bootcamps And Universities

Potential users/buyers:

- Open Paws Bootcamp.
- University coding clubs.
- CS departments.
- Cohort-based learning programs.
- Hackathon organizers.

Core pains:

- Students need applied work.
- Capstone projects are often fake or under-scoped.
- Placement outcomes need stronger proof.
- Review bandwidth is limited.

What AG can become:

- Capstone infrastructure.
- Quest board for real-world projects.
- Skill and progression tracking.
- Portfolio/proof-of-work system.
- Talent pipeline into internships.

Risk:

- Institutions may like the story but not pay until outcomes are proven.

## Competitive Landscape

### Upwork/Fiverr

Strengths:

- Existing liquidity.
- Massive demand and supply.
- Payment rails and dispute infrastructure.

Weaknesses AG can exploit:

- Commodity bidding.
- Weak learning/progression layer.
- Students struggle to get initial trust.
- Profiles are not structured as long-term skill progression.

### LeetCode/HackerRank

Strengths:

- Clear skill practice.
- Recruiter recognition.

Weaknesses AG can exploit:

- Practice problems are not production delivery.
- No client work, payment, or project lifecycle.
- Weak teamwork and maintenance signals.

### LinkedIn/GitHub

Strengths:

- Existing professional identity.
- GitHub shows code artifacts.

Weaknesses AG can exploit:

- Self-reported skills and unstructured proof.
- Hard to tell whether work was reviewed, delivered, or useful.
- No rank derived from real delivery outcomes.

### Bootcamps

Strengths:

- Curriculum and cohort structure.
- Student relationships.

Weaknesses AG can exploit:

- Weak real-work pipeline.
- Placement pain.
- Project work can be synthetic.

### Toptal/Gun.io/Elite Talent Networks

Strengths:

- High trust.
- Strong screening.

Weaknesses AG can exploit:

- Not designed for beginners.
- No progression path from F-rank to S-rank.
- High cost and limited accessibility.

### AG's Real Differentiation

AG's strongest differentiation is not just gamification. It is the combination of:

- Real work.
- Review-mediated delivery.
- Rank as a trust signal.
- Public proof-of-work profiles.
- Student/junior progression.
- Party-based delivery.
- Founder/maintainer scoping and QA.

## Business Model Analysis

### Current Business Model Thesis

The financial docs describe a marketplace model:

- Companies pay a service fee on top of quest rewards.
- Adventurers keep 100 percent of posted rewards.
- Companies can later subscribe for unlimited quests, analytics, priority matching, and support.
- Companies can pay for featured/urgent quest boosts.
- Talent search and direct hire become high-upside future revenue.

### Best Early Monetization Path

The safest early path is:

1. Run concierge quests free or low-cost to prove delivery.
2. Ask for payment after successful delivery or on the second task.
3. Introduce a company-side service fee only after quality is proven.
4. Delay subscriptions until repeat posting exists.
5. Delay boosts until quest-board demand exists.
6. Delay direct-hire fees until Guild Cards have real hiring signal.

### Problem With Current Monetization Docs

The docs mix several payment/payment-provider stories:

- README: internal pipeline, Stripe Connect planned.
- Architecture docs: Stripe Connect for interns, XP-only for bootcamp.
- Code: Razorpay contact, fund account, payout, webhooks, and simulated fallback.
- Monetization roadmap: Stripe Connect, Stripe Billing, Stripe Checkout.
- Financial model: Stripe assumptions and USD pricing.

This needs one canonical decision.

Recommended decision for now:

> Pick one production payment provider for the next 90 days and document the exact flow. Keep all other providers as future/legacy until needed.

If India-first and Razorpay is already configured, Razorpay may be the pragmatic near-term path. If global marketplace and Connect-style split payments matter more, Stripe Connect is the cleaner long-term path. Do not operate both as first-class flows until the model is validated.

### Pricing Recommendations

Early pilots:

- First concierge task: free or pay-on-success.
- Follow-up task: fixed fee or reward plus AG fee.
- Company pays the platform fee, not the adventurer.
- Bootcamp quests: XP/portfolio only until legal/payment complexity is resolved.

After repeat usage:

- 10 percent company-side service fee for early partners.
- Move to 15 percent after trust and completion rate are proven.
- Subscription only for companies posting repeatedly.

Future:

- Guild Partner subscription.
- Enterprise/support plans.
- Talent search.
- Direct hire placement.
- Bootcamp/cohort licensing.
- Optional adventurer pro only if it does not undermine the "developers keep rewards" promise.

## Product Architecture Analysis

### Strengths

- The domain model matches the ambition.
- Auth roles are clearly represented.
- Track architecture exists in schema and service layer.
- Bootcamp gating is implemented directionally.
- Admin QA mediation exists.
- Party system exists in schema/API.
- XP/rank/streak/achievement primitives exist.
- Public proof-of-work direction exists through adventurer profiles.
- Revenue analytics and admin views are emerging.
- Tests exist for unit, API, and E2E layers.

### Weaknesses

- Documentation has drifted from production reality.
- Payment provider strategy is inconsistent.
- Some API routes still use broad `Record<string, unknown>` where typed Prisma inputs would be safer.
- Some route auth uses `getAuthUser()` without passing request, while other routes pass request; this should be standardized.
- Payment code has simulated and real paths mixed together.
- Some future claims are presented too confidently in marketing docs.
- Product scope is very broad relative to validation.
- The design system is still evolving and may have overlapping landing components.
- Event/audit trail is not fully canonical despite being important for trust.

### Technical Risks

1. Payment correctness and idempotency.
2. Double transaction creation across payment paths.
3. Currency confusion between USD and INR.
4. Platform fee being deducted from adventurer payout despite docs saying adventurers keep 100 percent.
5. Track visibility leaks or direct URL access issues.
6. Admin/company/adventurer data exposure boundaries.
7. Quest lifecycle transitions getting out of sync.
8. No universal event log for state transitions.
9. QA/rework loops not fully measurable.
10. Rank gaming or inaccurate rank progression.

## Strategic Product Risks

### Risk 1: Trust Is Harder Than Matching

Marketplaces often fail not because matching is hard, but because trust, quality, dispute handling, and repeated behavior are hard.

AG must make clients believe:

- Work will be completed.
- Quality will be reviewed.
- Bad submissions will not reach them.
- Someone responsible will replace stuck adventurers.
- Payment and scope will be handled fairly.

### Risk 2: Rank Can Become Cosmetic

Rank is only valuable if it predicts delivery quality. If rank is only XP accumulation, companies will not care.

Rank should incorporate:

- Completed quests.
- Difficulty of quests.
- QA score.
- Rework count.
- Deadline reliability.
- Communication quality.
- Maintainer/client review.
- Fraud or abandonment penalties.

### Risk 3: Too Many Audiences

The project currently serves or plans to serve:

- Students.
- Interns.
- Bootcamp learners.
- Companies.
- NGOs.
- Mentors.
- Admins.
- Universities.
- Bootcamps.
- Hiring managers.
- Product Hunt users.
- VCs.

This is okay as a long-term vision, but the early wedge must be narrow.

Recommended early wedge:

> Founder-led startups/SMBs with small backlog tasks, matched to vetted student/junior developers under AG QA.

### Risk 4: AI Scope Can Distract From Delivery

AI Copilot can be powerful, but it should not become the main story before the real-work loop is proven.

Use AI only if it directly improves:

- Quest completion rate.
- Time to first submission.
- Rework reduction.
- Student learning.
- QA efficiency.

### Risk 5: Marketing Claims Can Damage Credibility

Unverified claims such as 100+ developers, 50+ companies, or $20K paid out should not be used unless backed by real production metrics.

Better phrasing:

- "The platform is live and core flows are implemented."
- "We are validating with first real client quests."
- "The current riskiest assumption is company trust."
- "We are running concierge pilots before scaling."

Mentors and investors prefer honest traction over inflated numbers.

## Future Scope

### Near-Term Scope: 0 To 8 Weeks

Goal:

> Prove one end-to-end real quest loop.

Build/do only what supports this:

1. Concierge quest pilot.
2. Student/adventurer calibration.
3. Manual scoping template.
4. Admin QA rubric.
5. Milestone/phase tracking.
6. Basic transaction/payment recording.
7. Client feedback capture.
8. Public case study/Guild Card proof.

Do not prioritize:

- Full subscriptions.
- Quest boosts.
- Mobile apps.
- Full AI chat mentor.
- Enterprise plans.
- Direct hire marketplace.
- Product Hunt launch with placeholder traction.

### Mid-Term Scope: 2 To 6 Months

Goal:

> Convert concierge delivery into repeatable marketplace operations.

Priority capabilities:

1. Real payment flow with one provider.
2. Escrow or milestone payment handling.
3. Quest templates and acceptance criteria builder.
4. Event/audit trail for all transitions.
5. Reliable QA queue and review rubric.
6. Rank calibration and public criteria.
7. Company pilot program with 5 external companies.
8. Adventurer cohort with 20-50 active users.
9. Guild Card as validated proof-of-work page.
10. Case studies and testimonials from real accepted quests.

### Long-Term Scope: 6 To 18 Months

Goal:

> Become developer talent infrastructure built on verified work.

Future capabilities:

1. Company subscriptions.
2. Quest boosts.
3. Talent search.
4. Direct hire/placement fees.
5. Bootcamp/university cohort programs.
6. AI Copilot hints and chat mentor.
7. Adaptive learning paths.
8. Seasonal ladders.
9. Skill-specific mastery tracks.
10. Company trust score.
11. Dispute workflow.
12. Anti-fraud and rank-gaming detection.
13. Advanced analytics.
14. International payments.
15. Enterprise APIs and white-label options.

## Recommended Roadmap

### Phase 1: Reality Alignment

Duration: 1 week.

Deliverables:

- Mark all traction claims as verified, target, or placeholder.
- Decide payment provider story for next 90 days.
- Update README and marketing docs to match shipped reality.
- Define rank criteria beyond raw XP.
- Define the concierge quest operating procedure.

Success metric:

- No mentor/investor-facing doc contains unverified claims.

### Phase 2: Concierge Quest Pilot

Duration: 2-4 weeks.

Deliverables:

- Interview 10 founders/SMBs.
- Get 3 real backlog tasks.
- Scope 1-2 into quests.
- Assign vetted adventurers.
- Run QA and deliver to client.
- Collect client feedback.
- Ask for payment or second task.

Success metrics:

- 1 accepted client delivery.
- 1 repeat-task intent or paid follow-up.
- QA time measured.
- Student reliability measured.

### Phase 3: Rank Calibration

Duration: 2-3 weeks.

Deliverables:

- Create F/E/D benchmark tasks.
- Have 10 students attempt them.
- Score output using rubric.
- Define rank-entry and rank-up criteria.
- Update Guild Card to reflect verified history, not just XP.

Success metrics:

- 5+ completed benchmark submissions.
- Clear ranking rubric.
- At least 2 students ask for another quest.

### Phase 4: Payment And Trust Infrastructure

Duration: 3-6 weeks.

Deliverables:

- One production payment path.
- Idempotent transaction creation.
- Clear platform fee model.
- No double transaction creation.
- Currency consistency.
- Payment state audit trail.
- Bootcamp XP-only guard if needed.

Success metrics:

- One real paid transaction processed safely.
- Failed payment path tested.
- Duplicate payment path tested.

### Phase 5: Marketplace Beta

Duration: 2-3 months.

Deliverables:

- 5 external companies.
- 20-50 active adventurers.
- 10-30 completed quests.
- Repeat company posts.
- Public case studies.
- Honest Product Hunt launch assets.

Success metrics:

- 60 percent or higher quest completion rate.
- 1+ company posts a second task.
- 30-day active adventurer retention measured.
- QA time per quest trending down.

## Metrics That Matter

### Do Not Lead With Vanity Metrics

Avoid optimizing too early for:

- Total registered users.
- GitHub stars.
- Product Hunt upvotes.
- Social impressions.
- Total PRs.
- Total docs written.

These are useful context, not proof of product-market fit.

### Core Marketplace Metrics

- Real tasks sourced.
- Tasks converted into scoped quests.
- Quest assignment rate.
- Time to first applicant.
- Completion rate.
- Time to completion.
- Rework rate.
- Client acceptance rate.
- Repeat company post rate.
- GMV from real payments.
- Platform fee revenue.

### Trust Metrics

- QA pass rate.
- Average QA time per submission.
- Number of rework rounds.
- Deadline hit rate.
- Abandonment rate.
- Replacement rate.
- Quality score distribution.
- Rank-to-quality correlation.

### Adventurer Metrics

- Quest start rate.
- Quest submit rate.
- Tutorial completion rate.
- Rank-up rate.
- 30-day retention.
- Repeat quest participation.
- Guild Card shares/views.

### Company Metrics

- Backlog-task interview conversion.
- Task-post conversion.
- Payment/deposit conversion.
- Repeat task intent.
- Actual repeat task rate.
- Company satisfaction.
- Hiring interest from Guild Card/rank.

## Product Hunt And VC Readiness

### Product Hunt Readiness Criteria

Do not do a major launch until:

- The public quest board is stable on desktop and mobile.
- At least one real quest success story exists.
- Public Guild Cards are compelling and shareable.
- Claims are honest and verified.
- Onboarding does not break for new users.
- The first user action is clear: browse quests, join waitlist, apply, or test.
- Screenshots show actual product, not imagined future states.

If launching before real traction, position honestly:

> Open-source beta for developers who want to build proof of work through real quests.

Do not say:

> 100+ developers, 50+ companies, $20K paid out.

Unless those numbers are true and auditable.

### VC/Mentor Readiness Criteria

For mentors, use this framing:

> We have built the core product infrastructure and validated that the story and objections are clear. The next validation step is a concierge quest: one real client task, manually scoped, delivered by a vetted adventurer or party, QA'd by AG, and measured for repeat intent.

For investors, do not overclaim. Say:

- The product is live.
- Core infrastructure exists.
- The market thesis is strong.
- The riskiest assumption is trust.
- The next milestone is paid/repeat client validation.

Do not lead with seed-funding asks until there is real evidence of demand-side pull.

## Operating Model

### Concierge Quest SOP

1. Interview founder/client about a real backlog task.
2. Confirm task urgency, budget, and success criteria.
3. Scope the task into acceptance criteria.
4. Break into phases if larger than 3-5 days.
5. Assign vetted adventurer or party.
6. Set communication cadence.
7. Require midpoint check-in.
8. QA submission before client sees it.
9. Send to client with clear review checklist.
10. Approve, request rework, or replace contributor.
11. Capture testimonial, payment, or second task.

### Rank Rubric

Rank should incorporate:

- Completed quests.
- Quest difficulty.
- QA quality score.
- Deadline reliability.
- Rework count.
- Communication quality.
- Maintainer notes.
- Client acceptance.
- Abandonment penalties.

Suggested interpretation:

- F-rank: can complete guided tutorial tasks.
- E-rank: can complete small scoped changes with review.
- D-rank: can ship contained production fixes/features.
- C-rank: can own medium tasks with limited supervision.
- B-rank: can lead a small party or module.
- A-rank: can handle complex client work and mentor others.
- S-rank: trusted expert with repeated high-quality delivery and leadership.

### QA Rubric

Every real quest should be scored on:

- Correctness.
- Completeness against acceptance criteria.
- Maintainability.
- Security/basic safety.
- UX or product fit where relevant.
- Test coverage or manual verification.
- Communication.
- Deadline performance.
- Rework handling.

This rubric should feed rank, not live as a disconnected admin note.

## Documentation Cleanup Needed

### Docs To Keep As Strategic Sources

- `docs/IIM_A_VENTURES_MENTOR_BRIEF.md`
- `docs/MOM_TEST_CUSTOMER_DISCOVERY_AUDIT.md`
- `docs/COMPREHENSIVE_PROJECT_ANALYSIS.md`
- `CLAUDE.md`
- `CLAUDE_CODE_INSTRUCTIONS.md`
- `docs/ARCHITECTURE_DECISIONS.md`
- `docs/IMPLEMENTATION_TASKS.md`
- `FINANCIAL_MODEL.md`
- `MONETIZATION_ROADMAP.md`
- `docs/GROWTH_PLAN_2026_Q2.md`

### Docs That Need Traction Claim Review

- `docs/PRODUCT_HUNT_QUICK_REFERENCE.md`
- `docs/PRODUCT_HUNT_LAUNCH_STRATEGY.md`
- `docs/PRODUCT_HUNT_ASSET_KIT.md`
- `docs/VC_PITCH_GUIDE.md`
- `docs/TODAY_EXECUTION_SUMMARY.md`

These documents contain useful templates, but they also include placeholder-style traction claims. They should be marked clearly as target copy unless proven.

### Docs That Need Payment Story Alignment

- `README.md`
- `FINANCIAL_MODEL.md`
- `MONETIZATION_ROADMAP.md`
- `docs/ARCHITECTURE_DECISIONS.md`
- API/payment docs if any are added later.

Choose one canonical story:

- Razorpay-first India payment flow, with Stripe future.
- Stripe Connect-first global payment flow, with Razorpay legacy/local.
- Simulated/manual payments during validation, real provider after pilot.

The third option is likely best until concierge validation succeeds.

## Recommended Immediate Actions

### This Week

1. Pick 10 founders/SMBs and ask for one real backlog task.
2. Do not pitch first. Ask about the last task they tried to outsource or ignored.
3. Convert one task into a quest brief with acceptance criteria.
4. Pick one vetted contributor/adventurer to execute it.
5. Create a simple QA rubric and use it manually.
6. Update Product Hunt/VC docs to mark fake/unverified traction as placeholders.
7. Decide the payment-provider story for the next 90 days.

### Next 30 Days

1. Complete one concierge quest.
2. Get one client quote or written feedback.
3. Measure QA time and delivery quality.
4. Run rank calibration with 10 students.
5. Publish one honest build-in-public post about what was learned.
6. Improve Guild Card to emphasize verified work.
7. Add event/audit logging plan for quest state transitions.

### Next 90 Days

1. Five external company interviews.
2. Three real tasks sourced.
3. Ten or more active adventurers.
4. Five or more submitted quests.
5. Three or more accepted deliveries.
6. One repeat company task.
7. One real or manually verified payment.
8. One public case study.

## Final Strategic Judgment

Adventurers Guild has a strong and coherent product thesis. The codebase is unusually complete for an early product: it already models users, quests, tracks, submissions, reviews, payments, parties, achievements, revenue, and public proof-of-work. The fantasy/RPG identity is not a weakness; it is the product's emotional structure and differentiation.

However, the strategic center must shift from building more possible futures to proving the core trust loop.

The future can include AI copilots, subscriptions, boosts, talent search, direct hire, bootcamp partnerships, seasonal ladders, and enterprise dashboards. But those only matter if the base loop works:

> A real organization gives AG a task. AG scopes it. An adventurer completes it. AG reviews it. The client accepts it. The adventurer gains reputation. The client wants another task.

That is the game loop and the business loop.

Everything else should support that loop or wait.

## Appendix A: Shipped, Partial, Planned

| Area | Status | Notes |
|---|---|---|
| Auth and sessions | Shipped | NextAuth credentials, JWT sessions, role in token/session. |
| Role-based dashboards | Shipped | Adventurer, company, admin routes exist. |
| Public landing | Shipped | Live data direction through public APIs. |
| Public quest board | Shipped | `/quests` and APIs exist. |
| Public quest detail | Shipped | `/quests/[id]` exists. |
| Public Guild Card/profile | Shipped/directional | `/adventurer/[username]` exists; should become stronger verified-work artifact. |
| Quest CRUD | Shipped | Company/admin quest creation and management exist. |
| Quest assignment | Shipped | Assignment models/API exist. |
| Submission/review | Shipped | Submission API and review path exist. |
| Admin QA gate | Shipped | `pending_admin_review` and `/admin/qa-queue` exist. |
| XP/rank/level | Shipped | `lib/xp-utils.ts`, rank utilities, profile stats. |
| Streaks/achievements/activity | Shipped/directional | Models and utilities exist; product impact still needs validation. |
| Leaderboard | Shipped/directional | Page and ranking APIs exist. |
| Bootcamp track | Shipped/directional | Schema, onboarding route, track gating, tutorial flags. Needs real cohort validation. |
| Intern track | Partial | Track exists; operational/payment/legal process needs validation. |
| Party/squad system | Shipped/directional | Models/APIs/pages exist; needs real delivery usage. |
| Payment records | Shipped | `Transaction` model and API exist. |
| Real payouts | Partial | Razorpay utilities exist; simulated fallback remains; Stripe Connect planned. |
| Escrow/milestones | Planned | Needed for trust, not fully implemented as canonical flow. |
| Revenue dashboard | Shipped/directional | Admin revenue route/page exist; MRR still `0`, subscriptions not live. |
| Company subscriptions | Planned/partial schema | Fields exist, billing flow not canonical. |
| Quest boosts | Planned | Not in current schema. |
| Talent search | Planned | No full directory/hiring workflow yet. |
| Direct hire | Planned | No `HireOffer` model yet. |
| AI Copilot | Planned/experimental | Mentioned in pitch docs; not verified as shipped core. |
| Product Hunt launch | Planned | Should wait for honest traction or launch as beta. |
| VC fundraising narrative | Drafted | Needs removal of unverified traction. |

## Appendix B: Code Surface Inventory

### Core App Surfaces

- `/home`: marketing/landing surface.
- `/quests`: public quest board.
- `/quests/[id]`: public quest detail.
- `/adventurer/[username]`: public Guild Card/adventurer profile.
- `/login`, `/register`, `/register-company`, `/forgot-password`: auth and onboarding surfaces.
- `/dashboard`: role-aware dashboard entry.
- `/dashboard/quests`, `/dashboard/quests/[id]`: authenticated quest browsing/detail.
- `/dashboard/my-quests`: adventurer assignments.
- `/dashboard/completed-quests`: adventurer completion history.
- `/dashboard/earnings`, `/dashboard/my-payments`: adventurer payment views.
- `/dashboard/profile`, `/dashboard/settings`: account/profile management.
- `/dashboard/leaderboard`, `/dashboard/skill-tree`, `/dashboard/teams`: progression/community surfaces.
- `/dashboard/company`: company dashboard.
- `/dashboard/company/create-quest`: company quest creation.
- `/dashboard/company/quests`, `/dashboard/company/quests/[id]`, `/dashboard/company/quests/[id]/edit`: company quest management.
- `/dashboard/company/payments`, `/dashboard/company/analytics`, `/dashboard/company/profile`, `/dashboard/company/integrations`: company operations.
- `/admin`: admin dashboard.
- `/admin/quests`, `/admin/qa-queue`, `/admin/revenue`, `/admin/analytics`, `/admin/api-budgets`: admin operations.
- `/faq`, `/terms`, `/privacy`, `/legal/terms`, `/legal/privacy`: support/legal pages.

### API Groups

- Auth: `/api/auth/[...nextauth]`, `/api/auth/register`, `/api/auth/forgot-password`, `/api/auth/reset-password`.
- User/account: `/api/users/me`, `/api/users/me/stats`, `/api/users/me/quests`, `/api/users/me/bootcamp`, `/api/users/search`.
- Quests: `/api/quests`, `/api/quests/[id]`, `/api/quests/[id]/assignments`, `/api/quests/[id]/revisions`, `/api/quests/assignments`, `/api/quests/submissions`, `/api/quests/import-hackathon`.
- Public data: `/api/public/stats`, `/api/public/quests`, `/api/public/quests/[id]`.
- Company: `/api/company/quests`.
- Admin: `/api/admin/quests`, `/api/admin/users`, `/api/admin/activity`, `/api/admin/revenue`, `/api/admin/analytics`, `/api/admin/qa-queue`, `/api/admin/qa-queue/[assignmentId]`, `/api/admin/api-budgets`.
- Payments: `/api/payments`, `/api/payments/razorpay/contact`, `/api/payments/razorpay/contact/status`, `/api/payments/razorpay/transfer`, `/api/payments/webhooks/stripe`, `/api/payments/webhooks/razorpay`.
- Parties: `/api/parties`, `/api/parties/[id]`, `/api/parties/[id]/members`, `/api/parties/[id]/members/[userId]`.
- Teams: `/api/teams`, `/api/teams/members`.
- Progression/community: `/api/rankings`, `/api/rankings/user`, `/api/adventurer/profile`, `/api/adventurer/[username]`, `/api/adventurer/completions`, `/api/adventurer/achievements`, `/api/mentorship`, `/api/notifications`.
- Platform ops: `/api/onboard`, `/api/matching`, `/api/qa/reviews`, `/api/analytics`, `/api/share`, `/api/send-email`, `/api/errors/log`.

### Core Libraries

- `lib/auth.ts`: NextAuth configuration.
- `lib/api-auth.ts`: shared API auth helpers.
- `lib/db.ts`: Prisma singleton and Neon retry helper.
- `lib/services/quest-service.ts`: quest listing and creation policy.
- `lib/quest-lifecycle.ts`: derived quest status syncing.
- `lib/xp-utils.ts`: XP, level, rank, profile stat updates.
- `lib/payment-utils.ts`: client/API payment utility functions.
- `lib/razorpay.ts`: Razorpay client, orders, signatures, payouts, contacts, fund accounts, webhooks.
- `lib/razorpay-payout.ts`: payout processing with simulated fallback.
- `middleware.ts`: route protection and rate limiting.

## Appendix C: Contributor And Community Scope

Adventurers Guild is also an open-source/community project, not only a product.

Current community assets:

- NSoC contributor flow.
- Contributor docs.
- Issue difficulty/rank labeling.
- Maintainer roles for Abid/LarytheLord and Adil2009700.
- GitHub Issues and PR workflow.
- Discord/community direction.
- Contributor leaderboard/contributor recognition direction.

Strategic value:

- Contributors can help build product surface area quickly.
- Public contribution history reinforces the Guild story.
- NSoC gives supply-side energy and social proof.

Risk:

- Contributor PR volume can create maintenance drag.
- Broad or low-quality PRs can destabilize the product.
- Open-source activity is not the same as customer validation.

Recommended contributor policy:

- Keep issues scoped to one feature or bug.
- Label by level/rank consistently.
- Merge only if CI passes and scope matches product priorities.
- Route growth/marketing/docs PRs through truth-checking to avoid fake traction claims.
- Convert large feature ideas into issues, not broad PRs.

## Appendix D: Security, Legal, And Trust Requirements

### Security Requirements

- Standardize API route auth on request-aware `requireAuth(request, ...roles)` where possible.
- Validate all enum inputs with `Object.values(Enum).includes()` before casting.
- Use UUID validation for route params.
- Prevent adventurers from reading other users' assignments/submissions.
- Prevent companies from reading submissions for quests they do not own.
- Prevent bootcamp users from direct-accessing non-BOOTCAMP quests.
- Keep admin-only routes behind admin auth in API and UI.
- Add idempotency to payment and state-transition writes.
- Keep secrets only in environment variables.

### Legal/Operational Requirements

- Terms should define platform role, company responsibilities, adventurer responsibilities, payment timing, and dispute handling.
- If students are paid, clarify contractor/worker status and tax responsibilities.
- Bootcamp students should remain XP/portfolio-only until legal/payment flow is clear.
- Companies should agree that AG mediates QA and delivery.
- Direct hire fees need explicit contract terms before launch.
- Data privacy must cover public Guild Cards and what profile/completion data is visible.

### Trust Requirements

- Every completed quest should have a traceable review path.
- Every payment should have a traceable transaction path.
- Every rank-up should be explainable.
- Every client-visible deliverable should pass QA for non-OPEN tracks.
- Every failed or abandoned quest should produce operational learning, not silent cleanup.

## Appendix E: Hard Product Decisions

### Decision 1: Early Wedge

Use SMB/startup backlog tasks as the first demand wedge. Use students/juniors as supply, but do not make supply growth the main validation metric.

### Decision 2: First Proof Point

The first major proof point is an accepted real client delivery, not user registrations or Product Hunt launch.

### Decision 3: Payment Story

Until real demand is proven, keep payments manual/simulated/limited. Once validated, choose one production provider and remove ambiguous claims.

### Decision 4: Rank Meaning

Rank must mean delivery trust, not only XP. Quality, deadlines, communication, and rework must affect progression.

### Decision 5: AI Scope

AI is a support layer, not the core wedge. Build it only after it has a measurable impact on completion or QA efficiency.

### Decision 6: Product Hunt Timing

Launch publicly only when the story is honest. If traction is not proven, launch as an open-source beta or waitlist, not as a scaled marketplace.

### Decision 7: Bootcamp Scope

Bootcamp is controlled supply and learning infrastructure. It should not be used as proof of company demand unless external clients are involved.

### Decision 8: Marketplace Automation

Do not automate the messy parts too early. Scoping, QA, replacement, and client feedback should be done manually until repeated patterns emerge.

## Appendix F: What To Stop Doing

- Stop presenting placeholder traction as real traction.
- Stop expanding the roadmap before the trust loop is proven.
- Stop treating AI Copilot as the main pitch unless it is shipped and measured.
- Stop mixing Stripe, Razorpay, and simulated payments in public messaging.
- Stop using registrations as the primary progress metric.
- Stop accepting broad PRs that combine unrelated features.
- Stop building monetization layers before repeat company demand exists.

## Appendix G: What To Do Next

The next concrete work package should be:

1. Create a `docs/CONCIERGE_QUEST_PILOT.md` operating plan.
2. Create a `docs/RANK_AND_QA_RUBRIC.md` rubric.
3. Clean Product Hunt and VC docs of unverified traction.
4. Choose and document the 90-day payment posture.
5. Source one real task from one real organization.
6. Run that task manually through AG.
7. Turn the outcome into a case study.

If only one thing gets done, do number 5 and 6.
