# Marketing Automation Plan — 4 Accounts

> Updated: 2026-03-26
> Accounts: X (personal @LarytheLord + project @AG), LinkedIn (personal + company page)
> Automation: Claude Cowork for drafting + scheduling
> LinkedIn Company Page: https://www.linkedin.com/company/108034419/

---

## Account Strategy — Different Voice, Different Audience

### Account 1: X — Personal (@LarytheLord / Abid)
**Voice**: Founder building in public. Technical, honest, personal.
**Audience**: Indian dev community, indie hackers, CS students
**Content ratio**: 60% build-in-public, 20% dev career advice, 20% AG showcases

### Account 2: X — Project (@AdventurersGuild or similar)
**Voice**: The Guild itself. Authoritative, game-themed, community-focused.
**Audience**: Developers looking for work, companies looking for talent
**Content ratio**: 40% quest/feature announcements, 30% adventurer highlights, 30% dev industry takes

### Account 3: LinkedIn — Personal (Abid Khan)
**Voice**: Professional founder. Strategic, growth-focused, data-driven.
**Audience**: VCs, startup founders, HR/hiring managers, EdTech community
**Content ratio**: 40% thought leadership, 30% milestone posts, 30% hiring/talent insights

### Account 4: LinkedIn — Company Page (Adventurers Guild)
**URL**: https://www.linkedin.com/company/108034419/
**Voice**: Product/company page. Feature-focused, credibility-building.
**Audience**: Companies considering AG, developers evaluating platforms
**Content ratio**: 50% product updates, 30% case studies/testimonials, 20% industry data

---

## Weekly Posting Schedule

| Day | X Personal | X Project | LinkedIn Personal | LinkedIn Project |
|-----|-----------|-----------|-------------------|-----------------|
| **Mon** | Build log thread | Quest of the week | — | Product update |
| **Tue** | — | Dev tip/resource | Thought leadership | — |
| **Wed** | Technical deep dive | — | — | Feature spotlight |
| **Thu** | — | Adventurer highlight | — | — |
| **Fri** | Reflection/numbers | Community call-out | Milestone/data post | — |
| **Sat** | — | — | — | — |
| **Sun** | Week preview | — | — | — |

**Total**: 10 posts/week across 4 accounts (manageable with automation)

---

## Content Templates for Claude Cowork Automation

### Template 1: X Personal — Build Log (Monday)
```
Prompt: Write a build-in-public X thread (4-6 tweets) about this week's progress on Adventurers Guild.

Context:
- What was built: [insert features/fixes]
- Key numbers: [users, quests completed, PRs merged]
- Technical decisions made: [insert]
- What's next: [insert]

Tone: Honest, technical, first-person. No corporate speak. Use "I" not "we".
Include 1 screenshot placeholder.
End with: what should I build next? (engagement hook)
```

### Template 2: X Project — Quest of the Week (Monday)
```
Prompt: Write a single tweet announcing this week's featured quest on Adventurers Guild.

Context:
- Quest title: [insert]
- Difficulty: [F/E/D/C/B/A/S]
- Reward: [XP + optional $]
- Skills: [insert]
- Link: adventurersguild.space

Tone: Game-themed, exciting. Use guild terminology (quest, adventurer, rank).
Format: Short, punchy. Emoji OK (sword, shield, scroll).
```

### Template 3: LinkedIn Personal — Thought Leadership (Tuesday)
```
Prompt: Write a LinkedIn post about [topic] related to the developer hiring market.

Topics rotation:
- Week 1: Junior developer hiring crisis (78% Big Tech collapse)
- Week 2: Why portfolios beat resumes
- Week 3: AI-assisted development is the new baseline
- Week 4: The credential gap — what replaces the CS degree?

Tone: Professional but not stuffy. Data-backed. Personal anecdote if relevant.
Length: 150-200 words. No hashtag spam (max 3).
End with: question to drive comments.
```

### Template 4: X Project — Adventurer Highlight (Thursday)
```
Prompt: Write a tweet highlighting a contributor or adventurer on the platform.

Context:
- Who: [name/handle]
- What they did: [PR merged, quest completed, rank-up]
- Impact: [what it means for the platform]

Tone: Celebratory, community-focused. Tag the person.
```

