The Adventurers Guild: Complete Website Development Plan 🗺️
This document outlines the comprehensive plan for developing "The Adventurers Guild" website, encompassing all necessary features, pages, technical details, and future additions to create a complete and impactful platform. This plan builds upon the current progress (waitlist page ready, homepage in progress) and aims to detail everything needed for a successful launch and continuous development.

1. Project Overview & Vision ✨
The Adventurers Guild is a groundbreaking platform designed to gamify computer science education and bridge the gap between academic learning and industry demands. We transform aspiring developers ("Adventurers") into industry-ready problem-solvers by connecting them with real-world "Quests" (commissioned projects) from companies. Our vision is to establish a new standard for skill development, portfolio building, and talent sourcing in the tech industry.

2. Minimum Viable Product (MVP) Scope & Core Features 🚀
The MVP focuses on proving the core value proposition: connecting Adventurers with Quests and demonstrating skill progression.

MVP Core Features:
User Authentication: Secure sign-up/sign-in for Adventurers and Quest Givers.

User Profiles: Basic profiles for both Adventurers (skills, bio, XP, rank) and Quest Givers (company info).

Quest Board: A browsable list of "Quests" posted by Quest Givers.

Quest Creation (Quest Giver): Ability for Quest Givers to post new project briefs.

Quest Application (Adventurer): Ability for Adventurers to apply for open Quests.

Basic XP & Rank System: Automatic XP gain upon Quest completion, and visible rank progression (F-S).

Simple Submission & Review: Adventurers submit work (e.g., GitHub link), Quest Givers review and approve.

Dashboard Views: Separate basic dashboards for Adventurers (their Quests, XP) and Quest Givers (their posted Quests, applicants).

3. Future Features & Additions (Post-MVP) 🌟
To make the platform truly complete and scalable, the following features will be added iteratively after the MVP.

Enhanced Gamification & Progression:
Detailed Adventurer Dashboards: In-depth analytics on skill growth, quest statistics, success rates.

Skill Trees/Badges: Visual representation of mastered skills and achievements.

Leaderboards: Public/private rankings of Adventurers by XP, completed quests, or specific skills.

Mentorship System: Dedicated features for higher-ranked Adventurers to mentor lower ranks, with mentor profiles and tracking.

Community Forums/Guilds: Integrated forum or internal communication tools beyond Discord for persistent discussions and team formation.

Certifications/Micro-credentials: Guild-issued verifiable certifications for specific skill sets or Quest Lines.

Advanced Quest Management:
Automated Quest Matching: AI/ML-driven algorithms to suggest Quests to Adventurers based on skills, rank, and preferences.

Team Formation Tools: Integrated features for Adventurers to form teams for larger Quests, manage roles, and communicate.

Project Management Tools: Basic integrated PM tools (task assignment, deadlines, progress tracking) for active Quests.

Dispute Resolution System: A structured process for resolving disagreements between Adventurers and Quest Givers.

Payment Gateway Integration: Direct payment processing for commissioned Quests within the platform.

Contract Management: Automated generation and management of simple project agreements.

Client & Business Features:
Client Dashboards: Detailed reports on project progress, Adventurer performance, and expenditure.

Talent Scouting: Features for Quest Givers to directly search and invite top-ranked Adventurers.

Subscription/Premium Tiers: For Quest Givers (e.g., dedicated support, faster matching) or Adventurers (e.g., advanced resources, exclusive quests).

Content & Learning Resources:
Learning Paths: Curated "Quest Lines" or learning paths for specific technologies (e.g., "Full-Stack React Quest Line").

Knowledge Base: A repository of tutorials, best practices, and technical guides.

Code Sandbox/IDE Integration: In-browser coding environments for smaller training quests.

4. Technical Stack (Detailed) 💻
Frontend:
Framework: Next.js (React) for modern web development, supporting both static site generation (marketing pages) and server-side rendering (dynamic dashboards).

Language: TypeScript for type safety, improved code quality, and better maintainability.

Styling: Tailwind CSS for rapid and consistent UI development through utility-first classes.

UI Components: Shadcn/ui for pre-built, accessible, and customizable React components (buttons, forms, tables, modals).

Icon Library: Lucide React or React Icons for scalable vector icons.

Charting: Recharts or similar library for displaying XP progression, quest statistics, etc.

Backend:
Architecture: Serverless Functions (e.g., Next.js API Routes, Vercel Functions, AWS Lambda) for scalability and cost-efficiency.

Language: Node.js with Express.js (if a dedicated backend service is preferred over serverless functions for complex logic).

Authentication: NextAuth.js for handling OAuth (Google, GitHub) and email/password authentication securely.

API Layer: RESTful API endpoints for data interaction between frontend and database.

Database:
Primary Database: PostgreSQL (Relational Database) for structured data, reliability, and complex queries.

Provider: Supabase or Neon for managed PostgreSQL with easy integration.

