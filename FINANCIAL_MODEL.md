# Adventurers Guild — Financial Model

> A sustainable revenue model for a gamified developer marketplace.

---

## 1. What We Are

A two-sided marketplace where **companies post real coding tasks (quests)** and **developers (adventurers) complete them for pay and XP**. The gamification layer (F-to-S ranking, XP, streaks) creates retention and a verifiable skill signal that neither Upwork nor Fiverr have.

**Our moat**: Rank = trust. An A-rank adventurer is a vetted, proven developer. Companies pay for that certainty. Adventurers grind for that status. The longer someone stays on the platform, the more valuable their rank becomes — to them and to companies hiring them.

---

## 2. Revenue Streams

### Stream 1: Quest Service Fee (Primary — ~70% of revenue)

| Detail | Value |
|--------|-------|
| Fee structure | **15% service fee charged to the company** on top of the quest reward |
| Adventurer receives | 100% of the posted reward (no deductions) |
| Example | Company posts quest at $400 → pays $460 → Adventurer gets $400, platform keeps $60 |
| Why charge companies | Companies have budgets. Adventurers are price-sensitive freelancers. Charging the demand side (companies) keeps supply (developers) happy and growing. |

**Rationale**: This is the marketplace standard (Upwork charges 10% to clients + 10-20% to freelancers; we only charge one side). Charging 0% to adventurers is a competitive advantage that drives developer acquisition.

**Projected take rate**: 15% → can decrease to 12% for high-volume enterprise clients as a retention incentive.

### Stream 2: Company Subscription Plans (~20% of revenue)

| Plan | Price | Includes |
|------|-------|----------|
| **Starter** (Free) | $0/mo | 3 quests/month, standard matching, community support |
| **Guild Partner** | $149/mo | Unlimited quests, priority adventurer matching, quest analytics dashboard, featured company badge, email support |
| **Enterprise** | $499/mo | Everything in Partner + custom SLAs, API access for bulk quest posting, dedicated account manager, white-label option, priority dispute resolution |

**Why subscriptions work**: Companies that post regularly (agencies, startups with ongoing dev needs) will pay for unlimited quests because the per-quest service fee alone on 10+ quests/month exceeds $149. The subscription bundles convenience.

### Stream 3: Quest Boost (~5% of revenue)

| Feature | Price |
|---------|-------|
| **Featured Quest** | $29 for 7 days — highlighted in quest board, shown first, orange border, "Featured" badge |
| **Urgent Quest** | $49 for 3 days — pushed to top + notification sent to qualified adventurers |

Low-friction upsell at the moment companies are already engaged (posting a quest).

### Stream 4: Talent Pipeline (Phase 3+ — future upside)

| Feature | Price |
|---------|-------|
| **Direct Hire Offer** | 10% of annual salary as placement fee |
| **Talent Search** | $299/mo — browse ranked adventurer profiles, filter by skills/rank/completion rate, send interview requests |

This is where the real long-term money is. Every quest completion is a work sample. Every rank-up is a verified credential. Companies will eventually want to hire B/A/S-rank adventurers full-time. This is the LinkedIn Recruiter model built on top of actual proof-of-work.

---

## 3. Cost Structure

### Fixed Costs (Monthly)

| Item | Early Stage (Mo 1-6) | Growth (Mo 7-18) | Scale (Mo 18+) |
|------|----------------------|-------------------|-----------------|
| Hosting (Vercel Pro) | $20 | $76 | $150 |
| Database (Neon) | $19 | $69 | $149 |
| Domain + Email (Google Workspace) | $15 | $15 | $30 |
| Stripe subscription (Platform) | $0 | $0 | $0 |
| Customer support | $0 (founder) | $1,500 (part-time) | $4,000 (full-time) |
| Marketing/ads | $200 | $1,500 | $4,000 |
| Legal/compliance | $0 | $200 | $500 |
| **Total fixed** | **~$254/mo** | **~$3,360/mo** | **~$8,829/mo** |

### Variable Costs (Per Transaction)

| Item | Rate |
|------|------|
| Stripe processing fee | 2.9% + $0.30 per charge |
| Stripe Connect payout fee | $0.25 per payout (to adventurer bank account) |
| Dispute/chargeback reserve | ~0.5% of GMV (provisioned) |

### Example: Per-Quest Unit Economics

| Metric | Value |
|--------|-------|
| Average quest reward | $350 |
| Company pays (15% fee) | $402.50 |
| **Platform gross revenue** | **$52.50** |
| Stripe fee on $402.50 | -$11.97 |
| Stripe payout fee | -$0.25 |
| Dispute reserve (0.5%) | -$2.01 |
| **Net revenue per quest** | **$38.27** |

