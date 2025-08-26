# Authentication System

This document explains the authentication system implementation in The Adventurers Guild platform.

## Overview

The authentication system is built on top of Supabase Auth with additional layers for role-based access control, session management, and protected route handling.

## Core Components

### 1. Supabase Client Configuration

Located in `lib/supabase.ts`, this file exports different Supabase clients for different contexts:

- `createBrowserSupabaseClient`: For client-side components
- `createServerSupabaseClient`: For server-side components (uses `@supabase/auth-helpers-nextjs`)
- `createAdminSupabaseClient`: For admin operations (uses service role key)

### 2. Authentication Service

Located in `lib/auth.ts`, the `AuthService` class provides a clean interface for common authentication operations:

- Sign up with email/password
- Sign in with email/password
- OAuth sign in (Google, GitHub)
- Sign out
- Get current user/profile
- Update profile
- Password reset and update
- Email verification

### 3. Authentication Context

Located in `contexts/AuthContext.tsx`, this React context provides authentication state and methods throughout the application:

- User session state
- User profile data
- Loading state
- Authentication methods (signUp, signIn, signOut, etc.)

### 4. Middleware Protection

Located in `middleware.ts`, this Next.js middleware handles route protection at the edge:

- Public routes that don't require authentication
- Role-based route access control
- Automatic redirects for unauthorized access
- Session validation

### 5. Utility Functions

Located in `lib/authUtils.ts`, these utility functions help with common authentication tasks:

- `getDashboardPath`: Get appropriate dashboard based on user role
- `hasCompletedRankTest`: Check if user has completed the AI rank test
- `markRankTestCompleted`: Mark the rank test as completed

### 6. Custom Hooks

Located in `hooks/useAuthRedirect.ts`, this hook helps with client-side redirects based on authentication state:

- Redirect unauthenticated users to login
- Redirect authenticated users to their dashboard
- Handle rank test requirements for new users

### 7. Protected Route Handler

Located in `lib/protectedRouteHandler.ts`, this utility helps protect API routes:

- `withRoleProtection`: Higher-order function to wrap API route handlers
- `getUserSession`: Get user session from request
- `getUserProfile`: Get user profile with role
- `hasRequiredRole`: Check if user has required role

## User Roles

The platform supports multiple user roles:

1. **student**: Regular users who complete quests
2. **company**: Organizations that post quests
3. **admin**: Platform administrators
4. **client**: External clients who commission projects

## Implementation Examples

### Protecting a Page Component

```tsx
'use client'

import { useAuthRedirect } from '@/hooks/useAuthRedirect'

export default function ProtectedPage() {
  const { user, profile, loading } = useAuthRedirect({ 
    requireAuth: true,
    requireRankTest: true
  })

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Protected Content</h1>
      <p>Welcome, {profile?.name}!</p>
    </div>
  )
}
```

### Protecting an API Route

```ts
import { withRoleProtection } from '@/lib/protectedRouteHandler'

async function handler(request, context) {
  // Only accessible by authenticated users with 'company' or 'admin' role
  // context contains { user, profile, params }
  
  return NextResponse.json({ message: 'Protected data' })
}

export const GET = withRoleProtection(handler, ['company', 'admin'])
```

## Session Management

The system implements proper session management with:

- Automatic session refresh
- Real-time session updates
- Graceful handling of expired sessions
- Reduced authentication flicker on page loads

## Role-Based Routing

The middleware automatically redirects users based on their roles:

- Students → `/dashboard/adventurer`
- Companies → `/company/dashboard`
- Admins → `/admin/dashboard`
- Clients → `/client/dashboard`

Unauthorized access attempts are redirected to the appropriate dashboard.