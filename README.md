# The Adventurers Guild - Enhanced README

[![GitHub contributors](https://img.shields.io/github/contributors/LarytheLord/adventurers-guild?style=flat-square)](https://github.com/LarytheLord/adventurers-guild/graphs/contributors)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) [![Discord](https://img.shields.io/discord/7hQYkEx5?label=Discord&logo=discord&style=flat-square)](https://discord.gg/7hQYkEx5)
[![Website](https://img.shields.io/badge/Website-Live-blue?style=flat-square)](https://adventurersguild.vercel.app)

## 🎮 Revolutionizing Computer Science Education

**The Adventurers Guild** is an innovative educational platform that gamifies computer science learning by connecting students with real-world projects from companies. Students (called "Adventurers") progress through skill trees, earn experience points (XP), and advance through a ranking system (F to S rank) by completing "Quests" - which are actual digital projects commissioned by companies.

## 🚀 Key Features

### Core Functionality
- **Gamified Learning**: Progress from F-Rank to S-Rank through real-world projects
- **Quest System**: Complete authentic projects commissioned by real companies
- **Skill Trees**: Visualize and develop your technical expertise
- **Ranking System**: Compete with peers through our XP and ranking system
- **Payment Integration**: Earn monetary rewards for completed quests
- **Company Portal**: Post quests and find talented developers

### DevSync Integration
- **Real-time Collaboration**: Work directly with adventurers in shared development environments
- **Code Review**: Built-in review system for quality assurance
- **Version Control**: Integrated Git workflow for project management
- **Live Coding**: Collaborative coding sessions with mentors and peers
- **Progress Tracking**: Real-time progress visibility for both parties

### Authentication & Security
- **Role-Based Access**: Adventurers, Companies, and Admins
- **Secure Authentication**: NextAuth.js (credentials + JWT session strategy)
- **Permission Management**: Granular access controls for different user types

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Lucide React icons
- **Database**: Neon (PostgreSQL) with Prisma ORM
- **Authentication**: NextAuth.js (Credentials Provider)
- **Deployment**: Vercel
- **DevSync Integration**: Collaborative coding platform
- **Payment Processing**: Internal quest transaction pipeline

## 📋 Prerequisites

- Node.js (LTS version recommended)
- npm or Yarn
- Git
- Neon account (for serverless PostgreSQL)

## 🚀 Getting Started

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
Create a `.env.local` file in the root directory with the required variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@ep-ant-hill-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@adventurersguild.com

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# DevSync Integration (optional)
NEXT_PUBLIC_DEVSYNC_API_URL=https://api.devsync.codes
DEVSYNC_API_KEY=your-devsync-api-key
```

### 4. Run Locally
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 👥 User Roles

### Adventurers (Students)
- Browse and accept quests
- Earn XP, skill points, and monetary rewards
- Climb the ranks from F to S
- Build portfolio with real projects
- Collaborate in real-time through DevSync integration

### Companies
- Post quests for adventurers to complete
- Access to pre-vetted student talent
- Pay for completed work
- Review and approve submissions
- Access collaborative coding environments

### Admins
- Manage users and quests
- Moderate the platform
- Handle disputes
- Monitor platform health

## 🏆 How It Works

### For Adventurers:
1. **Join the Guild**: Create your adventurer profile
2. **Choose Quests**: Browse available quests matching your skills
3. **Accept Quest**: Commit to completing a project
4. **Collaborate**: Work with company representatives and other adventurers
5. **Submit Work**: Complete the quest and submit for review
6. **Earn Rewards**: Receive XP, skill points, and monetary rewards
7. **Climb Ranks**: Progress from F-Rank to S-Rank

### For Companies:
1. **Register**: Create your company profile
2. **Post Quests**: Describe the project you need completed
3. **Review Applicants**: Select the right adventurers for your project
4. **Collaborate**: Work directly with adventurers through DevSync
5. **Review Work**: Approve completed projects
6. **Pay Adventurers**: Reward successful quest completion

## 💰 Monetization Model

### Revenue Streams:
1. **Platform Commission**: 15-20% commission on quest payments
2. **Premium Subscriptions**: Enhanced features for companies and adventurers
3. **Corporate Licensing**: For universities and training organizations
4. **Featured Quests**: Promoted placement for premium listings

## 🤝 Contributing

We welcome contributions of all skill levels! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on:
- Finding and claiming issues
- Development workflow
- Code standards
- Pull request process

Check out our [GitHub Issues](https://github.com/LarytheLord/adventurers-guild/issues) for tasks categorized by difficulty:
- **F-Rank**: Beginner-friendly tasks
- **E-Rank**: Simple improvements
- **D-Rank**: Moderate complexity
- **C-Rank**: Feature development
- **B-Rank**: Complex features
- **A-Rank**: Major system changes
- **S-Rank**: Epic-level challenges

## 📚 Documentation

- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development setup and architecture overview
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - Community standards
- [docs/contributor-onboarding.md](docs/contributor-onboarding.md) - Contributor onboarding
- [docs/INFRA_AND_PRODUCT_PLAN_2026-03-04.md](docs/INFRA_AND_PRODUCT_PLAN_2026-03-04.md) - Infra + product roadmap

## 🌐 Connect

- **Discord**: [Join our Community!](https://discord.gg/7hQYkEx5)
- **Website**: [The Adventurers Guild](https://adventurersguild.vercel.app)
- **GitHub**: [Adventurers Guild](https://github.com/LarytheLord/adventurers-guild)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Current Development Status

- **Core Features**: Implemented
- **Authentication**: Complete
- **Quest Management**: Fully functional
- **Payment Processing**: Core transaction flow integrated
- **DevSync Integration**: Planned and documented
- **User Dashboard**: Complete
- **Company Portal**: Complete

## 📈 Growth Strategy

1. **Launch with Universities**: Partner with GTU and other institutions
2. **Pilot Companies**: Start with Knight Medicare, Open Paws, and similar companies
3. **Community Building**: Focus on Discord engagement and success stories
4. **Scale Gradually**: Expand to more universities and companies
5. **International Expansion**: Target global educational institutions

## 🚧 Roadmap

### Q1 2025
- Complete DevSync integration
- Launch with 5 pilot universities
- Onboard 25+ companies
- Achieve 1,000+ registered adventurers

### Q2 2025
- Implement advanced matching algorithms
- Launch mobile applications
- Expand to international markets
- Process ₹5L+ in quest payments

### Q3-Q4 2025
- AI-powered skill assessment
- Corporate training licensing
- Advanced analytics dashboard
- Series A funding round