---

## 4. Unit Economics Summary

| Metric | Value |
|--------|-------|
| Average quest value (GMV) | $350 |
| Platform take rate | 15% |
| Gross revenue per quest | $52.50 |
| Net revenue per quest (after Stripe) | ~$38 |
| Early-stage monthly fixed costs | ~$254 |
| **Break-even quests/month** | **~7 quests** |
| Growth-stage monthly fixed costs | ~$3,360 |
| **Break-even quests/month (growth)** | **~88 quests** |

---

## 5. Growth Projections

### Assumptions
- Average quest value grows from $250 (early, simpler tasks) to $450 (matured, higher-rank quests)
- Quest volume grows as both sides of marketplace scale
- Subscription revenue kicks in at Month 7+
- Churn: 5% monthly for adventurers, 8% monthly for companies (marketplace average)

### Monthly Projections

| Month | Active Adventurers | Active Companies | Quests/Mo | Avg Quest $ | Quest Fee Rev | Subscription Rev | Boost Rev | Total Rev | Fixed Costs | Net |
|-------|-------------------|-----------------|-----------|-------------|---------------|-----------------|-----------|-----------|-------------|-----|
| 1-3 | 30 | 5 | 8 | $250 | $300 | $0 | $0 | $300 | $254 | **+$46** |
| 4-6 | 80 | 12 | 25 | $280 | $1,050 | $0 | $100 | $1,150 | $254 | **+$896** |
| 7-9 | 150 | 25 | 60 | $320 | $2,880 | $600 | $200 | $3,680 | $2,500 | **+$1,180** |
| 10-12 | 300 | 45 | 120 | $350 | $6,300 | $1,500 | $400 | $8,200 | $3,360 | **+$4,840** |
| 13-18 | 600 | 80 | 250 | $380 | $14,250 | $3,500 | $700 | $18,450 | $5,500 | **+$12,950** |
| 19-24 | 1,200 | 150 | 500 | $420 | $31,500 | $7,000 | $1,200 | $39,700 | $8,829 | **+$30,871** |

### Annual Summary

| Year | GMV | Platform Revenue | Costs | Net Profit |
|------|-----|-----------------|-------|------------|
| **Year 1** | ~$640,000 | ~$110,000 | ~$35,000 | ~$75,000 |
| **Year 2** | ~$3,500,000 | ~$570,000 | ~$95,000 | ~$475,000 |

---

## 6. Key Metrics to Track (KPIs)

### Marketplace Health
| Metric | Definition | Target |
|--------|-----------|--------|
| **GMV** (Gross Merchandise Value) | Total quest payments through platform | Growing month-over-month |
| **Take rate** | Platform revenue / GMV | 15% (stable) |
| **Quest fill rate** | % of posted quests that get completed | >70% |
| **Time to first applicant** | Hours from quest posting to first application | <24 hours |
| **Time to completion** | Days from assignment to delivery | <deadline |

### Supply Side (Adventurers)
| Metric | Definition | Target |
|--------|-----------|--------|
| **MAU** | Monthly active adventurers | Growing |
| **Quest completion rate** | Completions / assignments | >80% |
| **Rank-up rate** | % of users who rank up within 90 days | >30% |
| **30-day retention** | % active after 30 days | >50% |
| **90-day retention** | % active after 90 days | >30% |

### Demand Side (Companies)
| Metric | Definition | Target |
|--------|-----------|--------|
| **Repeat post rate** | % of companies posting again within 60 days | >60% |
| **Avg quests per company/month** | Quest posting frequency | 3+ |
| **NPS** | Net Promoter Score | >40 |
| **Subscription conversion** | Free → paid plan conversion | >15% of active companies |

### Financial
| Metric | Definition | Target |
|--------|-----------|--------|
| **CAC** (Customer Acquisition Cost) | Marketing spend / new users | <$20 adventurer, <$100 company |
| **LTV** (Lifetime Value) | Revenue per user over lifetime | >10x CAC |
| **Gross margin** | (Revenue - variable costs) / Revenue | >70% |
| **Burn rate** | Monthly cash outflow | Decreasing relative to revenue |

---

## 7. Pricing Strategy by Phase

### Phase 1: Bootstrap (Month 1-6) — "Free & Growing"
- **No service fees** on quests
- **No subscriptions**
- Goal: Get first 50 adventurers and 10 companies actively using the platform
- Revenue: $0 (intentional — building liquidity)
- Fund operations from savings/pre-seed (~$1,500 total)
- Signal: "Early adopter" badge for companies who join now

