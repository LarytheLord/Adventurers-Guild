# BharatCode Partnership & Micro-Business Pivot

## Overview

This document captures the strategic pivot of Adventurers Guild from a pure credentialing marketplace to an **Agency-as-a-Service** model targeting India's micro-businesses, and the partnership with BharatCode to power the AI layer.

## The Pivot: Agency-as-a-Service

### The Core Problem

India produces 6M+ developers, but the market has a deep trust and credentialing gap:

- A LinkedIn profile is an unverified claim
- A LeetCode score is a practice metric, not real work
- An Upwork rating is a reputation aggregate, not proof of shipped code

None of these are verified, shipped work tied to a transparent review process.

### Three Forces Making This Urgent

| Force | What Changed |
|-------|-------------|
| AI is eating junior IT work | Cursor/Devin/Copilot are automating 40–60% of L1/L2 engineering tasks |
| Bootcamps scaling faster than placement | ~50K/yr graduates with no neutral proof-of-work credential |
| Companies unbundling work | Rising project-based hiring; full-time junior hires feel risky |

### The Solution

**Adventurers Guild** is a gamified proof-of-work talent marketplace that acts as a managed middle layer:

- Traditional micro-businesses tell us what they need (via WhatsApp, voice notes, simple conversations)
- Our AI + Technical Manager layer translates vague requests into bite-sized coding "Quests"
- Tier-2/Tier-3 college students complete the Quests
- AI multi-agent QA + human tech manager verify quality
- The final product is delivered to the business — **the client never knows it was built by a student**

### The Shield of Abstraction

The client only experiences the platform as a reliable, affordable agency. They don't manage students, they don't care about ranks or XP — they just get their digital service delivered. This abstraction is the core moat.

## Market Numbers

### Supply Side: College Students

- **Total higher education students**: ~43.3 million (AISHE 2020-21)
- **Undergraduates**: ~34.1 million (79% of total)
- **Engineering/Tech students**: ~4 million
- **Annual engineering graduates**: ~1 million
- **Tier-2/Tier-3 graduates**: ~950,000/year (95% of all grads) — this is the core supply base

### Demand Side: Micro-Businesses

- **Total MSMEs**: 63 million
- **Registered micro-enterprises**: 39.3 million (97.7% of registered MSMEs)
- **Definition**: Investment up to ₹1 crore, turnover up to ₹5 crore — exactly the local shop owners and small manufacturers we're targeting

## Competitive Landscape

### Closest Operational Model: Awign
- Takes enterprise contracts, breaks them down, distributes to gig workers
- Focuses on large enterprises + non-technical tasks
- **Our wedge**: MSMEs + technical/development tasks

### DIY SaaS Platforms: Dukaan, Bikayi, DotPe
- Allow shop owners to create stores in 2 minutes
- **Our wedge**: Custom integrations and unique flows that rigid SaaS can't handle

### Student Matchmakers: Cuvette, Unstop
- Unmanaged introductions between students and companies
- **Our wedge**: We manage the delivery, guaranteeing quality to the client

### Heizen AI (Validation)
- Similar "AI + Human Developer" middle-layer model
- Targets funded startups and enterprises (high-ticket)
- **Our wedge**: The bottom of the pyramid — ₹10K–₹50K projects that Heizen ignores

## The BharatCode Partnership

### What is BharatCode?

BharatCode provides free AI coding infrastructure for Indian students:

- **Desktop app** (Windows) and CLI access
- **Model endpoint** (`bharatcode.ai/api/model/v1`)
- **Shared compute** with visible capacity
- **Free forever** for students with `.ac.in` or `.edu.in` emails
- **No API keys needed** — OAuth handles authentication
- **Public beta** is free for everyone

### Vision (Internal)

BharatCode's founder wants to build the Indian equivalent of Claude — all features, skills, and tools that Claude offers, built here. This partnership aligns perfectly with Adventurers Guild's mission.

### How It Powers Our Platform

Every quest on Adventurers Guild is built using BharatCode's infrastructure:

