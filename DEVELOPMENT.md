# Development Guide

This document contains essential information for developers contributing to the Adventurers Guild project.

## Project Setup

### Prerequisites
- Node.js (LTS version recommended)
- npm or Yarn
- Git

### Installation
1. Clone the repository:
```bash
git clone https://github.com/LarytheLord/adventurers-guild.git
cd adventurers-guild
```

2. Install dependencies:
```bash
npm install
```

### Environment Configuration
Create a `.env.local` file in the root directory with the following required variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

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
```

For Gmail Setup:
1. Enable 2-Factor Authentication on your Gmail account
2. Generate App Password: Google Account → Security → 2-Step Verification → App passwords
3. Select "Mail" and generate a 16-character password
4. Use this password in `SMTP_PASS` (not your regular Gmail password)

### Running the Application
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linter
- `npm run type-check` - Run TypeScript checks
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run deploy:vercel` - Deploy to Vercel

## Architecture Overview

The Adventurers Guild is built with:
- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS
- **Styling:** shadcn/ui components
- **Database:** Supabase (PostgreSQL)
- **Authentication:** NextAuth.js with Supabase
- **Deployment:** Vercel

Key directories:
- `app/` - Next.js 13+ app router pages
- `components/` - React components including UI library
- `lib/` - Utility functions and libraries
- `types/` - TypeScript type definitions
- `supabase/` - Database schema and configuration

## Contributing

Please refer to [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

## Build Status

The project currently has some TypeScript errors that need to be resolved (292 errors identified). The main build-blocking issue is a missing NEXTAUTH_SECRET environment variable. Once this is added and the TypeScript errors are fixed, the application should build and run successfully.

## Next Steps

1. Complete TypeScript error fixes
2. Implement missing core functionality (dashboard, quest completion, admin features)
3. Complete company onboarding flow
4. Add comprehensive testing
5. Improve documentation

## Support

If you encounter issues:
1. Check that all environment variables are properly set
2. Run `npm run type-check` to see TypeScript errors
3. Check browser console for runtime errors
4. Review terminal logs