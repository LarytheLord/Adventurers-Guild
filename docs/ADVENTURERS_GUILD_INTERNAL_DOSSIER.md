---
title: "Adventurers Guild Internal Master Dossier"
subtitle: "Transparent product, market, research, risk, and future-plan source of truth"
author: "Adventurers Guild Team"
date: "2026-05-27"
geometry: margin=0.75in
fontsize: 10pt
toc: true
numbersections: true
---

# Internal Use Notice

This dossier is intentionally transparent. It is not a polished investor memo and should not be shared externally without editing. It includes shipped reality, partial implementations, strategic contradictions, unverified claims, payment uncertainty, validation gaps, technical risks, and the future plan.

The purpose is to give Abid, Adil, contributors, mentors, and trusted internal collaborators one document that explains what Adventurers Guild is, what exists, what does not exist yet, what the research says, and what should happen next.

# Executive Summary

Adventurers Guild is a proof-of-work talent infrastructure platform for developers. Companies, communities, NGOs, internal projects, and bootcamps post real software tasks as Quests. Developers, called Adventurers, complete those quests, pass review, earn XP, climb ranks from F to S, and build a public Guild Card that acts as a portable, verifiable credential.

The strongest long-term thesis is:

> Adventurers Guild turns reviewed real work into progression, reputation, and opportunity.

The strongest near-term wedge is narrower:

> Use manually scoped, QA-reviewed, small software quests to prove that companies will trust vetted students or junior developers with real work.

The product is not merely a freelance marketplace, education app, or gamified dashboard. The fantasy/RPG wrapper is a product system: Quest, Adventurer, Rank, XP, Party, Guild Card, and Guild are all user-facing ways to make skill growth and trust easier to understand.

The codebase is already substantial. It includes auth, role-based dashboards, quest posting, quest browsing, assignment, submissions, admin QA, rank/XP/streak systems, public quest board, public Guild Cards, bootcamp/intern track primitives, party/squad models, payments scaffolding, admin analytics, revenue surfaces, tests, and Vercel deployment.

The business and validation reality is less mature. Customer demand is not yet proven. The Mom Test audit shows that the story is understandable and the objections are clear, but it did not validate that companies will post paid quests, deposit funds, trust student delivery, or repeat usage. The riskiest assumption is not the anime/fantasy identity. The riskiest assumption is trust.

The correct next move is not to expand into every future feature. The correct next move is to prove the base loop:

> A real organization gives AG a task. AG scopes it. An Adventurer or Party completes it. AG reviews it. The client accepts it. The Adventurer gains reputation. The client wants another task.

# One-Page Truth Table

| Area | Current truth | Confidence | Internal note |
|---|---|---:|---|
| Product concept | Strong and coherent | High | Real-work guild + credential engine is a strong frame. |
| Codebase maturity | Higher than typical early prototype | High | Core domain is modeled across schema, pages, APIs. |
| Public quest board | Exists | High | `/quests` and public quest APIs exist. |
| Guild Card | Exists directionally | High | Needs stronger verified-work emphasis. |
| XP/rank | Exists | High | Needs to encode trust, not just activity. |
| Admin QA | Exists | High | Central to trust and should be treated as product moat. |
| Party system | Exists directionally | Medium | Needs real delivery usage and metrics. |
| Bootcamp track | Exists directionally | Medium | Schema and gating exist; real cohort validation still needed. |
| Real payment movement | Partial/unclear | Medium | Razorpay and Stripe references conflict; simulated paths remain. |
| Escrow | Planned | High | Important for trust, not canonical yet. |
| Subscriptions | Planned/partial schema | High | Not a near-term priority until repeat demand exists. |
| Quest boosts | Planned | High | Do later, after marketplace liquidity. |
| Talent search | Planned | High | Depends on Guild Card/rank credibility. |
| AI Copilot | Planned/experimental | High | v2/v3 lever, not core v1 proof. |
| Customer demand | Not proven | High | Needs concierge quest validation. |
| Traction claims in PH/VC docs | Some are placeholders | High | Do not use externally unless verified. |
| IIMA thesis fit | Strong if framed honestly | High | AI-native by v2, AI-amplified today. |

# Product Identity

## What Adventurers Guild Is

Adventurers Guild is a platform where real software work becomes Quests and real delivery becomes reputation. Developers do not just claim skills; they earn rank by completing reviewed work. Companies do not just browse resumes; they see proof of delivery.

