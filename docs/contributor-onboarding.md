# Contributor Onboarding Guide for Adventurers Guild

Welcome to the Adventurers Guild project! This guide will help you get started contributing to our platform that gamifies computer science education by connecting students with real-world projects from companies.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Development Environment Setup](#development-environment-setup)
4. [Understanding the Codebase](#understanding-the-codebase)
5. [Making Your First Contribution](#making-your-first-contribution)
6. [Development Workflow](#development-workflow)
7. [Code Standards](#code-standards)
8. [Where to Get Help](#where-to-get-help)

## Project Overview

The Adventurers Guild is a Next.js application that connects students (adventurers) with companies through real-world projects (quests). Students earn XP, skill points, and monetary rewards by completing these quests, while companies get valuable work done and access to talented developers.

### Key Features
- **Quest Management**: Companies can post quests (projects) and adventurers can accept them
- **Gamification**: XP system, skill trees, and ranking from F to S rank
- **Payment Processing**: Integration for monetized quests
- **Dashboard**: Personalized dashboards for adventurers and companies
- **Authentication**: Role-based access control (adventurer, company, admin)

### Tech Stack
- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Lucide React icons
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js with Supabase
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js (LTS version recommended)
- npm or Yarn
- Git
- A code editor (VSCode recommended)

### Quick Start
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/adventurers-guild.git`
3. Navigate to project: `cd adventurers-guild`
4. Install dependencies: `npm install`
5. Create environment file: `cp .env.example .env.local`
6. Start development server: `npm run dev`

## Development Environment Setup

### Environment Variables
You'll need to set up the following environment variables in your `.env.local` file:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@adventurersguild.com

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Setting Up Supabase
1. Create a Supabase account at https://supabase.io
2. Create a new project
3. Copy the project URL and API keys to your environment variables
4. Run the schema from `supabase/schema.sql` in your Supabase SQL editor

### Database Schema
The database includes tables for:
- `users`: User profiles and roles
- `quests`: Projects posted by companies
- `quest_assignments`: Links between users and quests
- `quest_submissions`: Work submitted by adventurers
- `quest_completions`: Tracking of completed quests
- `transactions`: Payment records for monetized quests
- `notifications`: User notifications
- `company_profiles`: Company-specific information
- `adventurer_profiles`: Adventurer-specific information

## Understanding the Codebase

### Project Structure
```
app/                    # Next.js 13+ app router pages
├── api/                # API routes
├── dashboard/          # User dashboards
│   ├── company/        # Company dashboard
│   └── quests/         # Adventurer dashboard
components/            # Reusable React components
├── ui/                # Shadcn UI components
├── admin/             # Admin-specific components
├── company/            # Company-specific components
lib/                   # Utility functions and libraries
├── auth.ts            # Authentication utilities
├── payment-utils.ts   # Payment-related utilities
├── quest-utils.ts     # Quest-related utilities
types/                 # TypeScript type definitions
supabase/              # Database schema and migrations
```

### Key Components
- `app/page.tsx`: Landing page
- `app/dashboard/page.tsx`: Adventurer dashboard
- `app/dashboard/company/page.tsx`: Company dashboard
- `components/Navigation.tsx`: Main navigation component
- `components/QuestList.tsx`: Component for displaying quests
- `lib/auth.ts`: Authentication configuration
- `app/api/quests/route.ts`: Quest API endpoints

### Important Patterns
- **Data Fetching**: Use server components when possible, client components when interactivity is needed
- **Authentication**: Wrap protected pages with `useSession` hook
- **API Routes**: Follow the Next.js 13+ app router API route pattern
- **Types**: Use TypeScript interfaces defined in `types/index.ts`

## Making Your First Contribution

### Finding Issues
1. Check the GitHub Issues page for tasks marked with `good first issue` or `help wanted`
2. Look at the `CONTRIBUTOR_TASKS.md` document for specific tasks organized by difficulty
3. Comment on an issue to indicate you're working on it

### Common First Contributions
1. **Fix typos** in documentation or code comments
2. **Improve accessibility** by adding ARIA attributes
3. **Update UI components** to improve user experience
4. **Add tests** for existing functionality
5. **Fix small bugs** reported in issues

### Local Development Process
1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test your changes locally
4. Commit with a descriptive message
5. Push to your fork: `git push origin feature/your-feature-name`
6. Create a pull request to the main repository

## Development Workflow

### Branch Naming Convention
- `feature/short-description` for new features
- `bugfix/issue-number-short-description` for bug fixes
- `docs/update-documentation-topic` for documentation updates

### Commit Messages
Use conventional commits format:
- `feat: Add new authentication method`
- `fix: Resolve issue with quest assignment`
- `docs: Update API documentation`
- `refactor: Improve component structure`

### Code Review Process
1. All pull requests require at least one review
2. Address all feedback before merging
3. Keep pull requests focused on a single issue or feature
4. Include tests for new functionality when applicable

## Code Standards

### TypeScript
- Use TypeScript for all new code
- Define proper interfaces for complex objects
- Use type guards when working with potentially undefined values
- Follow naming conventions (camelCase for variables, PascalCase for components)

### React Components
- Use functional components with hooks
- Keep components focused on a single responsibility
- Use shadcn/ui components when possible for consistency
- Follow accessibility best practices

### Styling
- Use Tailwind CSS for styling
- Follow the existing design system
- Use responsive design patterns
- Maintain consistent spacing and typography

### API Routes
- Use proper HTTP status codes
- Implement error handling
- Validate input data
- Follow RESTful API principles where applicable

## Where to Get Help

### Documentation
- `README.md`: Project overview and setup
- `DEVELOPMENT.md`: Detailed development setup
- `CONTRIBUTING.md`: Contribution guidelines
- `CONTRIBUTOR_TASKS.md`: Available tasks organized by difficulty

### Community
- Join our Discord server (link in README)
- Create GitHub issues for technical questions
- Ask questions in existing issue threads
- Check the discussions tab for broader topics

### For Maintainers
- Need help prioritizing issues? Check our roadmap in `DEVELOPMENT.md`
- Questions about architecture? Refer to the technical decisions in `docs/architecture.md`
- Want to propose a new feature? Create an RFC in the `docs/rfc/` directory

## Next Steps

1. Explore the [CONTRIBUTOR_TASKS.md](../CONTRIBUTOR_TASKS.md) document for specific tasks you can work on
2. Join our community channels to connect with other contributors
3. Pick a beginner-friendly task and submit your first pull request
4. As you become familiar with the codebase, consider tackling more complex challenges

Thank you for contributing to the Adventurers Guild! Your efforts help create opportunities for students to gain real-world experience while helping companies find talented developers.