### Phase 2: Light Monetization (Month 7-12) — "Earning Trust"
- **Introduce 10% service fee** on quests (lower than competitors)
- Launch **Guild Partner** subscription ($149/mo)
- Launch **Featured Quest** boost ($29)
- Messaging: "We only make money when you do"
- Goal: 60+ quests/month, positive unit economics

### Phase 3: Full Model (Month 13-24) — "Scaling"
- **Increase service fee to 15%** (still competitive vs Upwork's 20-30%)
- Launch **Enterprise** plan ($499/mo)
- Launch **Urgent Quest** boost ($49)
- Begin building **Talent Pipeline** features
- Goal: 250+ quests/month, $15k+ MRR

### Phase 4: Expansion (Month 24+) — "Platform"
- Launch **Talent Search** ($299/mo) and **Direct Hire** (10% placement)
- Explore adjacent verticals: design quests, DevOps quests, security audits
- Consider **Adventurer Pro** optional subscription ($9.99/mo — early quest access, detailed analytics, profile customization)
- International expansion (INR pricing, regional payment methods)

---

## 8. Competitive Positioning

| Platform | Dev Fee | Client Fee | Our Advantage |
|----------|---------|-----------|---------------|
| **Upwork** | 10-20% | 5-10% | We charge 0% to devs. Gamification drives retention. |
| **Fiverr** | 20% | 5.5% | We charge 0% to devs. Task-based, not gig-based. |
| **Toptal** | ~0% (absorbed) | 50-100% markup | We're accessible to all skill levels, not just "top 3%". |
| **Adventurers Guild** | **0%** | **15%** | Rank system = verifiable trust. Devs keep 100%. |

**Why we win**: Developers choose us because they keep every dollar. Companies choose us because ranked developers are pre-vetted through actual work, not interviews.

---

## 9. Risk Factors & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Cold start problem** (no quests → no devs → no quests) | Fatal if not solved | Seed with 5-10 partner companies pre-launch. Offer first 3 months free. |
| **Quality control** (low-rank devs deliver bad code) | Companies leave | Mandatory code review before delivery. Quality scores affect rank. Rework/reject flow already built. |
| **Payment disputes** | Trust erosion | Escrow model (hold payment until delivery approved). Already have approval flow in codebase. |
| **Disintermediation** (company hires dev directly, skipping platform) | Revenue loss | Non-compete clauses in ToS. Make platform so valuable (XP, rank, portfolio) that devs WANT to stay. Talent Pipeline gives a legitimate off-ramp. |
| **Competitor enters with lower fees** | Margin pressure | The rank system is our moat — it takes months to build. Switching cost is high for ranked adventurers. |
| **Seasonal demand swings** | Revenue volatility | Diversify company verticals. Offer "Season" events with bonus XP to drive activity in slow months. |

---

## 10. What Needs to Be Built (Technical)

To implement this financial model, the platform needs these features added:

### Immediate (Phase 1-2)
1. **Stripe Connect integration** — Replace simulated payments with real Stripe Connect (Standard or Express accounts for adventurers)
2. **Service fee calculation** — Add `platformFee` field to Transaction model; compute and display fee at quest creation
3. **Escrow flow** — Hold company payment on quest acceptance; release to adventurer on approval
4. **Company billing page** — Show service fee breakdown, invoices, payment history

### Growth (Phase 2-3)
5. **Subscription model** — Stripe Billing for company plans (Starter/Partner/Enterprise)
6. **Quest boost feature** — "Featured" and "Urgent" paid placements with Stripe Checkout
7. **Usage limits** — Enforce 3 quests/month cap for free-tier companies
8. **Admin revenue dashboard** — GMV, take rate, MRR, active users, quest fill rate

### Scale (Phase 3-4)
9. **Talent Search** — Browsable adventurer directory filtered by rank/skills/completion rate
10. **Direct Hire flow** — Offer mechanism, placement fee tracking, contract generation
11. **Adventurer Pro subscription** — Optional premium tier with early access and analytics
12. **International pricing** — Multi-currency support, regional payment methods (UPI for India)

---

## 11. Why This Is Sustainable

1. **Zero marginal cost**: Each additional quest costs us nothing beyond Stripe fees. Software scales.
2. **Network effects**: More adventurers → faster quest completion → more companies → more quests → more adventurers.
3. **Increasing switching costs**: The longer an adventurer stays, the harder it is to leave (rank, XP, portfolio, reputation).
4. **Multiple revenue streams**: Not dependent on a single income source. Commission + subscriptions + boosts + talent pipeline.
5. **Low break-even**: Only ~7 quests/month at early stage. Achievable within Month 1-2.
6. **Aligned incentives**: Platform only earns when companies get value (quest completed). No rent-seeking.

---

*Last updated: 2026-03-11*