State Management:
Global State: Zustand or React Context API for managing application-wide state (e.g., user session, notifications).

Deployment:
Frontend: Vercel for seamless deployment of Next.js applications, offering automatic scaling and CI/CD.

Backend Functions: Vercel (for Next.js API Routes) or AWS Lambda (for standalone Node.js functions).

Database: Supabase or Neon (managed services).

Code Quality & Tooling:
Code Formatter: Prettier for consistent code styling.

Linter: ESLint with recommended React and TypeScript configurations for identifying code issues and enforcing best practices.

Git Hooks: Husky to automate linting and formatting checks before commits.

Testing: Jest and React Testing Library for unit and integration testing.

5. Page Breakdown (User-Facing & Admin) 🌐
Public Pages:
Homepage (/): Landing page with problem, solution, value proposition, call to action (Join Waitlist/Sign Up).

About Us (/about): Mission, vision, team.

How It Works (/how-it-works): Detailed explanation of the Guild system (F-S ranks, Quests, benefits).

Quests List (/quests): Publicly browseable list of available and past Quests. Filters for skills, rank, status.

Individual Quest Page (/quests/[id]): Detailed Quest brief, requirements, XP value, "Apply Now" button.

Adventurer Public Profile (/adventurers/[id]): Public view of Adventurer's completed quests, rank, skills, bio, GitHub.

Quest Giver Public Profile (/quest-givers/[id]): Public view of company profile, past commissioned quests.

Login (/login): User authentication form.

Register (/register): Initial user type selection (Adventurer/Quest Giver).

register/adventurer: Adventurer registration form.

register/quest-giver: Quest Giver registration form.

Code of Conduct (/code-of-conduct): Detailed document outlining community rules.

Privacy Policy (/privacy-policy): Data handling and privacy information.

Terms of Service (/terms-of-service): Legal terms for platform usage.

Contact Us (/contact): Form or contact details for inquiries.

Authenticated Pages (Dashboards):
Adventurer Dashboard (/dashboard/adventurer)
My Profile (/dashboard/adventurer/profile): Edit profile details, skills, bio.

My Quests (/dashboard/adventurer/my-quests): List of Quests applied for, in progress, completed.

Quest Board (/dashboard/adventurer/quest-board): Filtered view of open Quests matching Adventurer's rank/skills.

Progression (/dashboard/adventurer/progression): Visual display of XP, current rank, and path to next rank.

Quest Giver Dashboard (/dashboard/quest-giver)
My Company Profile (/dashboard/quest-giver/profile): Edit company details.

My Posted Quests (/dashboard/quest-giver/my-quests): Manage existing Quests (view applicants, review submissions, change status).

Post New Quest (/dashboard/quest-giver/new-quest): Form for creating new Quest listings.

Billing & Payments (/dashboard/quest-giver/billing): View payment history, invoices.

Admin Dashboard (/dashboard/admin) - (Internal Team Only)
User Management: View/manage all users (Adventurers, Quest Givers, Admins).

Quest Oversight: Monitor all active Quests, intervene if needed.

XP/Rank Management: Manual adjustments (if necessary) and oversight of the system.

Payments & Invoicing: Oversee financial transactions.

Content Management: Manage static pages, announcements.

6. Functionality Breakdown ⚙️
6.1. User Authentication & Authorization:
Auth API Routes: sign-up, sign-in, sign-out, forgot-password, reset-password, oauth-callback.

Middleware: Protect authenticated routes.

Role-Based Access Control (RBAC): Ensure users only access relevant dashboards/features based on their role (adventurer, quest_giver, admin).

6.2. User Profile Management:
Profile API Routes: GET /api/users/[id], PUT /api/users/[id], POST /api/users/upload-avatar.

Frontend Components: Profile forms, avatar upload.

6.3. Quest Management:
Quest API Routes:

GET /api/quests: List all quests (filterable by status, skills, rank).

GET /api/quests/[id]: Retrieve single quest details.

POST /api/quests: Create new quest (Quest Giver only).

PUT /api/quests/[id]: Update quest (Quest Giver/Admin only).

DELETE /api/quests/[id]: Delete quest (Quest Giver/Admin only).

Frontend Components: Quest List, Quest Detail Page, Create/Edit Quest Form.

6.4. Quest Application:
Application API Routes:

POST /api/quests/[id]/apply: Adventurer applies for a quest.

GET /api/quests/[id]/applications: View applications for a specific quest (Quest Giver/Admin).

PUT /api/applications/[id]/status: Update application status (Quest Giver/Admin).

Frontend Components: Apply Button, Application List, Status Indicators.

6.5. Gamification (XP & Rank Engine):
XP Calculation Function: Triggered when a Quest is marked "Complete" by Quest Giver. Adds XP to Adventurer's profile.

Rank Progression Logic: Checks Adventurer's total XP against predefined rank thresholds (F-S). Updates rank field.

Rank Assessment Logic: For C-S ranks, flag for "Professional Guild Programmer" review before rank update.