### Template 5: LinkedIn Project — Feature Spotlight (Wednesday)
```
Prompt: Write a LinkedIn post showcasing a specific AG feature.

Feature rotation:
- Week 1: Rank system (F→S progression with real work)
- Week 2: Party/Squad system (team-based quest delivery)
- Week 3: QA Mediation (admin review layer for quality)
- Week 4: Guild Card (coming soon — verifiable credential)

Tone: Product-focused, benefit-driven. "Here's what this means for you."
Include: screenshot/mockup placeholder.
Length: 100-150 words.
```

---

## Automation Workflow with Claude Cowork

### Weekly Prep (Sunday evening, 30 min)

1. **Input week's data**: What was built, key numbers, notable events
2. **Generate all 10 posts** using templates above
3. **Review and edit** — personal touch on personal accounts
4. **Schedule** using Buffer/Typefully/manual scheduling
5. **Queue engagement responses** — prepare replies for likely comments

### Daily (5 min)

1. Check notifications on all 4 accounts
2. Reply to comments/DMs (prioritize: companies > developers > general)
3. Engage with 2-3 relevant posts from others (retweet with comment)

### Automation Script Structure

```
Input: weekly_context.json
{
  "week_number": 1,
  "features_shipped": ["Party System", "QA Mediation", "Claim Quest bug fix"],
  "prs_merged": 3,
  "contributors_active": ["Adil2009700", "aryansondharva"],
  "quests_completed": 5,
  "new_users": 12,
  "featured_quest": { "title": "...", "difficulty": "D", "reward": "500 XP" },
  "highlight_person": { "name": "Adil", "handle": "@Adil2009700", "achievement": "54-file mobile UX rewrite" },
  "thought_leadership_topic": "junior_hiring_crisis",
  "feature_spotlight": "rank_system"
}

Output: 10 post drafts with platform labels
```

---

## Content Pillars by Platform

### X (Both Accounts)
1. **Build in Public** — Show the process, not just the result
2. **Dev Career** — Position AG as the answer to "how do I get experience?"
3. **Community** — Highlight contributors, celebrate rank-ups
4. **Industry Takes** — Comment on dev hiring, freelancing, AI trends
5. **Product** — New features, quest announcements, milestones

### LinkedIn (Both Accounts)
1. **Thought Leadership** — Data-backed takes on dev hiring market
2. **Milestones** — "We hit X users / Y quests / Z completions"
3. **Talent Signal** — "What if rank told you more than a resume?"
4. **Bootcamp Pipeline** — Document the Open Paws bootcamp journey
5. **Case Studies** — (Future) Real companies that hired AG-ranked devs

---

## Key Hashtags

**X**: #buildinpublic #devtools #webdev #nextjs #opensourceindia #freelancedev #100DaysOfCode
**LinkedIn**: #developertools #futureofwork #edtech #startupindia #remotework #hiringtrends

---

## Engagement Strategy

### Who to Engage With (Build Relationships)
- **Indian dev Twitter**: @AkshatShrivasta, @gaborcselle, Indian YC founders
- **Build in public community**: @levelsio, @marclouvion, @tdinh_me
- **EdTech/HR**: @TalentBoard, Indian HR influencers
- **Dev communities**: @hashaborad, @ThePracticalDev, @IndieHackers

### Response Templates
**For "what is this?"**: "AG is where developers complete real coding quests, earn XP, rank up (F→S), and build a verified credential. Think Upwork meets RPG progression. Try it: adventurersguild.space"

**For "how is this different from X?"**: "Unlike [platform], AG rank is earned through verified, QA-reviewed work — not self-reported skills. Your Guild Card shows every quest you completed, your quality scores, and your progression. It's a credential, not just a profile."

**For companies asking**: "Post a task on AG and a ranked developer delivers it. You only pay if you approve. No upfront cost during beta. Want to try with one task?"

---

## Month 1 Goals

| Metric | Target |
|--------|--------|
| X Personal followers | +200 |
| X Project followers | +100 |
| LinkedIn Personal connections | +50 relevant |
| LinkedIn Project page followers | +30 |
| Impressions (total, all 4) | 50,000 |
| DMs from potential companies | 3 |
| DMs from potential adventurers | 10 |
| Blog article views (Dev.to) | 1,000 |

---

## Current Platform State (For Content Accuracy)

Use these REAL numbers. Do NOT inflate.

