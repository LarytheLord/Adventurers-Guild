# Adventurers Guild - Mom Test Customer Discovery Audit

## Executive Takeaway

The conversation contains useful strategy feedback, but it was not a strong Mom Test interview.

Most of the call was a founder-led explanation of Adventurers Guild: students complete real SMB work, tasks are split into phases, rank signals trust, and maintainers/managers translate vague client needs into projects. The other person gave several valuable objections around verification, commitment, task abandonment, team conflicts, legal/operational chaos, and whether the model is too complex.

What the conversation does prove:

- The core story is understandable to at least one listener.
- Student proof-of-work and off-campus opportunity pain are plausible.
- SMB/freelancer quality-control pain is plausible.
- The biggest trust risk is not the fantasy theme. It is whether AG can reliably verify, manage, and replace student workers without damaging client trust.

What it does not prove yet:

- That SMBs will post paid quests.
- That students will complete quests reliably under deadlines.
- That rank alone creates hiring trust.
- That companies will pay subscriptions, service fees, or deposits.
- That the marketplace can avoid the cold-start problem without heavy manual operations.

## Source Quality Note

Source audio: `/Users/abi/Downloads/New Recording 29.m4a`

Local transcript used: `/var/folders/w2/418zfdgx38l7gfn48l9jlk1c0000gn/T/opencode/new_recording_29_transcript_auto_nocontext_full.txt`

The transcript is noisy. The first Whisper pass hallucinated repeated text. A second pass with auto language detection and no text context was better, but still has Hindi/Urdu/Hinglish errors and repeated sections. Treat exact quotes as approximate. Treat repeated/gibberish sections as unusable.

## What The Conversation Actually Validated

### 1. The Problem Story Is Coherent

The explanation repeatedly centered on two linked pains:

- Clients/SMBs do not always know how to translate vague technical needs into scoped software projects.
- Students need real work but struggle to get trusted because they lack experience.

Evidence from transcript:

- Clients have low technical understanding and say vague things like they want something built, while an agency may take time to scope it.
- AG would place a manager/maintainer who understands the issue and converts it into a project.
- Students from normal colleges struggle off-campus and need something exceptional to show.
- Freelancing platforms are saturated and people back out when they see a student has no experience.

Strength: Medium.

Reason: These are plausible pains and match the product strategy, but most statements came from the founder explanation, not from the other person's past behavior.

### 2. The Milestone/Phase Model Addresses A Real Trust Objection

The strongest operational insight is the phase-based delivery model:

- Split work into smaller phases.
- Release money phase by phase.
- If one person stalls, remove them and assign a more capable person.
- Do not let the whole client project fail because one contributor disappears.

Evidence from transcript:

- Work should be divided into parts/phases.
- Payment passes after a phase is completed.
- If no progress appears within 3-4 days of a 10-day phase, bring in a more capable person.
- Freelancing has a completion guarantee problem.

Strength: Medium-high as an operational hypothesis.

Reason: This directly addresses a known marketplace failure mode. Still unvalidated until a real client task goes through this flow.

### 3. The Rank System Is Understood, But Not Yet Trusted

The listener understood F/E/D/C/B/A/S ranks and immediately pushed on verification.

Evidence from transcript:

- The rank concept was explained as matching student skill level to quest difficulty.
- The listener asked what parameters would judge people.
- The listener questioned verification for higher-ranked/legendary people.
- The listener warned that companies require commitment from people onboarded to the platform.

Strength: High for identifying the risk.

Reason: Verification surfaced as a direct objection. It should be treated as a top product risk, not a minor feature.

### 4. The Student Wedge Is Plausible

The conversation supports the idea that students want real work, experience, and differentiation from generic resumes.

Evidence from transcript:

- Normal college students face tougher off-campus placement.
- Freelancing platforms are too saturated for students without affiliation or experience.
- Students need real work and visible proof.
- The listener later says students do need something like this, though that is still an opinion signal.

Strength: Medium.

Reason: Plausible and consistent with market context, but not based on direct interviews with students who recently tried and failed to get work.

### 5. The SMB Wedge Is Still Mostly Assumption

The transcript mentions SMBs as the target demand side, but does not include an actual SMB buyer saying:

- They have a task now.
- They tried agencies/freelancers and failed.
- They have budget.
- They would deposit money or post a quest.
- They trust students if AG handles QA.

