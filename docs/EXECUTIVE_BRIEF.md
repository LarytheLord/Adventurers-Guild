# Adventurers Guild — Executive Brief

> Five-minute onramp for a mentor, investor, contributor, or partner who has never seen the project before. For the operational deep dive, see `CLAUDE.md`. For the gamification rationale, see `IIM_A_VENTURES_MENTOR_BRIEF.md`. For the investment thesis fit, see `IIMA_VENTURES_THESIS_FIT.md`.

---

## What it is (one sentence)

Adventurers Guild is a **proof-of-work talent infrastructure** for India's developer market: companies post real coding tasks as Quests, developers (Adventurers) complete them under a reviewed, ranked pipeline, and the resulting Guild Card becomes a portable, verifiable credential that travels with the developer across hiring conversations.

## The wedge in plain language

A LinkedIn profile is a *claim*. A LeetCode score is a *practice metric*. An Upwork rating is a *reputation aggregate*. None of them are *verified shipped work tied to a transparent review process*. Adventurers Guild produces exactly that artifact, then layers an RPG progression system (F → S rank, XP, streaks, parties) on top so the journey from beginner to trusted contributor is legible, social, and motivating.

## Why right now, in India

| Force | What changed | What it unlocks |
|---|---|---|
| **AI is eating junior IT services work** | Cursor, Devin, Copilot are automating 40–60% of L1/L2 engineering tasks (per IIMA Ventures Enterprise AI thesis, May 2026) | India's 5.4M-strong IT services workforce needs a new credentialing system that demonstrates work that AI *can't* do alone |
| **Bootcamps and self-taught devs are scaling faster than placement** | Open Paws and similar programs graduate cohorts every 10 weeks; degree-blind hiring is finally normalising | A neutral proof-of-work layer becomes the lingua franca for non-traditional candidates |
| **Companies under cost pressure are unbundling work** | Hiring full-time juniors is risky; project-based work is rising | Verified ranked Adventurers fill a real gap between "freelancer roulette" (Upwork) and "credentialed bench" (Toptal) |
| **India Stack maturation** | UPI, DigiLocker, Aadhaar e-KYC enable seamless payouts, verification, and trust at the developer layer | Per-quest INR payouts via Razorpay; future identity verification via DigiLocker |

## What is shipped today

- **Full marketplace flow**: company onboarding → quest creation → adventurer application → assignment → submission → admin QA → company approval → XP/rank update → public Guild Card update.
- **Multi-participant quests**: `maxParticipants` + party system so squads of 3–5 can co-own larger quests.
- **Two-track schema scaffolding**: `QuestTrack` enum, `BootcampLink` model, parent/sub-quest fields — the data shape for Interns vs. Bootcamp talent is committed; visibility filtering is partial (see `IMPLEMENTATION_TASKS.md`).
- **Production posture**: Next.js 15 / Prisma 6 / Neon Postgres, Vercel deployment, Sentry instrumentation, Playwright E2E, GitHub Actions CI (lint + type-check + build).
- **Razorpay integration scaffolding**: Contact + Fund Account API utilities present; full money movement still to be enabled end-to-end.
- **Live public surface**: landing + quest board pull from `/api/public/stats` and `/api/public/quests` — no faked numbers.

## What is *not yet* shipped (be honest with mentors)

- Production money movement at scale (Razorpay flows scaffolded, escrow + dispute handling not battle-tested).
- Full bootcamp-track gating (schema fields exist; UX-level enforcement is in progress).
- Talent search / direct-hire pipeline (Phase 3 in `FINANCIAL_MODEL.md`).
- Subscription billing (planned, not built).

## Who is using it / who has committed

- **Pilot companies**: Knight Medicare (Abi's other venture — Harvard-MD co-founded mental health platform), Open Paws ecosystem.
- **NSoC 2026** open-source contributor program (Apr 15 – May 30, 2026) using the live repo for ranked first-time contributions.
- **Open Paws Bootcamp** integration as the apprentice talent pipeline (Phase 1 build in progress).

## The team

Two co-maintainers with full architectural and merge authority (see `MAINTAINERS.md`):

- **[@LarytheLord](https://github.com/LarytheLord)** — Architecture, infrastructure, payments, bootcamp pipeline.
- **[@Adil2009700](https://github.com/Adil2009700)** — Frontend, dashboard UX, landing page, PR triage.

Operating context: built alongside Knight Medicare (production mental-health platform, Harvard MD clinical co-founder) and Project Chimera (RLHF / agent infra). The same operator stack ships across all three — meaningful for a venture lens because the team has demonstrated they can take systems from zero to production in adjacent verticals.

## Revenue model — short version

- **15% service fee** charged to the *company* per quest. Adventurers keep 100% of the posted reward — a structural acquisition lever vs. Upwork/Fiverr who tax both sides.
- **Subscription tier** for repeat-posting companies (`Guild Partner` ₹/$149/mo; `Enterprise` ₹/$499/mo).
- **Quest boosts** (Featured, Urgent) at the moment of intent.
- **Talent Pipeline** (Phase 3) — direct-hire placement fee (~10% of annual salary) and `Talent Search` subscription for recruiters browsing ranked Guild Cards.

Break-even at growth-stage fixed costs: ~88 quests/month. Full unit economics: `FINANCIAL_MODEL.md`.

## The 60-second pitch

> Indian IT services is the largest organised industry in the country and the one AI is most aggressively repricing. Five million engineers need a new credential that proves what they ship, not what they claim — and companies hiring them need a way to verify that quickly, cheaply, and without LinkedIn theatre. Adventurers Guild turns every reviewed, completed task into a unit of verifiable reputation. We're already running real quests with pilot companies, NSoC contributors, and an integrating bootcamp. The wedge is the rank: a B+ Guild Card means *this person has shipped this much reviewed work* — and that's a stronger hiring signal than a 30-minute LeetCode round. We monetise the company side, keep developers free, and build the talent pipeline that India's post-AI services economy needs.

## Where to go next

| If you are a… | Start here |
|---|---|
| Mentor / investor | `IIMA_VENTURES_THESIS_FIT.md`, then `FINANCIAL_MODEL.md` |
| Sector analyst | `PROBLEM_LANDSCAPE.md` (Landscaping analysis), then `COMPETITIVE_ANALYSIS_RENDERED.md` |
| Engineer / contributor | `CLAUDE.md`, then `docs/contributor-onboarding.md`, then `docs/IMPLEMENTATION_TASKS.md` |
| Customer-discovery / GTM | `docs/MOM_TEST_CUSTOMER_DISCOVERY_AUDIT.md`, then `MONETIZATION_ROADMAP.md` |
| Pitching VCs | `docs/VC_PITCH_GUIDE.md`, then this brief, then `IIMA_VENTURES_THESIS_FIT.md` |

---

*Last updated: 2026-05-26. Author: AG team during IIMA Ventures AI Summer Residency.*
