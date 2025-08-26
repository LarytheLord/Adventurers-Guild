# Development Guide

This document provides detailed technical information for developers working on The Adventurers Guild project.

## Project Architecture

### Frontend Architecture

The frontend is built with Next.js 13+ using the App Router, which provides:

1. **Server Components** - For data fetching and improved performance
2. **Client Components** - For interactive UI elements
3. **Server Actions** - For mutations without API routes
4. **Middleware** - For authentication and authorization

```
app/
├── [role]/              # Role-based dashboards
│   ├── dashboard/       # Main dashboard pages
│   └── profile/         # User profile pages
├── api/                 # API routes
├── auth/                # Authentication pages
├── quests/              # Quest-related pages
├── layout.tsx           # Root layout
└── page.tsx             # Home page
```

### Backend Architecture

The backend uses Supabase as a Backend-as-a-Service:

1. **Supabase Auth** - For user authentication
2. **Supabase Database** - PostgreSQL with Row Level Security
3. **Supabase Storage** - For file uploads
4. **Supabase Functions** - For serverless functions (coming soon)

### Database Schema

Key tables in our PostgreSQL database:

1. **users** - User profiles and authentication
2. **quests** - Quest/project listings
3. **quest_applications** - Applications for quests
4. **quest_submissions** - Completed quest submissions
5. **skills** - Available skills in the skill tree
6. **user_skills** - User progress in skills
7. **skill_categories** - Skill category groupings
8. **skill_transactions** - Audit trail of skill point changes
9. **achievements** - Available achievements
10. **user_achievements** - User unlocked achievements
11. **notifications** - User notifications
12. **companies** - Extended company information

### Authentication Flow

1. **Sign Up** - Users register with email/password or OAuth
2. **Email Verification** - Automatic verification flow
3. **Profile Creation** - Auto-created via database triggers
4. **Session Management** - Cookie-based sessions with SSR
5. **Role-Based Access** - Middleware checks for route protection

### State Management

1. **React Context** - For global state like authentication
2. **Server Components** - For data that doesn't change frequently
3. **Client Components** - For interactive state
4. **SWR/React Query** - For data fetching and caching (planned)

## Component Structure

### UI Components

Located in `components/ui/`, these are reusable UI primitives:

```
components/ui/
├── button.tsx
├── card.tsx
├── dialog.tsx
├── input.tsx
├── select.tsx
├── ...
```

### Feature Components

Located in feature-specific directories:

```
components/
├── auth/           # Authentication components
├── dashboard/      # Dashboard components
├── home/           # Home page components
├── profile/        # Profile components
├── quests/         # Quest-related components
└── ui/             # Reusable UI components
```

### Component Guidelines

1. **TypeScript First** - All components use TypeScript interfaces
2. **Accessibility** - Proper ARIA attributes and keyboard navigation
3. **Responsive** - Mobile-first design with responsive utilities
4. **Reusable** - Components should be generic and reusable
5. **Well-documented** - Clear prop interfaces and usage examples

## API Routes

API routes are located in `app/api/` and follow this structure:

```
app/api/
├── quests/
│   ├── route.ts          # Quest CRUD operations
│   ├── [id]/
│   │   ├── apply/        # Apply for a quest
│   │   ├── submit/       # Submit completed quest
│   │   └── route.ts      # Quest-specific operations
│   └── create/
│       └── route.ts      # Create new quest
├── skills/
│   └── route.ts          # Skill tree operations
├── user_skills/
│   └── unlock/
│       └── route.ts      # Unlock skills
└── ...
```

## Services and Utilities

### Authentication Service

Located in `lib/auth.ts`, provides:

1. **Sign Up/Sign In** - Email and OAuth authentication
2. **Session Management** - Get current user and session
3. **Profile Updates** - Update user profile information
4. **Password Reset** - Handle password recovery flow

### Supabase Client

Located in `lib/supabase.ts`, provides:

1. **Browser Client** - For client-side operations
2. **Server Client** - For server-side operations
3. **Admin Client** - For administrative operations
4. **Type Safety** - Strong typing with generated types

### Utility Functions

Located in `lib/utils.ts`:

1. **cn()** - Class name merging with clsx and tailwind-merge
2. **formatDate()** - Date formatting utilities
3. **formatCurrency()** - Currency formatting
4. **slugify()** - String slugification

## Styling System

### Tailwind CSS

We use Tailwind CSS with a custom configuration:

1. **Custom Colors** - Guild-themed color palette
2. **Custom Spacing** - Consistent spacing scale
3. **Custom Components** - Reusable component classes
4. **Dark Mode** - Automatic dark/light mode support

### Responsive Design

Follows a mobile-first approach with breakpoints:

* **xs**: 475px (Extra small devices)
* **sm**: 640px (Small devices)
* **md**: 768px (Medium devices)
* **lg**: 1024px (Large devices)
* **xl**: 1280px (Extra large devices)
* **2xl**: 1536px (2X large devices)

### Component Styling

1. **Utility Classes** - Use Tailwind utility classes
2. **Component Classes** - Use `@apply` for complex components
3. **Responsive Variants** - Mobile-first responsive design
4. **Dark Mode Variants** - Automatic dark mode support

## Testing Strategy

### Unit Testing

1. **Component Testing** - Test individual components with Jest
2. **Utility Testing** - Test utility functions
3. **Hook Testing** - Test custom React hooks
4. **Service Testing** - Test service functions

### Integration Testing

1. **API Route Testing** - Test API endpoints
2. **Database Testing** - Test database operations
3. **Authentication Testing** - Test auth flows
4. **Form Testing** - Test form validation and submission

### End-to-End Testing