Strength: Low.

Reason: SMB pain is logically described but not proven through customer behavior.

## Mom Test Scorecard

| Area | Score | Notes |
|---|---:|---|
| Asked about past behavior | 2/10 | Mostly solution explanation, not questions about what the listener actually did recently. |
| Avoided pitching | 1/10 | The conversation was heavily pitch-led. |
| Got concrete commitments | 1/10 | No clear commitment to post a task, introduce a company, pay, or test as a student. |
| Found objections | 8/10 | Strong objections surfaced: verification, commitment, abandonment, team conflicts, legal/operational complexity. |
| Identified buyer pain | 4/10 | Pain was described, but not by a paying customer with a current task. |
| Identified user pain | 5/10 | Student pain is plausible, but needs direct student interviews. |
| Reduced risk | 4/10 | Useful feedback, but core marketplace risks remain. |

Overall: useful advisory conversation, not sufficient customer validation.

## Risky Beliefs To Validate Next

### Highest Risk

1. SMBs have small software tasks they want done now.
2. SMBs trust a student-powered platform if AG provides QA and replacement guarantees.
3. Students will finish real client work on time when money/reputation is involved.
4. Rank can be earned honestly and cannot be gamed easily.
5. Manual founder/maintainer scoping can create enough early quality before automation exists.

### Medium Risk

1. Students value XP/rank/Guild Card enough to return weekly.
2. Companies care about AG rank more than GitHub, college, resume, or interview.
3. Team/party quests reduce delivery risk rather than creating coordination overhead.
4. Phase-based payments reduce client fear enough to create deposits.
5. The fantasy/RPG language motivates users without making companies take the product less seriously.

### Lower Risk

1. Developers understand quest/rank language.
2. A public proof-of-work profile is easier to explain than a resume-only profile.
3. Open-source contributors can help build the product if issues are well-scoped.

## Bad Questions To Stop Asking

These questions generate compliments and false positives:

- Do you think this is a good idea?
- Would students use this?
- Would companies pay for this?
- Does this sound innovative?
- Do you like the rank system?
- Would you recommend this to someone?
- Should I add AI matching?
- Would subscriptions work later?
- Is this better than Upwork?

## Better Mom Test Questions

### For SMBs / Founders / Agencies

- Tell me about the last software task you wanted done but did not assign internally.
- What did you do instead?
- Who did you ask for help?
- How much did you pay or expect to pay?
- What went wrong the last time you hired a freelancer or agency?
- How did you decide whether the work was good enough?
- What is one task in your backlog right now that is annoying but not mission-critical?
- If I scoped that task into milestones and personally QA'd it, would you let us attempt it this week?
- What would make you refuse to give this to students?
- What would count as a successful delivery?

### For Students / Early Developers

- Tell me about the last time you tried to get freelance work, internship work, or a real project.
- Where did you apply or post your profile?
- What response did you get?
- What proof did people ask for?
- What have you shipped that a stranger can inspect?
- When did you last abandon a project or miss a deadline? Why?
- Would you accept a small paid task with strict QA and public review history?
- What would make you choose AG over open source, Fiverr, hackathons, or internships?
- Would you complete one unpaid tutorial quest if it unlocked real paid work?
- Can you spend 5 hours this week on a real task?

### For Hiring Managers / Recruiters

- Tell me about the last junior developer you rejected.
- What signal was missing?
- Have you ever hired someone because of a GitHub project or open-source contribution?
- What proof would let you skip a screening assignment?
- Would a history of QA-approved paid quests matter in your hiring process?
- What would make this signal untrustworthy?

### For Mentors / Advisors

- Which part of this model would fail first in your experience?
- What assumption should we test before raising or building more features?
- Who is the narrowest buyer segment that already feels this pain?
- What would be a credible proof point in 30 days?
- What would you need to see before introducing us to a company?

## Segment-by-Segment Validation Plan

### Segment 1: SMBs With Small Backlog Tasks

Target:

- Indian SaaS startups, NGOs, agencies, small businesses, and founder-led tools with 5-30 people.

Test:

- Ask for one real backlog task that can be completed in 3-7 days.
- Founder manually scopes the quest.
- AG assigns one vetted contributor or a small party.
- Founder/maintainer QA happens before client sees it.
- Client approves, rejects, or requests rework.

