# Adventurers Guild — Q2 2026 Roadmap

> Updated: 2026-03-21
> Strategy: **Credential Engine first, Marketplace second**
> Hard deadline: Intern onboarding May 2026

---

## Strategic Context

AG's moat is not the marketplace. It's the **credential**. The Guild Card — a verifiable public profile showing rank, completed quests, quality scores, and skills — is what makes AG rank valuable to employers. Everything we build should make the credential more trusted, more visible, and more useful.

**Sequence**: Credential → Recognition → Marketplace flywheel

---

## Work Distribution

| Owner | Focus | Issues |
|-------|-------|--------|
| **Abid (core)** | Architecture, Guild Card API, bootcamp pipeline, payments, outreach | #134 API, schema work |
| **Adil** | Mobile UX, dashboard polish, useApiFetch migration | PR #131, ongoing UI |
| **New contributors** | Feature issues with full specs | #134 UI, #135, #136, #137, #138 |
| **Junior dev** | Stripe Connect, Event Audit Trail | #106, #108 |

---

## Phase 2 Status (Target: April 13)

| Task | Status | Owner |
|------|--------|-------|
| 2.A Squad/Party System — Schema + API | ✅ Done | Abid |
| 2.B Admin QA Mediation Layer | ✅ Done | Abid |
| 2.C Stripe Connect — Payout Onboarding | ⏳ Open (#106) | Junior dev |
| 2.D API Key Budget Tracking | 🔨 PR #131 | Adil |
| 2.E **Claim Quest Bug Fix** | ✅ Done | Abid |
| 2.F **Status propagation (7 code paths)** | ✅ Done | Abid |

---

## Phase 2.5: Credential System (NEW — Target: April 7)

This is the new priority phase inserted before Phase 3. Without this, rank is invisible outside the platform.

### Task 2.5.A: Guild Card — Public Adventurer Profile ⭐ TOP PRIORITY

**GitHub issue**: #134
**Why first**: Without a public credential, AG rank means nothing externally. This is the single feature that turns AG from "a platform" into "a credential."

**Scope**:
- Public page at `/adventurer/[username]`
- API at `/api/adventurer/[username]` (no auth required)
- OG image at `/api/og/adventurer/[username]` (for LinkedIn/X sharing)
- Shows: rank badge, XP, skills, completed quest history, quality scores
- Does NOT expose: email, in-progress work, internal notes

**Owner**: Abid (API + schema) + contributor (UI)

### Task 2.5.B: Admin Analytics Dashboard

**GitHub issue**: #135
**Why now**: We have zero visibility into platform health. Need DAU, quest completion rate, rank distribution before bootcamp launch.

**Scope**:
- API at `/api/admin/analytics`
- Page at `/admin/analytics` with recharts
- Metrics: DAU/WAU/MAU, quest completion rate, avg time-to-complete, rank distribution, quests by track

**Owner**: Contributor

### Task 2.5.C: Quest Streak System

**GitHub issue**: #136
**Why now**: Retention mechanic needed before bootcamp cohort arrives. Must be in place when 50 students start.

**Scope**:
- Schema: streak fields on AdventurerProfile
- Logic: `lib/streak-utils.ts` called after quest completion
- XP multiplier: 1.0x → 2.0x based on streak length
- Dashboard display: streak count + multiplier badge

**Owner**: Contributor

---

## Phase 3: Platform Polish + Scale (Target: May 11)

| Task | Issue | Priority | Owner |
|------|-------|----------|-------|
| Party Panel UI | #137 | High | Contributor |
| Quest Board Filters | #138 | High | Contributor |
| Squad-Aware Quest Board | #111 | Medium | Contributor |
| Hackathon → Quest Pipeline | #110 | Medium | Abid |
| Admin Revenue Dashboard | #109 | Medium | Junior dev |
| Event Audit Trail | #108 | Medium | Junior dev |

---

## Phase 4: Go-to-Market (May-July — concurrent with bootcamp)

### What We Build
- [ ] Stripe Connect real payments (intern track)
- [ ] Company onboarding flow (guided quest posting)
- [ ] Employer talent search (browse ranked adventurers)
- [ ] Guild Card verification API (employers can verify rank programmatically)

### What We Do (Non-Code)
- [ ] Run bootcamp cohort through full lifecycle
- [ ] Document completion rates, quality metrics, time-to-complete
- [ ] Get 3 external companies to post quests
- [ ] Get 1 hire based on AG rank
- [ ] Write the investor one-pager with real data

---

## Key Milestones

| Date | Milestone | Success Criteria |
|------|-----------|-----------------|
| **Mar 28** | Guild Card v1 live | Public profile page works, OG tags render |
| **Apr 7** | Analytics + Streaks live | Admin can see DAU, completion rates |
| **Apr 13** | Phase 2 complete | All Phase 2 tasks done, PR #131 merged |
| **Apr 20** | Bootcamp dry run | 5 test students complete full lifecycle |
| **May 1** | Platform ready for interns | All critical paths tested, payments working |
| **May 15** | Intern cohort starts | 20 interns onboarded, quests posted |
| **Jun 1** | First external company | 1 non-Open Paws company posts a paid quest |
| **Jul 15** | Bootcamp results | Completion rate, quality scores, hire outcomes documented |

---

## What NOT to Build Before May

- International expansion / multi-currency
- AI matching / recommendation engine
- Adventurer Pro subscription tier
- In-platform code review (GitHub is fine)
- DevSync integration
- Mobile app (responsive web is sufficient)

These are all good ideas. They're Phase 5+.