1. **User Flow Testing** - Test complete user journeys
2. **Authentication Flows** - Test sign up, sign in, sign out
3. **Quest Management** - Test quest creation, application, submission
4. **Profile Management** - Test profile updates

## Deployment

### Vercel Deployment

1. **Automatic Deployments** - Push to main triggers deployment
2. **Preview Deployments** - Pull requests get preview URLs
3. **Environment Variables** - Managed in Vercel dashboard
4. **Custom Domains** - adventurersguild.vercel.app

### Supabase Deployment

1. **Database Migrations** - Applied via Supabase CLI
2. **Auth Settings** - Configured in Supabase dashboard
3. **Storage Buckets** - Managed in Supabase dashboard
4. **Functions** - Deployed via Supabase CLI

## Performance Optimization

### Code Splitting

1. **Dynamic Imports** - Lazy load non-critical components
2. **Route-based Splitting** - Automatic with Next.js
3. **Component Splitting** - Manual for large components
4. **Library Splitting** - Separate bundles for large libraries

### Image Optimization

1. **Next.js Image** - Automatic optimization
2. **WebP Conversion** - Modern image formats
3. **Responsive Images** - Multiple sizes for different devices
4. **Lazy Loading** - Load images when in viewport

### Caching

1. **Browser Caching** - Static assets cached
2. **Server-side Caching** - API responses cached
3. **Database Caching** - Query results cached
4. **CDN Caching** - Vercel's global CDN

## Security

### Authentication Security

1. **Password Hashing** - bcryptjs for password storage
2. **Session Security** - Secure, HttpOnly cookies
3. **OAuth Security** - Proper OAuth flow implementation
4. **Rate Limiting** - Prevent abuse of auth endpoints

### Data Security

1. **Row Level Security** - PostgreSQL RLS policies
2. **Input Validation** - Zod schema validation
3. **SQL Injection** - Parameterized queries
4. **XSS Prevention** - DOMPurify for user content

### API Security

1. **Rate Limiting** - Prevent API abuse
2. **Authentication Checks** - Verify user permissions
3. **Input Sanitization** - Clean user inputs
4. **Error Handling** - Don't expose sensitive information

## Accessibility

### Semantic HTML

1. **Proper Tags** - Use correct HTML elements
2. **Heading Hierarchy** - Logical heading structure
3. **Landmark Roles** - ARIA landmark roles
4. **Form Labels** - Proper labeling of form elements

### Keyboard Navigation

1. **Focus Management** - Logical focus flow
2. **Skip Links** - Skip to main content
3. **Keyboard Shortcuts** - Common keyboard interactions
4. **Focus Indicators** - Visible focus states

### Screen Reader Support

1. **ARIA Labels** - Descriptive ARIA attributes
2. **Live Regions** - Dynamic content announcements
3. **Role Attributes** - Proper ARIA roles
4. **State Attributes** - ARIA state properties

## Development Workflow

### Git Workflow

1. **Feature Branches** - Create branch for each feature
2. **Descriptive Commits** - Follow Conventional Commits
3. **Pull Requests** - Review before merging
4. **Squash Merging** - Clean commit history

### Code Review Process

1. **Automated Checks** - Linting and type checking
2. **Manual Review** - Peer code review
3. **Testing** - Ensure tests pass
4. **Documentation** - Update docs with changes

### Continuous Integration

1. **Linting** - Code style enforcement
2. **Type Checking** - TypeScript compilation
3. **Testing** - Automated test suite
4. **Building** - Ensure build succeeds

## Debugging

### Browser Debugging

1. **React DevTools** - Component inspection
2. **Network Tab** - API request monitoring
3. **Console Logs** - Debug information
4. **Performance Tab** - Performance profiling

### Server Debugging

1. **Supabase Logs** - Database query logs
2. **Vercel Logs** - Serverless function logs
3. **Error Boundaries** - Catch and display errors
4. **Logging Service** - Centralized logging (planned)

### Performance Debugging

1. **Lighthouse** - Performance auditing
2. **Bundle Analyzer** - Bundle size analysis
3. **Web Vitals** - Core web vitals monitoring
4. **Profiling** - React and JavaScript profiling

## Common Issues and Solutions

### Authentication Issues

1. **Session Not Found** - Check cookie settings
2. **Profile Not Created** - Verify database triggers
3. **OAuth Failures** - Check redirect URLs
4. **Password Reset** - Verify email configuration

### Database Issues

1. **RLS Errors** - Check policy definitions
2. **Permission Denied** - Verify user roles
3. **Query Performance** - Add proper indexes
4. **Connection Errors** - Check connection settings

### Deployment Issues

1. **Build Failures** - Check for type errors
2. **Runtime Errors** - Verify environment variables
3. **Performance Issues** - Optimize queries and assets
4. **Security Issues** - Review security headers

## Best Practices

### Code Quality

1. **TypeScript** - Use strong typing everywhere
2. **ESLint** - Follow linting rules
3. **Prettier** - Consistent code formatting
4. **Comments** - Document complex logic

### Performance

1. **Lazy Loading** - Load only what's needed
2. **Caching** - Cache expensive operations
3. **Optimization** - Optimize images and assets
4. **Monitoring** - Track performance metrics

### Security

1. **Input Validation** - Validate all inputs
2. **Authentication** - Secure auth implementation
3. **Authorization** - Check permissions
4. **Updates** - Keep dependencies updated

### Accessibility

1. **Semantic HTML** - Use proper elements
2. **ARIA Attributes** - Add when needed
3. **Keyboard Navigation** - Ensure full keyboard access
4. **Screen Reader** - Test with screen readers

This guide will be updated as the project evolves. For questions or clarifications, please reach out in our Discord community.