```json
{
  "real_users": 14,
  "seed_data": "REMOVED — clean DB",
  "real_quests": 14,
  "quest_sources": ["AG Platform (8)", "Knight Medicare (4)", "Project Chimera (2)"],
  "features_live": [
    "Guild Card — public adventurer profile at /adventurer/[username] with OG image",
    "Quest board with 14 real quests across frontend, backend, AI/ML",
    "Squad/Party System — teams of 3-5 for collaborative quests",
    "Admin QA Mediation — review layer before client sees deliverables",
    "F→S rank progression with XP engine",
    "Two-track architecture (OPEN/INTERN/BOOTCAMP)",
    "Session management with auto-refresh"
  ],
  "contributors": ["Adil2009700 (active)", "aryansondharva (new)", "abhiavi (new fork)", "25+ GSSoC alumni"],
  "github_stats": {
    "stars": "check current",
    "forks": "27+",
    "issues_open": 15,
    "discussions": 12,
    "prs_merged": "60+",
    "commits": "180+"
  },
  "tech_stack": "Next.js 15, TypeScript, Prisma 6, Neon PostgreSQL, NextAuth v4, Tailwind CSS",
  "deployment": "Vercel — adventurersguild.space",
  "license": "MIT",
  "key_differentiator": "Rank earned through QA-reviewed real work, not self-reported skills. Guild Card = verifiable credential."
}
```

---

## Content Weeks (Updated March 26, 2026)

### Week 1 — "Guild Card is Live" (Use Immediately)

**Monday — X Personal (Build Log Thread)**
```
I just shipped the Guild Card for Adventurers Guild.

It's a public, shareable developer credential:
→ Your rank (F through S, earned through real work)
→ Every quest you've completed
→ Skills verified by QA review
→ Quality scores

Share it on your resume. Put it in your LinkedIn bio. Send it to recruiters.

The link generates an OG image automatically — so when you share it on X or LinkedIn, it shows your rank, XP, and quest count as a card.

This is what "verified developer credential" looks like.

adventurersguild.space/adventurer/[your-username]
```

**Monday — X Project**
```
Guild Card is LIVE.

Your developer credential — rank, quests completed, skills — all on one shareable page.

Rank up from F to S through real coding quests.
Every delivery reviewed. Every rank earned.

Claim your Guild Card: adventurersguild.space

#devtools #buildinpublic
```

**Tuesday — LinkedIn Personal**
```
Big Tech slashed entry-level hiring by 78% since 2019.

Replit just shut down their coding Bounties program. Bootcamp credibility is declining.

The question every junior developer faces: how do I prove I can ship?

We just launched the Guild Card on Adventurers Guild — a public, verifiable developer credential.

Unlike a resume or LinkedIn profile, your Guild Card shows:
- Rank earned through QA-reviewed deliverables (not self-reported)
- Every quest completed with quality scores
- Skills demonstrated in real projects

We're about to onboard 50 bootcamp students in May. They'll rank up through real client work. Their Guild Cards will be the proof.

Would you trust a developer's Guild Card more than a traditional resume? Curious what hiring managers think.

#futureofwork #developertools #startupindia
```

**Wednesday — LinkedIn Company Page**
```
Introducing: The Guild Card

Every adventurer on our platform now has a public credential page — their Guild Card.

What it shows:
→ Rank (F through S, earned through real work)
→ Completed quests with quality scores
→ Verified skills demonstrated in actual projects

What it means for companies:
When you see a C-Rank developer, you know they've delivered 15+ QA-reviewed projects. No guessing. No interviewing for basic competence.

What it means for developers:
Your rank follows you. Share it on LinkedIn. Put it in job applications. It's a credential that's earned, not claimed.

14 real quests are live on the board right now — from AI therapy chatbots to developer dashboard UIs.

adventurersguild.space

#developertools #hiringtrends #credential
```

**Thursday — X Project (Adventurer Highlight)**
```
Shoutout to @Adil2009700.

This week he shipped a 54-file PR that:
→ Rewrote the mobile UX across 15+ dashboard pages
→ Built the useApiFetch hook (eliminated 500 lines of boilerplate)
→ Decomposed a 786-line component into 6 focused modules
→ Added API budget tracking for the admin panel

This is what consistent B-rank contribution looks like.

Adventurers Guild — where your code speaks for itself.
```

**Friday — X Personal**
```
Week 1 stats for Adventurers Guild:

14 real quests live (0 fake data — we purged all seed data)
3 external projects posting quests
2 active contributors + 2 new forks
Guild Card launched — shareable dev credential
Session expiry bug found and fixed (5 root causes)
25 code reviews submitted

Next week: landing page redesign + analytics dashboard.

The quest board is open. Your first quest is waiting.
adventurersguild.space
```

### Week 2 — "Real Quests from Real Projects"

