# The Adventurers Guild

[![GitHub contributors](https://img.shields.io/github/contributors/LarytheLord/adventurers-guild?style=flat-square)](https://github.com/LarytheLord/adventurers-guild/graphs/contributors)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) [![Discord](https://img.shields.io/discord/7hQYkEx5?label=Discord&logo=discord&style=flat-square)](https://discord.gg/7hQYkEx5)
[![Website](https://img.shields.io/badge/Website-Live-blue?style=flat-square)](https://adventurersguild.vercel.app)

## Revolutionizing Computer Science Education

**The Adventurers Guild** is a gamified developer marketplace that connects students and developers with real-world projects from companies and NGOs. Adventurers progress through ranks (F to S), earn XP, and get paid by completing Quests — actual development tasks commissioned by real organisations.

Part of the **Open Paws** ecosystem, integrating with the Open Paws Bootcamp and Internship Programme.

## Key Features

### Core Functionality
- **Gamified Learning**: Progress from F-Rank to S-Rank through real-world projects
- **Quest System**: Complete authentic projects commissioned by real companies
- **Two-Track Architecture**: Open quests for everyone, plus dedicated Bootcamp and Intern tracks
- **Ranking System**: Compete with peers through XP and rank progression
- **Payment Integration**: Earn monetary rewards for completed quests
- **Company Portal**: Post quests and find talented developers

### Quest Pipelines
- **Backlog Conversion**: Open Paws backlog items converted to quests
- **Hackathon-to-Quest**: Top hackathon prototypes become platform quests
- **External Clients**: Companies post quests through the Company Portal

### Authentication & Security
- **Role-Based Access**: Adventurers, Companies, and Admins
- **Secure Authentication**: NextAuth.js (credentials + JWT session strategy)
- **Track Enforcement**: API-level access control for quest track visibility

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Lucide React icons
- **Database**: Neon (PostgreSQL) with Prisma ORM
- **Authentication**: NextAuth.js (Credentials Provider)
- **Deployment**: Vercel
- **Code Review**: GitHub PR-based workflow
- **Communication**: Discord for team coordination
- **Payment Processing**: Internal quest transaction pipeline (Stripe Connect planned)

## Prerequisites

- Node.js (LTS version recommended)
- npm
- Git
- Neon account (for serverless PostgreSQL)

## Getting Started

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
Create a `.env.local` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://user:password@your-neon-host.neon.tech/neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://user:password@your-neon-host-direct.neon.tech/neondb?sslmode=require"

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Locally
```bash
npx prisma generate
npm run dev
```

The application will be available at `http://localhost:3000`

## User Roles

### Adventurers (Students/Developers)
- Browse and accept quests matching their rank
- Earn XP, skill points, and monetary rewards
- Climb the ranks from F to S
- Build portfolio with real projects

### Companies
- Post quests for adventurers to complete
- Access to ranked, pre-vetted talent
- Pay for completed work
- Review and approve submissions

### Admins
- Manage users and quests
- Moderate the platform
- Handle disputes and escalations
- Monitor platform health

## How It Works

### For Adventurers:
1. **Join the Guild**: Create your adventurer profile
2. **Choose Quests**: Browse available quests matching your skills and rank
3. **Accept Quest**: Commit to completing a project
4. **Submit Work**: Complete the quest via GitHub PR and submit for review
5. **Get Reviewed**: Senior engineers review your code
6. **Earn Rewards**: Receive XP, skill points, and monetary rewards
7. **Climb Ranks**: Progress from F-Rank to S-Rank

### For Companies:
1. **Register**: Create your company profile
2. **Post Quests**: Describe the project you need completed
3. **Review Applicants**: Select the right adventurers for your project
4. **Review Work**: Approve completed projects
5. **Pay Adventurers**: Reward successful quest completion

## Contributing

We welcome contributions of all skill levels! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

Check out our [GitHub Issues](https://github.com/LarytheLord/adventurers-guild/issues) for tasks categorized by difficulty (F-Rank through S-Rank).

## Documentation

- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [docs/contributor-onboarding.md](docs/contributor-onboarding.md) - Contributor onboarding
- [docs/ARCHITECTURE_DECISIONS.md](docs/ARCHITECTURE_DECISIONS.md) - Architecture decisions
- [FINANCIAL_MODEL.md](FINANCIAL_MODEL.md) - Revenue model

## Connect

- **Discord**: [Join our Community!](https://discord.gg/7hQYkEx5)
- **Website**: [The Adventurers Guild](https://adventurersguild.vercel.app)
- **GitHub**: [Adventurers Guild](https://github.com/LarytheLord/adventurers-guild)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
