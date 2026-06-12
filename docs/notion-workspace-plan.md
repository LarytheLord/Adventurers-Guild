# Guild × Notion Business — Workspace Plan

**Status:** Active — 3 months free of Notion Business + Notion AI (workspace: `ultra-allspice-76b`)  
**Approved:** 11 June 2026  
**Expires:** ~11 September 2026  
**Contact:** startups-help@makenotion.com

---

## What We Got

Notion Business Plan includes:
- **Notion AI** — inline writing, database autofill, summarise, draft generation
- **Custom Agents** — autonomous multi-step workflows that run on schedules or triggers
- **AI Meeting Notes** — auto-transcribe + summarise any meeting, generate action items
- **Enterprise Search** — search across Slack, Google Drive, GitHub simultaneously
- **Research Mode** — AI generates full reports from workspace data + external sources
- **Unlimited Charts** — bar, line, pie, table views on any database with filters
- **Free Consultant Call** — one session with a Notion Certified Consultant (coming via email)

---

## The 5 Things We Actually Build (Priority Order)

### 1. Company CRM — Ecosystem Manager Pipeline
**Why first:** The ecosystem manager is connecting us with companies NOW. We need to track every lead, their status, and who referred them before we lose track.

**What to build:**
- Database: `Company Pipeline` with properties: Company Name, Industry, Size, Referred By (ecosystem manager name), Status (Introduced → Free Trial → Active → Converted → Churned), First Quest Date, Quests Posted, Contact Email, Notes
- View 1: Kanban by Status (visual pipeline)
- View 2: Table filtered by Referred By = ecosystem manager name (show them their contribution)
- View 3: Gallery of active companies with quest counts
- **Notion AI autofill:** Auto-generate a one-line company summary from their website URL (paste URL → AI fills description field)
- Link to: Notion page `🏢 Company Pitch & Onboarding`

**Templates to duplicate from Notion Marketplace:**
- "Simple CRM" by Notion — clean kanban CRM, free, 5★
- "Startup CRM" by BearyGood — adds lead scoring, deal stages

---

### 2. Platform KPI Dashboard
**Why:** Right now stats live in your head and a few Notion pages. Investors, the ecosystem manager, and contributors need one URL that shows the platform is alive and growing.

**What to build:**
- Database: `Platform Metrics` — rows are weekly snapshots. Properties: Week, Total Users, Adventurers, Companies, Active Quests, Completed Quests, Total XP Distributed, Revenue (₹), New Signups This Week, Quests Posted This Week
- Charts (unlock with Business): line chart for user growth, bar chart for quests completed per week, KPI cards for current totals
- Auto-update: **Custom Agent** runs every Monday at 9am, queries the guild DB summary (via webhook to `/api/admin/overview`), and fills the new week's row
- Linked from: Main Dashboard page

**Current numbers to seed the dashboard with (as of June 10, 2026):**
- 106 total users, 92 adventurers, 17 quests, 4,600 XP distributed

---

### 3. OKR + Product Roadmap
**Why:** Right now the roadmap is in MEMORY.md and your head. As you onboard a co-founder, contributors, and a consultant, everyone needs a single written source of what we're building and why.

**What to build:**
- Page: `Q3 2026 OKRs` — 3 objectives max, 3 key results each. Format from YC OKR template.
- Database: `Product Roadmap` — properties: Feature, Status (Backlog/In Progress/Done/Cancelled), Priority (P0/P1/P2), GitHub PR/Issue link, Owner, Quarter, Impact (High/Medium/Low)
- View 1: Board by Quarter
- View 2: Board by Status (sprint board)
- View 3: Table filtered by Owner = you (your personal sprint view)
- Link: Pin to Main Dashboard

**Draft Q3 2026 Objectives (fill in with co-founder):**
1. **Grow to 500 adventurers** — KRs: VIT campaign completes, NSoC contributors merged, ecosystem manager closes 10 companies
2. **Zero broken flows** — KRs: 6 critical bugs from audit fixed, feedback button avg score > 4/5
3. **First paid company** — KRs: 3 companies complete a free quest, 1 converts to paid

---

### 4. Investor Update Template
**Why:** AWS Activate conversation is live. More will follow. You need a 1-page monthly investor update ready to send — shows traction even before you're raising.

**What to build:**
- Template page: `Monthly Investor Update — [Month Year]`
- Sections: Headline metrics (users, quests, XP, revenue), What we shipped (bullet list of PRs/features), What's working, What's not, Top 3 focus for next month, Ask (if any)
- AI Agent: On the 1st of each month, auto-populate the metrics section from Platform Metrics database, draft "What we shipped" from GitHub changelog (via connected GitHub integration), leave the rest for manual input
- First update due: 1 July 2026

**Base from:** YC Startup in a Box — investor update section (duplicate from Notion marketplace, look for "Y Combinator Startup in a Box" template)

---

### 5. Adventurer (Student) CRM
**Why:** When a company asks "can you find someone who can do X?", right now you have no answer. A student CRM lets you match companies to adventurers directly — this is the core value of a marketplace.

**What to build:**
- Database: `Adventurer Directory` — properties: Name, Rank (F/E/D/C/B/A/S), Skills (multi-select), University, Completed Quests (number), Guild Score (%), Specialisation (Content/Design/Dev/Research/Data/Marketing), Available (Yes/No), Link to Profile
- View 1: Gallery by Rank (visual leaderboard feel)
- View 2: Table filtered by Available=Yes (quick match view)
- View 3: Skills filter — type "React" and see all available devs
- Update frequency: weekly sync from platform DB (manual for now, agent later)
- **NOT the same as the public student-facing pages** — this is internal ops only

---

## Notion AI Automations to Set Up

### Custom Agents (activate in Settings → AI → Custom Agents)

