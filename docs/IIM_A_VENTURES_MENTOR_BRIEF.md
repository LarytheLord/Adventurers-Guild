# Adventurers Guild - Mentor Brief Draft

## Purpose

This document explains Adventurers Guild in simple terms for mentors who may not be familiar with games, anime, manga, fantasy novels, or RPG culture.

The goal is not to pitch it only as a money-making marketplace. The goal is to explain the world, the product, and why the adventure language matters.

## Simple Explanation

Adventurers Guild is a real-work quest platform where developers complete coding tasks from companies, NGOs, internal projects, bootcamps, and community programs.

Instead of treating work as boring tickets, the platform frames every task as a Quest. Developers are Adventurers. Their public profile is a Guild Card. Their skill growth is shown through XP, ranks, streaks, completed quests, and quality-reviewed work.

Under the fantasy layer, the product is practical:

- Companies can post real coding tasks.
- Developers can apply, complete work, and submit it for review.
- Admins/maintainers can review submissions before company approval.
- Developers earn XP, rank progression, and eventually monetary rewards.
- Public profiles show verified proof of work instead of only self-reported skills.

The adventure identity exists because learning, internships, freelancing, and early career building often feel confusing, lonely, and transactional. Adventurers Guild makes the journey feel structured, social, and meaningful.

## One-Line Positioning

Adventurers Guild turns real software work into quests, helping developers build verified proof of work while companies access ranked, reviewed talent.

## What Exists In The Product Today

Based on the current codebase, the product includes:

- Public landing page with real stats and live quests.
- Public quest board with categories, difficulty, tracks, XP, payout, skills, applicant count, and filters.
- Adventurer registration, login, dashboard, profile, Guild Card, XP, ranks, streaks, leaderboard, completed quests, and earnings views.
- Company registration, company dashboard, company quest creation, quest management, payments/spending pages, and analytics.
- Admin dashboard, quest/user management, QA queue, revenue dashboard, and platform analytics.
- Quest lifecycle: browse, apply, assign, submit, admin review, company review, approve/rework/reject, complete.
- XP/rank engine from F-Rank to S-Rank.
- Public adventurer profile pages at `/adventurer/[username]` with shareable Open Graph images.
- Party/squad features for multi-participant quests.
- Bootcamp onboarding model and bootcamp track fields in the schema.
- Payment infrastructure with Razorpay-related utilities and transaction records.

## What Is Planned Or Still Evolving

These should be described as roadmap items, not fully shipped unless verified before the mentor meeting:

- Fully real money movement through production payment rails.
- Full Open Paws Bootcamp integration as a separate apprentice track.
- Talent search and direct hiring pipeline.
- Company subscription plans and quest boosts.
- More robust skill verification and mentorship matching.
- University/community cohort programs.

## Core Product Loop

1. A company, admin, bootcamp, or community posts a Quest.
2. Adventurers discover quests by rank, skill, category, payout, deadline, and track.
3. Adventurers apply or get assigned.
4. They build the work, often through GitHub or production-code submission.
5. Work goes through QA/admin review and company approval.
6. The Adventurer earns XP, rank progress, quality history, and possibly money.
7. Their Guild Card becomes stronger and more credible.
8. Higher rank unlocks harder quests, better opportunities, and more trust.

## Translation Of Guild Terms

| Guild Language | Plain Meaning |
|---|---|
| Adventurer | Developer, student, intern, contributor, builder |
| Quest | Real software task, project, bug fix, feature, or challenge |
| Guild | Community and trust network of builders |
| Guild Card | Public proof-of-work profile |
| Rank | Skill/trust level based on completed work |
| XP | Progress earned by shipping reviewed work |
| Party | Small team or squad working on a quest |
| Quest Board | Marketplace/listing page for tasks |
| S-Rank | Elite/high-trust developer status |
| Admin QA | Review layer that protects companies and developers |
| Bootcamp Track | Apprentice path for guided learners |

## Why The Adventure Theme Matters

Most career platforms feel like resumes, job boards, dashboards, or gig marketplaces. They are functional but emotionally flat.

Adventurers Guild borrows from game and fantasy culture because those systems are good at showing growth:

- A beginner can clearly see where they start.
- Progress is visible through XP, ranks, badges, and streaks.
- Harder challenges unlock as skill increases.
- Teams form around missions.
- Reputation is earned by doing, not only claiming.
- A long journey becomes easier to understand through story.

For non-gamers, the simplest way to explain it is:

Adventurers Guild uses the language of quests and ranks to make real-world skill growth easier to understand, track, and trust.

## Media And Cultural Inspirations

These are not direct product copies. They are cultural references that explain why this language is familiar and powerful to a large audience of young builders, anime fans, gamers, manga readers, fantasy readers, and internet-native communities.

