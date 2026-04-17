# The Adventurers Guild

[![GitHub contributors](https://img.shields.io/github/contributors/LarytheLord/adventurers-guild?style=flat-square)](https://github.com/LarytheLord/adventurers-guild/graphs/contributors)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Discord](https://img.shields.io/discord/7hQYkEx5?label=Discord&logo=discord&style=flat-square)](https://discord.gg/7hQYkEx5)
[![Website](https://img.shields.io/badge/Website-Live-blue?style=flat-square)](https://adventurersguild.vercel.app)
[![NSoC 2026](https://img.shields.io/badge/NSoC-2026-orange?style=flat-square)](https://nsoc.in)
[![Sponsor Us](https://img.shields.io/badge/Sponsor%20Us-Razorpay-0C73EB?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.me/@LarytheLord)

## Revolutionizing Computer Science Education

**The Adventurers Guild** is a gamified developer marketplace that connects students and developers with real-world projects from companies and NGOs. Adventurers progress through ranks (F to S), earn XP, and get paid by completing Quests — actual development tasks commissioned by real organisations.

Part of the **Open Paws** ecosystem, integrating with the Open Paws Bootcamp and Internship Programme.

![Quest Board](public/images/quest-board.png)

---

## Key Features

### Core Functionality
- **Guild Card** — Verifiable public profile showing rank, XP, skills, and completed quest history. Share on LinkedIn. Employers can verify rank programmatically.
- **Gamified Ranking** — Progress from F-Rank to S-Rank through real-world projects. Rank is the credential.
- **Quest System** — Complete authentic projects commissioned by real companies. XP multipliers for streaks.
- **Two-Track Architecture** — Open quests for everyone, plus dedicated Bootcamp and Intern tracks.
- **Payment Integration** — Earn monetary rewards for completed quests.
- **Company Portal** — Post quests, review applicants, and find ranked developers.
- **Admin QA Layer** — Submissions go through `pending_admin_review` before company sees them.

### Quest Pipelines
- **External Clients** — Companies post quests through the Company Portal.
- **Bootcamp Track** — Open Paws bootcamp students complete F/E rank quests as part of their curriculum.
- **Intern Track** — 20 paid interns handle D+ rank quests in squads of 3–5.

### Authentication & Security
- **Role-Based Access** — Adventurers, Companies, and Admins with distinct permissions.
- **Secure Authentication** — NextAuth.js (credentials + JWT session strategy, 30-day sessions).
- **Track Enforcement** — API-level access control for quest track visibility.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | Neon (serverless PostgreSQL) via Prisma 6 ORM |
| Auth | NextAuth.js v4 (Credentials Provider, JWT strategy) |
| UI | shadcn/ui + Tailwind CSS + Radix UI + Lucide React |
| Deployment | Vercel |
| Payments | Internal pipeline (Stripe Connect planned) |

---

## Getting Started

### Prerequisites
- Node.js LTS
- npm
- Git
- A [Neon](https://neon.tech) account (free tier works)

### 1. Clone the Repository
```bash
git clone https://github.com/LarytheLord/adventurers-guild.git
cd adventurers-guild
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the example env file:
```bash
cp .env.example .env.local
```

Fill in the required values:
```bash
# Database — get from Neon dashboard
DATABASE_URL="postgresql://user:password@your-neon-host.neon.tech/neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://user:password@your-neon-host-direct.neon.tech/neondb?sslmode=require"

# Authentication — generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Set Up the Database
```bash
# Generate Prisma client
npx prisma generate

# Push schema to your Neon database (no migration files needed)
npm run db:push
```

### 5. Run the Dev Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## User Roles

| Role | Access | Profile |
|------|--------|---------|
| **Adventurer** | Quest board, apply/submit, dashboard, Guild Card | `AdventurerProfile` (skills, XP, streak, rank) |
| **Company** | Company dashboard, post quests, review submissions | `CompanyProfile` (companyName, questsPosted) |
| **Admin** | All routes + `/admin/**`, quest/user management, QA mediation | Full platform access |

### Ranking System
`F → E → D → C → B → A → S` — XP thresholds determine rank. Higher rank = harder quests with bigger rewards.

---

## How It Works

### For Adventurers
1. **Join the Guild** — Create your adventurer profile
2. **Browse Quests** — Filter by rank, track, and skills
3. **Claim a Quest** — Commit to completing a project
4. **Submit Work** — Complete via GitHub PR and submit for review
5. **Get Reviewed** — QA review, then company approval
6. **Earn Rewards** — XP, rank progression, and monetary rewards
7. **Build Your Guild Card** — Public verifiable credential you can share

### For Companies
1. **Register** — Create your company profile
2. **Post Quests** — Describe the project with clear specs
3. **Review Applicants** — Select ranked developers
4. **Approve Work** — Review and accept completed submissions
5. **Pay Adventurers** — Rewards are distributed on approval

---

## Contributing

We welcome contributions of all skill levels! NSoC 2026 participants — this is an active program running **April 15 – May 30, 2026**.

Start here:
1. Read [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow
2. Check [docs/contributor-onboarding.md](docs/contributor-onboarding.md) for local setup
3. Pick an issue from [GitHub Issues](https://github.com/LarytheLord/adventurers-guild/issues) labeled by rank (F-rank = beginner-friendly)

Issues are labeled `F-rank` through `S-rank` by complexity. Good first issues are labeled `good first issue`.

---

## Documentation

| File | Purpose |
|------|---------|
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution workflow and code standards |
| [docs/contributor-onboarding.md](docs/contributor-onboarding.md) | Local environment setup guide |
| [docs/ARCHITECTURE_DECISIONS.md](docs/ARCHITECTURE_DECISIONS.md) | Why things are built the way they are |
| [docs/IMPLEMENTATION_TASKS.md](docs/IMPLEMENTATION_TASKS.md) | Current task queue with specs |
| [CLAUDE.md](CLAUDE.md) | Full project context (for AI agents) |

---

## Connect

- **Discord**: [Join our Community](https://discord.gg/7hQYkEx5)
- **Website**: [adventurersguild.vercel.app](https://adventurersguild.vercel.app)
- **GitHub**: [LarytheLord/adventurers-guild](https://github.com/LarytheLord/adventurers-guild)

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