**Monday — X Personal**
```
Something I'm proud of with Adventurers Guild:

Every quest on our board comes from a real project.

→ Knight Medicare — AI therapy chat UI, crisis detection, psychologist dashboards
→ Project Chimera — emotion detection ML pipeline, consciousness feedback loop
→ AG Platform — Guild Card, analytics, party system UI

No toy problems. No "build a todo app."

Real code. Real clients. Real credential.
```

**Tuesday — LinkedIn Personal**
```
Replit raised $100M+ and still couldn't make coding bounties work. They shut down the program in 2025.

The problem: quality control at scale. Too many low-quality submissions gaming the system. Companies didn't come back.

Here's what we're doing differently with Adventurers Guild:

1. Every submission goes through QA review before the client sees it
2. Rank is earned through verified deliverables, not volume
3. The Guild Card makes rank visible and verifiable externally
4. Companies post real tasks (not hypothetical challenges)

The credential IS the moat. An S-Rank adventurer is a known quantity.

Early days — 14 real quests live, bootcamp cohort starting May. But the architecture is built for this exact problem.

What do you think separates successful developer marketplaces from failed ones?

#startups #developertools #futureofwork
```

**Wednesday — LinkedIn Company Page**
```
14 real quests are live on Adventurers Guild.

Not tutorial exercises. Real tasks from real projects:

AI/ML:
→ Local emotion detection — HuggingFace integration (D-rank)
→ Consciousness feedback loop — Meta-awareness for AI therapy (B-rank)

Frontend:
→ AI Therapy Chat UI — Real-time session interface (D-rank)
→ Crisis Detection UI — Emergency alert system (C-rank)
→ Psychologist Earnings Dashboard (D-rank)

Platform:
→ Admin Analytics Dashboard — DAU, completion rates, charts (D-rank)
→ Quest Board Filters — Search, sort, difficulty filter (F-rank)
→ Quest Streak System — XP multipliers for retention (E-rank)

Difficulty ranges from F-rank (2 hours) to B-rank (2-4 days).

Register and claim your first quest: adventurersguild.space

#coding #opensourceindia #developertools
```

### Week 3 — "The Credential Engine"

**Monday — X Personal**
```
Hot take: Adventurers Guild is not a freelancing platform.

It's a credentialing engine.

The marketplace (quest posting, quest completion, payments) is the mechanism.

The product is the CREDENTIAL — a verified, public record that you can ship.

That's why the Guild Card matters more than the payment pipe.

If your AG rank gets you hired without a technical interview — we win.
```

**Tuesday — LinkedIn Personal**
```
The junior developer credential gap is real.

CS degrees prove you attended class. LeetCode proves you can solve puzzles. GitHub shows you committed code.

None of these prove you can:
- Take a spec from a real client
- Deliver working code under deadline
- Pass QA review
- Iterate based on feedback
- Ship to production

That's what Adventurers Guild measures.

Every quest completed on AG is a verified work sample. Every rank-up is a proven milestone. The Guild Card is the portable proof.

We're building the credentialing layer that the developer hiring market is missing.

#hiringtrends #futureofwork #edtech
```

---

## Replit Bounties — Ready-to-Post Thread (Use When Timely)

```
Thread: Why Replit Bounties failed, and what developer marketplaces get wrong.

1/ Replit raised $100M+, had millions of users, and still couldn't make coding bounties work. They shut it down and moved everything to Contra.

2/ The problem wasn't distribution. They had massive reach. The problem was:
- Quality control at scale was unsolvable
- Companies didn't come back after bad experiences
- No trust signal for developer quality

3/ The pattern is the same across every failed dev marketplace: high volume of low-quality submissions → client trust erosion → marketplace death spiral.

4/ What's different about our approach with Adventurers Guild:

Every submission passes through QA BEFORE the client sees it. Bad work never reaches the customer.

5/ Rank is earned through verified deliverables. An S-Rank adventurer has 100+ reviewed completions. You can verify this on their Guild Card — a public, shareable credential page.

6/ Companies post real tasks from real projects. Not hypothetical challenges. Not "build me a website for $50."

14 quests live right now from 3 different projects (AI therapy, emotion detection, developer tools).

7/ The credential IS the moat. Contra charges 0% commission. We charge 15%. But Contra profiles are self-reported. AG rank is verified.

Would you pay 15% for a developer whose quality is guaranteed, or pay 0% and gamble?

8/ Early days. 14 real quests. 14 real users. But the architecture is built for the exact failure mode that killed Replit Bounties.

Try it: adventurersguild.space
```