| Reference | What It Contributes To Our Thinking |
|---|---|
| Dungeons and Dragons | Parties, character sheets, XP, levels, campaigns, quests, and collaborative storytelling. |
| MMORPGs | Persistent online worlds, guilds/clans, social progression, group content, levels, quests, and community culture. |
| World of Warcraft | Quest chains, guilds, classes/roles, dungeons, raids, XP, progression, and long-term identity inside a world. |
| Monster Hunter | Contract-based work loop: accept a mission, prepare, execute, earn rewards, improve gear/status, unlock harder hunts. |
| Solo Leveling | Rank culture from E/F-type beginner levels to S-Rank elite status, hunter associations, dungeons, and visible leveling. |
| Hunter x Hunter | Professional licenses, exams, associations, elite hunter identity, specialization, mentorship, and status earned through trials. |
| DanMachi | Adventurers, dungeon economy, ability scores, levels, familias/community units, and the idea of beginners growing into legends. |
| Goblin Slayer | Adventurer guild contracts, gold/reputation, ranked adventurers, specialization, and real operational quest assignment. |
| Fairy Tail | Guild as family/community, job-request boards, teams, identity, belonging, and long-running missions like 100-year quests. |
| Fantasy novels and RPGs broadly | The hero journey: start weak, accept challenges, build allies, gain skill, earn reputation, and become useful to the world. |

## The Product Is Not Just Gamification

Bad gamification means adding points, badges, or leaderboards on top of boring work.

Adventurers Guild should avoid being explained that way.

The stronger framing is:

Adventurers Guild uses RPG structure to make real work legible. The points and ranks are not decorative; they are a trust system built from completed, reviewed, public work.

## Why This Is Different From Existing Platforms

Compared with traditional platforms:

- LinkedIn shows claims and credentials, but not always verified output.
- Upwork and Fiverr focus on transactions and bidding, not long-term growth.
- LeetCode proves problem-solving practice, not production delivery.
- Internships are limited, opaque, and often based on access.
- Bootcamps teach skills, but many learners still need real applied work.

Adventurers Guild combines:

- Real tasks.
- Public proof of work.
- Review-based progression.
- Community identity.
- Company access.
- A fantasy/RPG wrapper that makes progress feel motivating.

## Mentor-Friendly Narrative

Adventurers Guild is a platform for developers to grow through real work. Companies and communities post software tasks as Quests. Developers complete them, submit work, get reviewed, earn XP, climb ranks, and build a public Guild Card that shows verified proof of work.

The fantasy language is not just branding. It is a product design choice inspired by games, manga, anime, and fantasy stories where beginners start at low rank, accept missions, build a party, gain experience, and eventually become trusted specialists. We are applying that structure to real software development, internships, bootcamps, and early career growth.

The long-term vision is to create a living guild for builders: a place where people do meaningful work, grow publicly, find teams, earn opportunities, and build a reputation that is based on shipped outcomes.

## What We Should Not Say

Avoid saying:

- "It is just a gamified education app."
- "It is like a game for students."
- "It is only a freelancer marketplace."
- "It is only about making money from quests."
- "It is only LinkedIn with XP."

Better phrasing:

- "It is a real-work guild for developers."
- "It turns verified work into progression and reputation."
- "It uses the emotional structure of RPGs to make career growth clearer."
- "It helps beginners become trusted contributors through reviewed quests."
- "It creates proof of work, not just profiles."

## Open Questions For Mentors

- Should the first wedge focus on students, open-source contributors, bootcamp learners, or companies needing small tasks?
- Should the earliest traction come from public quests, university cohorts, open-source contribution programs, or paid company tasks?
- How much fantasy language should remain in investor/mentor communication versus user-facing communication?
- What quality-control process is strong enough for companies to trust early-rank Adventurers?
- What proof points should we collect before pitching VCs: completed quests, active users, company pilots, retention, repeat posts, revenue, or community growth?
- How can we position this as a serious talent infrastructure platform without killing the worldbuilding that makes it special?

## Source Basis

Project files reviewed:

- `README.md`
- `CLAUDE.md`
- `prisma/schema.prisma`
- `app/home/page.tsx`
- `app/quests/page.tsx`
- `app/dashboard/page.tsx`
- `app/adventurer/[username]/page.tsx`
- `components/landing/*`
- `components/quest/PartyPanel.tsx`
- `components/skill-tree.tsx`

External concepts reviewed:

- Gamification
- Quest design in video games
- Role-playing video games
- MMORPGs
- Dungeons and Dragons
- World of Warcraft
- Monster Hunter
- Solo Leveling
- Hunter x Hunter
- DanMachi
- Goblin Slayer
- Fairy Tail
