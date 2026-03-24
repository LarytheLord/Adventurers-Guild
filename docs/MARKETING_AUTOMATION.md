# Marketing Automation Plan — 4 Accounts

> Updated: 2026-03-23
> Accounts: X (personal @LarytheLord + project @AG), LinkedIn (personal + project page)
> Automation: Claude Cowork for drafting + scheduling

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

### Account 4: LinkedIn — Project Page (Adventurers Guild)
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

## First Week Content (Ready to Post)

### Monday — X Personal (Build Log Thread)
```
Week 1 of building Adventurers Guild in public.

This week we shipped:
→ Squad/Party System — teams of 3-5 can now quest together
→ Admin QA Mediation — every submission reviewed before client sees it
→ Fixed a "Claim Quest" bug that was silently failing

54 files changed. 8500+ lines. 4 API bugs caught in a full codebase audit.

Next up: the Guild Card — your public, verifiable developer credential.

If your AG rank could replace a tech interview, would you grind for it?
```

### Monday — X Project (Quest of the Week)
```
⚔️ Quest of the Week

Looking for your first quest? We've got F-rank tasks perfect for getting started.

Claim a quest → Complete it → Earn XP → Rank up

Your journey from F-Rank to S-Rank starts with one quest.

adventurersguild.space
```

### Tuesday — LinkedIn Personal (Thought Leadership)
```
Big Tech slashed entry-level hiring by 78% since 2019.

Bootcamps are losing credibility. Degrees alone don't cut it anymore.

What employers actually want: proof you can ship. Deployed apps. Meaningful PRs. Real work.

That's why I'm building Adventurers Guild — a platform where developers earn a verified rank by completing real coding quests for real companies.

Your rank isn't self-reported. It's earned through QA-reviewed deliverables.

The question isn't "can this replace a CS degree?" — it's "can verified work history become the new hiring signal?"

We're about to find out. 50 bootcamp students start in May.

What would you trust more in a candidate: a degree, or 30 completed and reviewed coding deliverables?

#futureofwork #developertools #startupindia
```

### Wednesday — LinkedIn Project (Feature Spotlight)
```
Introducing the Rank System ⚔️

On Adventurers Guild, every developer starts at F-Rank and climbs through real work:

F → E → D → C → B → A → S

Each rank is earned by completing quests reviewed by QA. No shortcuts. No self-reporting.

What this means for companies: when you see a B-Rank developer, you know they've delivered 30+ verified projects.

What this means for developers: your rank is a credential that follows you. Shareable. Verifiable. Meaningful.

Coming soon: the Guild Card — your public developer credential page.

#developertools #hiringtrends
```