1. Students use BharatCode's desktop agent to complete quests
2. The model endpoint processes their prompts and generates code
3. Shared compute keeps costs at zero for students
4. AI multi-agent QA reviews submissions before human review

### Why It Matters

- **Zero cost to students** — removes the biggest barrier to entry
- **Indian-first infrastructure** — aligned with our target market
- **Real AI tools** — not just chat, but actual coding agents
- **Shared resource model** — focused prompts keep capacity open for everyone

## Website Integration (Frontend Changes)

### 1. WhyAG Section — "BharatCode-Powered" Card

Replaced the generic "AI-Augmented" card with a specific BharatCode mention:

- **Title**: BharatCode-Powered
- **Description**: Built on BharatCode's free AI coding infrastructure — desktop agent, model endpoint, shared compute. Zero cost for students.

### 2. LogoMarquee — Tech Tags

Added "BharatCode Infrastructure" to the scrolling technology tags at the bottom of the landing page.

### 3. CTA Section — Adventurer Messaging

Updated the "For Adventurers" copy to explicitly mention BharatCode:

> "All quests are built using BharatCode's free AI tools — no API keys, no subscriptions."

### Design Philosophy

BharatCode is mentioned only where it adds value:
- **Credibility** (WhyAG section)
- **Student incentive** (CTA section)
- **Tech stack visibility** (LogoMarquee)

No hero section changes, no trust bar modifications, no quest badges. Minimal, strategic placement.

## Revenue Model

- **15% service fee** on companies only
- **Developers keep 100%** of rewards
- Structural advantage over Upwork/Fiverr (who charge both sides)
- Productized offerings to keep costs low for micro-businesses

## Moat

### 1. Translation & Standardization Engine (Demand Moat)
AI pipeline that parses unorganized, conversational regional input (WhatsApp audio in Hindi/regional languages) into structured technical Quests. Competitors can't match this because their systems are built for structured English inputs.

### 2. Multi-Agent Auto-Grading (Margin Moat)
AI agents auto-grade code for security, bugs, and visual consistency before human review. Drives cost of QA to near-zero.

### 3. Component Library (Speed Moat)
As students complete quests, pre-verified modular blocks accumulate. By project 500, AI provides 85% pre-built code, requiring only 15% customization. Delivery time drops from weeks to hours.

### 4. Campus Networks (Supply Moat)
Viral campus ambassador networks ("Guild Chapters") create talent lock-in. Once students in a hostel get paid, word-of-mouth creates immediate supply.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Database | Neon (serverless PostgreSQL) |
| ORM | Prisma 6 |
| Auth | NextAuth.js v4 |
| UI | shadcn/ui + Radix UI + Tailwind CSS |
| Payments | Stripe + Razorpay |
| AI | BharatCode (infrastructure), Custom multi-agent QA |
| Testing | Jest + Playwright |
| Deployment | Vercel |

## Current State

**Alpha with Heavy Pre-Planning**

- Full auth system (register, login, JWT, password reset)
- Quest lifecycle (create → assign → submit → AI QA → human review → deliver)
- XP/Ranking engine (F → E → D → C → B → A → S)
- Admin panel (user management, quest management, revenue overview)
- 20 Prisma models, 40+ API routes
- Landing page pulling live data
- E2E tests (4 Playwright tests)
- CI pipeline (lint + type-check + build)

**Still in progress**: Two-track bootcamp gating, production Razorpay flows, Stripe Billing subscriptions.

## Key Files

| Purpose | File |
|---------|------|
| NextAuth config | `lib/auth.ts` |
| Prisma client | `lib/db.ts` |
| API auth helper | `lib/api-auth.ts` |
| RBAC middleware | `middleware.ts` |
| DB schema | `prisma/schema.prisma` |
| XP/rank updates | `lib/xp-utils.ts` |
| Quest lifecycle | `lib/quest-lifecycle.ts` |

## Maintainers

| GitHub | Role |
|--------|------|
| [@LarytheLord](https://github.com/LarytheLord) | Architecture, infra, payments, bootcamp pipeline |
| [@Adil2009700](https://github.com/Adil2009700) | Frontend, dashboard UX, landing, PR triage |