| Agent | Trigger | What It Does |
|-------|---------|--------------|
| Weekly Stats Agent | Every Monday 9am | Fetches platform stats, fills new row in KPI Dashboard database |
| Monthly Update Agent | 1st of month | Auto-populates metrics in investor update template, drafts shipped features from changelog |
| New Company Summary | Database trigger: new row in Company Pipeline | Fetches company website (from URL property), fills Description field with AI-generated 1-liner |
| Quest Brief Polisher | Database trigger: new row in Quest Submissions staging | Rewrites vague quest descriptions into clear, specific briefs using Guild's writing formula |
| Bug Triage Agent | Weekly Thursday 5pm | Reads feedback form submissions (synced from platform), categorises into Bug/UX/Feature, creates prioritised list |

### AI Meeting Notes
Enable for all team syncs with co-founder. Outcome: every meeting has auto-generated:
- Summary (3 bullets)
- Decisions made
- Action items with owners
- Link automatically added to `🗺️ Roadmap & Priorities` page

---

## Templates to Duplicate This Week

All free from Notion Marketplace. Duplicate in this order:

1. **Simple CRM** (Notion official) → rename to "Company Pipeline"
2. **Y Combinator Startup in a Box** (YC × Notion) → extract: OKR tracker, investor update, sprint board
3. **Deel PR Planning Template** (from YC top-10 collection) → use for growth/marketing sprint
4. **Mixpanel Engineering Meeting Template** (from YC top-10) → use for weekly eng sync with contributors
5. **Company in a Box** (Notion official) → extract: employee handbook starter, policy docs

---

## Free Consultant Call — Prep Checklist

The call is coming via email. Before it arrives, prepare:

**What to ask them to set up:**
- [ ] Company Pipeline CRM with kanban + Notion AI autofill on the URL property
- [ ] KPI Dashboard with live charts connected to the metrics database
- [ ] Custom Agent: Weekly Stats auto-fill
- [ ] AI Meeting Notes connected to a recurring weekly calendar event
- [ ] Show us: how to connect GitHub integration so agent can pull merged PRs for investor update

**Do NOT use the call for:** Generic Notion tour, basic how-to questions, template browsing. Come with the 5 above, get them built.

---

## Perks Dealbook

Access via your workspace: Settings → Plans & Billing → Startup Perks (or the Perks Dealbook link from the email).

**What to look for in the dealbook:**
- AWS credits (you're already pursuing this via Activate — check if Notion has a separate track)
- Linear / GitHub / Figma / Loom / Stripe — tools Guild already uses or will use
- Resend / Postmark — email credits
- Intercom / Crisp — if you want a chat widget later
- Vercel / Railway — hosting credits

Note: Perks are first-come-first-served on many offers. Access the dealbook within the first week.

---

## 3-Month Timeline

### Month 1 (June 12 – July 11): Build the ops infrastructure
- [ ] Duplicate all 5 templates above
- [ ] Build Company Pipeline CRM — seed with ecosystem manager's first companies
- [ ] Build KPI Dashboard — seed with current numbers, set up weekly snapshot habit
- [ ] Set up AI Meeting Notes for all team syncs
- [ ] Book the Notion consultant call the moment the email arrives
- [ ] Access Perks Dealbook — claim relevant deals

### Month 2 (July 12 – Aug 11): Automate and scale
- [ ] Activate 3 Custom Agents (Stats, Company Summary, Meeting Notes)
- [ ] OKR + Roadmap live and updated weekly
- [ ] First Monthly Investor Update drafted and sent (to AWS contact at minimum)
- [ ] Adventurer Directory seeded with top 20 adventurers
- [ ] Bug Triage Agent reading from feedback button submissions

### Month 3 (Aug 12 – Sep 11): Evaluate and decide
- [ ] Assess: which Notion features are we actually using vs ignoring?
- [ ] Decide: upgrade to paid Business (₹1,650/member/month) or downgrade to Plus?
- [ ] If converting first paid company: Business plan pays for itself
- [ ] Export/document all templates before any potential downgrade

---

## What NOT to Do in Notion

- **Do not duplicate the public student onboarding page** — `🎓 For Students — Getting Started` is for students, don't clutter it with internal ops
- **Do not duplicate the company kit page** — `🏢 For Companies — Getting Started` is the public-facing kit, keep it clean
- **Do not over-automate before the flows work manually** — build manually for 2 weeks, then automate what you've proven you use
- **Do not invite the ecosystem manager to internal workspace pages** — create a separate shared page for them showing only: their referred companies pipeline view + platform stats

---

## Workspace Pages to Create/Update

| Page to Create | Parent | Purpose |
|---------------|--------|---------|
| Company Pipeline CRM | 🏢 Company Pitch & Onboarding | Ecosystem manager lead tracking |
| Platform KPI Dashboard | 📊 Live Platform Stats | Weekly metrics + charts |
| Q3 2026 OKRs | 🗺️ Roadmap & Priorities | Objectives and key results |
| Product Roadmap Database | 🗺️ Roadmap & Priorities | Feature backlog with GitHub links |
| Monthly Investor Update Template | 🧠 Strategy & Vision | Reusable investor update format |
| Adventurer Directory | 👥 Team, NSoC & Contributors | Internal student CRM |
| Ecosystem Manager Portal | 🏢 Company Pitch & Onboarding | Shared view for the ecosystem manager |

---

## References
- Notion for Startups: https://www.notion.com/startups
- YC Top 10 Templates: https://www.notion.com/templates/collections/top-10-yc-startup-templates
- Startup in a Box: https://www.notion.com/templates/startup-in-a-box
- All Startup Templates: https://www.notion.com/templates/category/startup
- Notion AI Features: https://www.notion.com/product/ai
- Help: startups-help@makenotion.com