Frontend Components: XP/Rank display on profile/dashboard.

6.6. Project Submission & Review:
Submission API Routes:

POST /api/applications/[id]/submit: Adventurer submits submission_url for a completed quest.

PUT /api/applications/[id]/review: Quest Giver/Admin reviews submission and marks as Approved or Denied.

Frontend Components: Submission Input Field, Review Interface (approve/deny buttons).

7. Database Schema (PostgreSQL) 🗄️
-- Users Table: Central authentication and common user data
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT, -- For email/password auth
    provider TEXT, -- 'google', 'github', 'email'
    provider_id TEXT, -- ID from OAuth provider
    role TEXT NOT NULL DEFAULT 'adventurer', -- 'adventurer', 'quest_giver', 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adventurers Table: Extends users for Adventurer-specific data
CREATE TABLE adventurers (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    bio TEXT,
    skills TEXT[], -- Array of strings for skills (e.g., ['React', 'Node.js', 'SQL'])
    github_link TEXT,
    linkedin_link TEXT,
    profile_picture_url TEXT,
    xp INTEGER NOT NULL DEFAULT 0,
    rank TEXT NOT NULL DEFAULT 'F' -- F, E, D, C, B, A, S
);

-- Quest Givers Table: Extends users for Company-specific data
CREATE TABLE quest_givers (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    company_logo_url TEXT,
    website_url TEXT,
    contact_person_name TEXT,
    industry TEXT
);

-- Quests Table: Stores all project information
CREATE TABLE quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quest_giver_id UUID NOT NULL REFERENCES quest_givers(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    xp_value INTEGER NOT NULL, -- XP awarded upon successful completion
    skills_required TEXT[], -- Array of strings for required skills
    min_rank TEXT NOT NULL DEFAULT 'F', -- Minimum rank required to apply
    deadline TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'Open', -- 'Open', 'In Progress', 'Under Review', 'Completed', 'Closed'
    budget_estimate TEXT, -- Optional: e.g., '$500-$1000'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications Table: Manages Adventurer applications to Quests
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adventurer_id UUID NOT NULL REFERENCES adventurers(user_id) ON DELETE CASCADE,
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Applied', -- 'Applied', 'Accepted', 'Denied', 'In Progress', 'Submitted', 'Approved', 'Rejected'
    submission_url TEXT, -- Link to Adventurer's completed work (e.g., GitHub repo, deployed app)
    application_message TEXT, -- Message from Adventurer when applying
    feedback TEXT, -- Feedback from Quest Giver/Admin on submission
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(adventurer_id, quest_id) -- Ensures an Adventurer can only apply once per Quest
);

-- Optional: Guild_History Table for detailed XP/Rank audit trail (Future)
-- CREATE TABLE guild_history (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     event_type TEXT NOT NULL, -- 'XP_GAINED', 'RANK_UP', 'QUEST_COMPLETED', etc.
--     xp_change INTEGER,
--     new_xp INTEGER,
--     new_rank TEXT,
--     quest_id UUID REFERENCES quests(id),
--     event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

8. Development Workflow & Best Practices 🛠️
Version Control: Git and GitHub for collaborative development.

Branching Strategy: Use a main branch for production-ready code, develop for ongoing integration, and feature branches for new development.

Pull Requests (PRs): All code changes should go through PRs, requiring at least one review.

Code Reviews: Emphasize thorough code reviews for quality, maintainability, and security.

Linting & Formatting: Enforce ESLint and Prettier using Husky pre-commit hooks.

Testing: Implement unit tests for critical functions and components, and integration tests for key workflows.

Documentation: Maintain clear documentation for setup, API endpoints, and complex logic.

Issue Tracking: Utilize GitHub Issues or a tool like Linear (as mentioned previously) for tracking tasks, bugs, and features.

9. Missing Key Elements (Non-Code for Complete Startup) 📈
While the website is crucial, a successful startup also requires these elements.

Brand Identity: Comprehensive brand guidelines, consistent visuals, and messaging across all platforms (website, social media, Discord).

Legal & Compliance: Formal business registration, legal counsel, and robust privacy policies/terms of service (beyond basic templates). This includes clarity on IP ownership for Quest contributions.

Marketing & Growth Strategy: Ongoing execution of the detailed marketing plan for both Adventurer acquisition and Quest Giver sourcing.

Community Management Team: Dedicated individuals (or a growing team) to actively nurture the Discord community, onboard new members, and facilitate mentorship.

Financial Operations: Systems for invoicing, payment processing (for commissions), and Adventurer payouts.

Customer Support: A system (e.g., Zendesk, as discussed) for handling user inquiries, technical issues, and disputes effectively.

Feedback Loops: Continuous collection and analysis of feedback from both Adventurers and Quest Givers to inform product development and operations.

This plan provides a comprehensive roadmap for building The Adventurers Guild, detailing the technical aspects, feature sets, and crucial non-code elements required for a complete and thriving startup.