Plain explanation:

> Adventurers Guild helps developers build verified proof of work by completing real software quests, while companies access ranked, reviewed talent.

Strategic explanation:

> Adventurers Guild is a proof-of-work credentialing layer for India's developer market, produced through real project delivery and represented through Guild Cards, XP, ranks, and reviewed quest history.

Community explanation:

> It is the Adventurers Guild from RPGs, fantasy novels, manga, anime, and MMORPGs, but for real builders shipping code.

## What Adventurers Guild Is Not

AG should not be reduced to:

- A gamified education app.
- A freelancing marketplace clone.
- LinkedIn with XP.
- Upwork for students.
- A bootcamp dashboard.
- A course platform.
- A points/badges wrapper on generic work.

All of those comparisons explain part of the product, but none explain the full loop.

## Why The Fantasy Language Matters

The fantasy/RPG language is not decoration. It makes growth legible.

- Beginners start at low rank.
- They accept smaller quests.
- They work alone or in Parties.
- They get reviewed.
- They earn XP, rank, quality history, and sometimes money.
- Their Guild Card becomes stronger.
- Better rank unlocks harder quests and more trust.

This matches cultural systems already familiar to gamers, anime fans, manga readers, and fantasy readers: Dungeons and Dragons, MMORPGs, World of Warcraft, Monster Hunter, Solo Leveling, Hunter x Hunter, DanMachi, Goblin Slayer, and Fairy Tail.

For non-gamers, the translation is simple:

> Adventurers Guild uses quests and ranks to make real-world skill growth visible, structured, and trusted.

# Current Shipped State

## Technology Stack

- Framework: Next.js 15 App Router.
- Language: TypeScript.
- UI: shadcn/ui, Tailwind CSS, Radix UI, Lucide React.
- Auth: NextAuth.js v4 credentials provider with JWT sessions.
- Database: Neon serverless PostgreSQL through Prisma 6.
- Deployment: Vercel.
- Payments packages: Razorpay and Stripe are both present.
- Testing: Jest and Playwright.
- Observability: Sentry package present.