Commitment to seek:

- A real task description.
- A deadline.
- A budget, deposit, or written agreement to pay if delivered.
- Permission to use anonymized case study data.

Success criteria:

- 5 companies interviewed.
- 3 provide real backlog tasks.
- 1 pays or commits budget.
- 1 task delivered and accepted.
- 1 company says they would post a second task.

### Segment 2: Students From Non-Tier-1 Colleges

Target:

- Students who have tried off-campus, freelance, hackathon, open-source, or internship routes.

Test:

- Run a small cohort of 10 students.
- Give a tutorial quest and one real micro-quest.
- Track completion, communication, rework, and drop-off.

Commitment to seek:

- They register.
- They complete onboarding.
- They claim a quest.
- They submit within deadline.
- They accept public QA feedback.

Success criteria:

- 10 students onboarded.
- 7 start a quest.
- 5 submit.
- 3 meet acceptance criteria.
- 2 ask for another quest.

### Segment 3: Technical Mentors / Maintainers

Target:

- Experienced developers who can scope client asks and review student work.

Test:

- Ask them to review one quest brief and one submission.
- Measure time required and quality of feedback.

Commitment to seek:

- 30-60 minutes of actual review time.
- Agreement to mentor one quest end-to-end.
- Feedback on rank criteria.

Success criteria:

- 3 mentors review sample quests.
- 2 agree rank criteria are usable.
- 1 agrees to supervise a real quest.

## Immediate Experiments

### Experiment 1: Concierge Quest

Goal: Validate company trust and delivery quality before scaling.

Steps:

1. Ask 10 founders: "What is one small technical task sitting in your backlog right now?"
2. Pick the clearest 1-2 tasks.
3. Scope them manually into acceptance criteria and phases.
4. Assign a trusted contributor/student.
5. QA before client delivery.
6. Ask for payment, testimonial, or second task only after delivery.

Do not automate this yet. The point is to learn the operational failure modes.

### Experiment 2: Rank Calibration Sprint

Goal: Make rank trustworthy.

Steps:

1. Create 3 tasks at F, E, and D difficulty.
2. Ask 10 students to attempt one.
3. Score submissions on correctness, communication, deadline, maintainability, and rework handling.
4. Compare actual performance to claimed skill.
5. Convert results into rank criteria.

### Experiment 3: Company Objection Interviews

Goal: Test whether verification/commitment concerns block buyers.

Questions:

- What would make you trust a student with a real task?
- What failure would make you never use the platform again?
- Would milestone payment and AG QA reduce that fear?
- Would you rather pay per quest, deposit into escrow, or pay only after approval?

### Experiment 4: Guild Card Hiring Signal Test

Goal: Validate whether rank/history matters to hiring.

Steps:

1. Show 5 hiring managers two profiles: resume-only vs Guild Card with verified quest history.
2. Ask which person they would interview and why.
3. Ask what proof is missing.
4. Ask if a completed AG quest could replace a take-home assignment.

## What To Say In Mentor Conversations

Strong version:

"We have a strong product thesis and early advisory feedback. The next validation step is not more features. It is a concierge test: one real SMB task, one manually scoped quest, one vetted student or party, QA before delivery, and a repeat-task ask after completion. Our riskiest assumption is trust: whether companies trust students if AG owns scoping, QA, and replacement."

Avoid saying:

"Customers validated this."

Better:

"The problem pattern is plausible and the objections are clear. We still need paid or behavior-based validation."

## Next Interview Script

Use this for the next 10 interviews:

1. "Before I explain what we built, can you tell me about the last time you needed a small software task done?"
2. "What did you do?"
3. "Who did you ask?"
4. "How much time or money did it cost?"
5. "What was frustrating about that process?"
6. "What did you do when the person missed expectations?"
7. "Do you have a task like that right now?"
8. "If I personally scoped it and QA'd delivery, would you let us attempt it this week?"
9. "What would success look like?"
10. "If it works, would you pay for the next one or introduce me to someone with a similar problem?"

## Bottom Line

The call strengthened the operating model but did not validate demand. The next proof point should be a real task from a real company, not another opinion conversation.

The highest-leverage next move is to run one concierge quest end-to-end and measure: task commitment, student reliability, QA workload, client satisfaction, and repeat intent.