Important commands:

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run type-check`
- `npm run test`
- `npm run test:e2e`
- `npm run db:push`
- `npm run db:seed`

## Current Domain Model

The Prisma schema includes a broad domain model:

- `User`: role, username, rank, XP, level, profile fields, mentor fields.
- `AdventurerProfile`: skills, availability, completion rate, streaks, payout account fields.
- `CompanyProfile`: company details, verification, spend, subscription fields.
- `Quest`: status, difficulty, XP, monetary reward, track, source, parent quest, sub-quests, revisions, share count.
- `QuestAssignment`: assignment lifecycle.
- `QuestSubmission`: submission content, status, reviewer, quality score.
- `QuestCompletion`: completed quest record with XP and quality score.
- `BootcampLink`: bootcamp student link, cohort, tutorial completion, eligibility.
- `Party` and `PartyMember`: squad/party delivery system.
- `Transaction`: payment records, provider IDs, platform fees, status.
- `Notification`, `VerificationRequest`, `Mentorship`, `ActivityLog`, `Achievement`, `ApiKeyBudget`.

This is not a toy schema. It already supports the long-term idea of marketplace, credential, progression, teams, payments, and analytics.

## Adventurer Surfaces

Implemented or represented:

- Registration and login.
- Dashboard.
- Quest browsing.
- Quest detail views.
- Quest assignment/application flows.
- Submission flow.
- My quests and completed quests pages.
- Earnings and payment history pages.
- Profile and settings pages.
- Skill tree.
- Leaderboard.
- Teams/party surface.
- Public adventurer profile at `/adventurer/[username]`.
- XP, rank, streak, activity, achievement models.
- Razorpay contact/fund-account infrastructure.

## Company Surfaces

Implemented or represented:

- Company registration.
- Company dashboard.
- Company quest creation.
- Company quest management.
- Company quest detail/edit pages.
- Company analytics.
- Company payments/spending pages.
- Company profile.
- Company-owned quest visibility.
- Company review after admin QA gate.
- Subscription fields in schema.

## Admin Surfaces

Implemented or represented:

- Admin dashboard.
- Admin quest management.
- Admin user APIs.
- Admin QA queue.
- Admin revenue dashboard/API.
- Admin analytics dashboard/API.
- API budget tracking.
- Activity/admin routes.
- Broader workflow visibility.

## Current Quest Lifecycle

Quest statuses:

- `draft`
- `available`
- `in_progress`
- `review`
- `completed`
- `cancelled`

Assignment statuses:

- `assigned`
- `started`
- `in_progress`
- `submitted`
- `pending_admin_review`
- `review`
- `completed`
- `cancelled`
- `needs_rework`

Submission statuses:

- `pending`
- `under_review`
- `approved`
- `needs_rework`
- `rejected`

Important behavior:

- `lib/quest-lifecycle.ts` derives quest status from assignments.
- OPEN quests can go directly to submitted/review.
- INTERN and BOOTCAMP quests go through `pending_admin_review`.
- Bootcamp users are locked to BOOTCAMP track at API level.
- Ineligible bootcamp users should only see tutorial quests.
- Completion creates a `QuestCompletion` record and updates XP/rank.

## Tests And CI

The repository includes:

- Unit tests for payment utilities.
- Unit tests for XP utilities.
- API tests for quests.
- E2E tests for auth flows.
- E2E tests for quest flow.
- E2E tests for API ownership.
- E2E tests for bootcamp pipeline.
- GitHub Actions CI for lint, type-check, tests, and build.

Recent status from previous work: CI was verified green after fixing `ts-node`, AdminDashboard JSX, and `username` in onboarding.

# Research Synthesis

## Problem Landscape

The new `PROBLEM_LANDSCAPE.md` frames the sector as India's developer talent supply, skill development, talent discovery, and project-work consumption layer.

Sector facts used internally:

- India has roughly 6M software developers.
- India produces roughly 1.5M engineering graduates per year.
- Indian IT services and BPO is a $250B+ sector.
- Bootcamps and self-taught pathways are growing faster than placement capacity.
- AI tools are repricing junior engineering work.
- Companies increasingly need verified skill, not self-claimed profiles.

The landscaping matrix identifies four buildable gaps:

1. A neutral, India-native, pipeline-produced proof-of-work credential.
2. Project-led upskilling with reviewed output as the assessment unit.
3. Rank as a new distribution primitive for talent discovery.
4. Project-work marketplace with a talent-pipeline/direct-hire off-ramp.

AG fits all four, but the first is the clearest wedge:

> Guild Card is the credential.

## IIMA Ventures Thesis Fit

The `IIMA_VENTURES_THESIS_FIT.md` maps AG to IIMA Ventures' Enterprise AI thesis.

The honest position:

- AG today is AI-amplified, not AI-native.
- The v1 marketplace and credential flow can work without AI.
- The v2/v3 opportunity becomes AI-native when AG uses accumulated quest, submission, review, and rank data for matching, review assist, quest brief generation, and skill graph inference.

AG sits primarily in:

- IT Services and Business Process Outsourcing.
- Workforce reskilling and AI augmentation.
- AI-native services delivery platforms.

Secondary placement:

- SaaS / Developer Tools, through AI-native vertical SaaS for talent infrastructure.

The IIMA thesis-fit sentence from the research is strong:

> Adventurers Guild is the proof-of-work credentialing layer for India's 6M+ developer market, AI-amplified today and AI-native by v2, with structural moats in reviewed-work data, bootcamp distribution, India Stack integration, and a cross-portfolio operating team.

## Competitive Lessons

The Rendered.one analysis is valuable because it identifies practical marketplace trust mechanics:

- Escrow on quest acceptance.
- Structured quest briefs.
- Transparent rate card.
- Dispute mediation.
- Payment as accountability.
- Selective vetting as quality signal.
- Rank-based trust tiers.

The strongest lesson:

> Payment, even modest payment, changes behavior from homework to professional delivery.

The biggest AG-specific opportunity from this analysis is the "third thing" positioning:

> Not freelancing. Not internships. A quest system where payment and XP progression create accountability on both sides, and every completed quest levels you up.

## Executive Brief Synthesis

The executive brief frames AG as proof-of-work talent infrastructure. This is the most mature top-level positioning currently in the docs.

Useful one-sentence version:

> Adventurers Guild is proof-of-work talent infrastructure for India's developer market: companies post real coding tasks as Quests, developers complete them under a reviewed ranked pipeline, and the resulting Guild Card becomes a portable verifiable credential.

This is stronger than saying "gamified marketplace" because it makes the credential the product and the marketplace the production mechanism.

# Validation Truth

## What The Mom Test Audit Actually Proved

The customer-discovery conversation was useful, but it was not a strong Mom Test interview.

It proved:

- The core story is understandable.
- Student proof-of-work pain is plausible.
- SMB/freelancer quality-control pain is plausible.
- Verification and commitment are obvious objections.
- Milestone/phased delivery is a promising operational answer.

It did not prove:

- SMBs will post paid quests.
- Companies will deposit funds or pay a platform fee.
- Students will complete real work under deadlines.
- Rank creates hiring trust.
- The marketplace can avoid cold-start without heavy manual operations.

## The Riskiest Assumptions

1. Companies have small software tasks they want done now.
2. Companies will trust vetted junior developers if AG provides QA and replacement.
3. Students and early developers will finish real client work on time.
4. Rank can be made trustworthy and hard to game.
5. Manual founder/maintainer scoping can create enough early quality.
6. Companies will care about Guild Cards in hiring.
7. Bootcamps will pay or revenue-share for AG as capstone infrastructure.
8. AI guidance will improve completion, retention, or quality.

## Validation Priority

The highest-priority validation is not Product Hunt, AI Copilot, subscriptions, or more dashboards.

The priority is:

> Can AG deliver one real quest for one real client with acceptable quality and repeat intent?

Success means:

- A real client gives a real task.
- AG scopes it clearly.
- An Adventurer or Party delivers it.
- Admin QA catches issues before the client sees them.
- Client accepts the result or gives useful rework.
- Client would post another task or pay for the next one.

# Business Model Reality

## Revenue Model In Docs

The current financial model assumes:

- Company-side quest service fee: 10-15 percent.
- Adventurers keep 100 percent of posted reward.
- Company subscriptions later.
- Quest boosts later.
- Talent search and direct-hire fees later.
- Optional adventurer premium possibly much later.

This model is coherent, but it depends on repeat company demand.

## Payment Reality

Payment docs and code are inconsistent.

Current situation:

- `Transaction` model supports provider IDs, platform fees, and statuses.
- `app/api/payments/route.ts` still has simulated payment behavior.
- Razorpay utilities exist for orders, contacts, fund accounts, payouts, and webhooks.
- `lib/razorpay-payout.ts` can do real Razorpay payout if configured, else simulated fallback.
- Stripe package and Stripe webhook exist.
- README says internal pipeline with Stripe Connect planned.
- Architecture docs say Stripe Connect for interns, XP-only for bootcamp.
- Some code and PRs point toward Razorpay.

Internal conclusion:

> Payment infrastructure exists, but production money movement is not a clean single source of truth yet.

Recommended 90-day posture:

- Do not claim fully productionized payment rails.
- For validation, use manual/simulated/limited payments if needed.
- Pick one provider before production payouts.
- If India-first: Razorpay is pragmatic.
- If global marketplace and split payments matter more: Stripe Connect is cleaner long-term.
- Do not maintain Razorpay, Stripe, and simulated flows as equally first-class public stories.

## Monetization Sequencing

Recommended order:

1. Free or pay-on-success concierge pilots.
2. Paid second task or low-risk fixed-fee pilot.
3. Company-side service fee after successful delivery.
4. Escrow/milestone payments.
5. Repeat company subscription.
6. Quest boosts.
7. Talent search.
8. Direct-hire placement.

Do not build subscriptions before repeat posting exists.

# Strategic Risks

## Trust Risk

Trust is the central risk. Companies need to believe:

- Work will be completed.
- Quality will be reviewed.
- Bad submissions will not reach them.
- Someone accountable can replace stuck Adventurers.
- Payment and scope will be handled fairly.

Admin QA is not a side feature. It is core infrastructure.

## Rank Risk

Rank can become cosmetic if it only reflects XP. Rank must predict delivery quality.

Rank should incorporate:

- Completed quests.
- Quest difficulty.
- QA score.
- Deadline reliability.
- Rework count.
- Communication quality.
- Client acceptance.
- Abandonment penalties.

## Cold-Start Risk

The marketplace has two sides. If there are no quests, Adventurers leave. If there are no reliable Adventurers, companies leave.

The practical solution is not full marketplace automation. It is concierge operation:

- Manually source tasks.
- Manually scope.
- Manually match.
- Manually QA.
- Learn the failure modes.

## Payment And Legal Risk

Risks:

- Double payment creation.
- Failed payout after marking completion.
- Currency confusion between USD and INR.
- Platform fee deducted from Adventurer despite docs promising 100 percent reward.
- TDS/GST/contractor classification issues.
- Dispute handling without policy.

Mitigation:

- Choose one payment path.
- Add idempotency.
- Create clear payment states.
- Keep bootcamp XP-only until legal/payment complexity is resolved.
- Write dispute policy before escrow goes live.

## AI Overreach Risk

AI is strategically important, but it should not distract from the real-work loop.

AI is useful when it improves:

- Quest brief generation.
- Quest-to-Adventurer matching.
- Submission review assist.
- Skill graph inference.
- Learning recommendations.

AI is not the v1 proof. The v1 proof is accepted real work.

## Documentation And Claim Risk

Some Product Hunt and VC docs contain placeholder or aspirational claims:

- 100+ Adventurers.
- 50+ companies.
- $20K+ paid out.
- 500+ hours completed.
- 4.2/5 rating.

Other docs mention more grounded numbers, such as 14 real users and 14 real quests. Internal docs should preserve both, but external docs must not use placeholder traction as fact.

# Future Plan

## 30-Day Plan

Goal: prove the trust loop manually.

Actions:

1. Pick 10 founder/SMB/company contacts.
2. Run Mom Test interviews about recent software tasks.
3. Ask for one real backlog task.
4. Convert 1-2 tasks into structured quest briefs.
5. Select a vetted Adventurer or Party.
6. Run AG QA before client review.
7. Capture delivery time, rework, QA time, and client feedback.
8. Ask for payment, testimonial, or second task.
9. Create a rank/QA rubric draft.
10. Clean external-facing docs of unverified traction.

Success criteria:

- 5 real company conversations.
- 3 real backlog tasks identified.
- 1 task scoped into a quest.
- 1 delivery attempted.
- QA workload measured.

## 60-Day Plan

Goal: convert the first pilot into repeatable operations.

Actions:

1. Complete first concierge quest.
2. Run rank calibration with 10 students or contributors.
3. Publish an internal QA rubric.
4. Improve Guild Card to show verified work more clearly.
5. Decide 90-day payment posture.
6. Decide rate card assumptions for F/E/D quests.
7. Create an internal case study from the pilot.
8. Track real metrics weekly.

Success criteria:

- 1 accepted delivery.
- 1 client feedback quote.
- 5 benchmark submissions from Adventurers.
- Clear F/E/D rank criteria.
- Payment posture documented.

## 90-Day Plan

Goal: run a small marketplace beta with honest metrics.

Actions:

1. Source 5 external company leads.
2. Get 3 external tasks.
3. Complete 3 accepted deliveries.
4. Onboard 20-50 active Adventurers.
5. Track completion, rework, QA time, and client acceptance.
6. Process one real or manually verified payment.
7. Produce one public-ready case study.
8. Prepare a truthful Product Hunt or mentor-facing brief.

Success criteria:

- 3 accepted deliveries.
- 1 repeat company task or paid follow-up.
- 10 active Adventurers.
- 1 real payment or signed payment commitment.
- 1 case study.

## 6-Month Roadmap

Goal: turn concierge delivery into repeatable marketplace operations.

Priorities:

1. Real payment flow with one provider.
2. Escrow or milestone payment handling.
3. Structured quest brief template.
4. Event/audit trail for state transitions.
5. Reliable admin QA queue and review rubric.
6. Rank calibration and public criteria.
7. Company pilot program with at least 5 companies.
8. Adventurer cohort with 20-50 active users.
9. Guild Card as validated proof-of-work credential.
10. Case studies from real accepted quests.

Do not prioritize:

- Full AI chat mentor.
- Subscriptions.
- Quest boosts.
- Mobile apps.
- Enterprise white label.
- International expansion.

## 12-Month Roadmap

Goal: become a trusted credential and project-work platform.

Priorities:

1. 50+ active companies or repeat posting partners.
2. 500+ registered Adventurers with meaningful active cohort.
3. Consistent quest completion and QA metrics.
4. Production payment and dispute handling.
5. Talent search alpha.
6. Direct-hire pilot.
7. Bootcamp/university cohort partnerships.
8. AI matching/review assist based on real data.
9. Company trust score.
10. Seasonal ladders and mastery tracks.

## 24-Month Vision

Goal: become India-native developer proof-of-work infrastructure.

Long-term capabilities:

- Verified Guild Card as recognized developer credential.
- Rank-based talent search.
- Direct-hire marketplace.
- AI-powered quest matching.
- AI-assisted code review.
- Quest brief generation.
- Skill graph and rank trajectory prediction.
- Bootcamp and university operating system.
- Enterprise talent infrastructure.
- India Stack verification and compliance rails.
- International expansion only after India wedge works.

# Operating Plan

## Concierge Quest Pilot SOP

1. Interview founder/client about a real backlog task.
2. Confirm urgency, budget, owner, and success criteria.
3. Scope the task into a quest brief.
4. Define acceptance criteria.
5. Break into milestones if larger than 3-5 days.
6. Assign a vetted Adventurer or Party.
7. Set communication cadence.
8. Require midpoint check-in.
9. QA submission before client sees it.
10. Send client a review checklist.
11. Approve, request rework, or replace contributor.
12. Capture feedback, testimonial, payment, or second task.

## Quest Brief Template

Every real quest should include:

- Title.
- Client/project owner.
- Plain-language problem.
- Deliverables.
- Acceptance criteria.
- Tech stack constraints.
- Required skills.
- Difficulty rank.
- Expected time budget.
- Deadline.
- Milestones for larger work.
- QA checklist.
- Payment/reward terms.
- Rework rules.

## QA Rubric

Score each submission on:

- Correctness.
- Completeness against acceptance criteria.
- Maintainability.
- Security/basic safety.
- UX/product fit where relevant.
- Test coverage or manual verification.
- Communication.
- Deadline performance.
- Rework handling.

The QA score should feed rank progression.

## Rank Rubric

Suggested interpretation:

- F-rank: can complete guided tutorial tasks.
- E-rank: can complete small scoped changes with review.
- D-rank: can ship contained production fixes/features.
- C-rank: can own medium tasks with limited supervision.
- B-rank: can lead a small party or module.
- A-rank: can handle complex client work and mentor others.
- S-rank: trusted expert with repeated high-quality delivery and leadership.

Rank should include quality and reliability, not only XP.

## Company Outreach Script

Do not start by pitching. Ask:

1. Tell me about the last small software task you wanted done but did not assign internally.
2. What did you do instead?
3. Who did you ask?
4. How much time or money did it cost?
5. What went wrong?
6. Do you have a task like that right now?
7. If I personally scope it and QA delivery, would you let us attempt it this week?
8. What would success look like?
9. If it works, would you pay for the next one or introduce me to someone similar?

## Weekly Operating Rhythm

- Review open PRs and issues.
- Track active Adventurers.
- Track real quests, not seed quests.
- Track company conversations.
- Track tasks sourced.
- Track submitted and accepted quests.
- Track QA time.
- Track rework rate.
- Track payment or repeat-task intent.
- Publish one honest build-in-public update.
- Update internal metrics sheet.

# Open Decisions

## Payment Provider

Options:

1. Razorpay-first India flow.
2. Stripe Connect-first global flow.
3. Manual/simulated validation first, production provider after demand proof.

Recommendation: option 3 for validation, then choose Razorpay or Stripe based on the first paying customer segment.

## Rate Card

Open question: what should F/E/D/C/B/A/S quests pay in INR/USD?

Recommendation: benchmark against Indian freelance rates and start with fixed pilot ranges, not dynamic pricing.

## First Customer Segment

Options:

1. Founder-led startups/SMBs with small backlog tasks.
2. Bootcamps/universities needing capstone infrastructure.
3. Internal/sister ventures only.

Recommendation: use internal/sister ventures for supply training, but validate demand with external founder-led startups/SMBs.

## AI Timing

Options:

1. Build hint sidebar now.
2. Wait until quest flow has real usage.
3. Build AI review assist first, not learner chat.

Recommendation: static hints are okay if low effort, but AI review/brief generation has higher strategic leverage after real quests exist.

## Product Hunt Timing

Options:

1. Launch now as open-source beta.
2. Wait for 1 case study.
3. Wait for 3 accepted external quests.

Recommendation: wait for at least one honest case study, unless launching explicitly as an open-source beta with no fake traction claims.

# What To Stop Doing

- Stop presenting placeholder traction as real traction.
- Stop expanding roadmap before proving the trust loop.
- Stop treating AI Copilot as the main pitch unless shipped and measured.
- Stop mixing Stripe, Razorpay, and simulated payments in public messaging.
- Stop using registrations as the primary progress metric.
- Stop accepting broad PRs combining unrelated features.
- Stop building monetization layers before repeat company demand exists.

# What To Do Next

Immediate work package:

1. Create `docs/CONCIERGE_QUEST_PILOT.md`.
2. Create `docs/RANK_AND_QA_RUBRIC.md`.
3. Clean Product Hunt and VC docs of unverified traction.
4. Choose and document the 90-day payment posture.
5. Source one real task from one real organization.
6. Run that task manually through AG.
7. Turn the result into a case study.

If only one thing gets done, do steps 5 and 6.

# Appendices

## Appendix A: Source Documents

Primary docs synthesized:

- `docs/EXECUTIVE_BRIEF.md`
- `docs/PROBLEM_LANDSCAPE.md`
- `docs/IIMA_VENTURES_THESIS_FIT.md`
- `docs/COMPREHENSIVE_PROJECT_ANALYSIS.md`
- `docs/MOM_TEST_CUSTOMER_DISCOVERY_AUDIT.md`
- `docs/IIM_A_VENTURES_MENTOR_BRIEF.md`
- `docs/COMPETITIVE_ANALYSIS_RENDERED.md`
- `FINANCIAL_MODEL.md`
- `MONETIZATION_ROADMAP.md`
- `docs/GROWTH_PLAN_2026_Q2.md`
- `docs/ROADMAP_2026_Q2.md`
- `docs/MARKETING_AUTOMATION.md`
- `docs/COPILOT_IMPLEMENTATION_PLAN.md`
- `docs/ARCHITECTURE_DECISIONS.md`
- `docs/IMPLEMENTATION_TASKS.md`
- `CLAUDE.md`
- `README.md`

## Appendix B: Code References

Important files:

- `prisma/schema.prisma`
- `lib/auth.ts`
- `lib/api-auth.ts`
- `lib/db.ts`
- `lib/services/quest-service.ts`
- `lib/quest-lifecycle.ts`
- `lib/xp-utils.ts`
- `lib/payment-utils.ts`
- `lib/razorpay.ts`
- `lib/razorpay-payout.ts`
- `middleware.ts`
- `app/api/quests/route.ts`
- `app/api/quests/[id]/route.ts`
- `app/api/quests/submissions/route.ts`
- `app/api/payments/route.ts`
- `app/api/admin/revenue/route.ts`

## Appendix C: Metrics Checklist

Marketplace metrics:

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

Trust metrics:

- QA pass rate.
- Average QA time per submission.
- Number of rework rounds.
- Deadline hit rate.
- Abandonment rate.
- Replacement rate.
- Quality score distribution.
- Rank-to-quality correlation.

Adventurer metrics:

- Quest start rate.
- Quest submit rate.
- Tutorial completion rate.
- Rank-up rate.
- 30-day retention.
- Repeat quest participation.
- Guild Card shares/views.

Company metrics:

- Backlog-task interview conversion.
- Task-post conversion.
- Payment/deposit conversion.
- Repeat task intent.
- Actual repeat task rate.
- Company satisfaction.
- Hiring interest from Guild Card/rank.

## Appendix D: Glossary

- Adventurer: developer using AG.
- Quest: real software task.
- Guild Card: public proof-of-work profile.
- Rank: trust/progression level from F to S.
- XP: progress points earned from reviewed work.
- Party: small team/squad working on a quest.
- Admin QA: review gate before client sees work.
- Bootcamp Track: apprentice/learning track.
- Intern Track: higher-stakes production delivery track.
- OPEN Track: public/open quest pool.
- GMV: gross merchandise value, total quest reward volume.
- Take rate: platform revenue as percent of GMV.

# Final Internal Judgment

Adventurers Guild has a strong identity, strong research framing, and a real codebase. It is not just an idea. The next risk is not whether the worldbuilding is good or whether the architecture can support the vision. The next risk is whether a real company trusts AG with real work and wants to come back after delivery.

Therefore the internal priority is:

> Credential engine first, trust loop first, marketplace scale second, AI and monetization layers after real delivery data exists.

Everything else should serve that loop.
