# Troubleshooting Guide

This document provides solutions to common issues encountered when working with The Adventurers Guild platform.

## Development Environment Issues

### Node.js Version Problems

**Issue**: "engine not compatible" or "expected node version" errors

**Solution**:
1. Check required Node.js version in `.nvmrc` or `package.json`
2. Install correct version using nvm:
   ```bash
   nvm install 18
   nvm use 18
   ```
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Package Installation Issues

**Issue**: Dependency installation fails or "peer dep" warnings

**Solution**:
1. Clear package manager cache:
   ```bash
   # For npm
   npm cache clean --force
   
   # For pnpm
   pnpm store prune
   ```
2. Remove node_modules and lock files:
   ```bash
   rm -rf node_modules package-lock.json pnpm-lock.yaml
   ```
3. Reinstall dependencies:
   ```bash
   pnpm install
   ```

### TypeScript Compilation Errors

**Issue**: Type errors during build or development

**Solution**:
1. Check for type mismatches in component props
2. Ensure all required properties are defined
3. Use type assertion when necessary:
   ```typescript
   const user = data as User;
   ```
4. Update type definitions:
   ```bash
   # Generate Supabase types
   supabase gen types typescript --project-id "your-project-id" > types/supabase.ts
   ```

## Authentication Issues

### Sign Up/Sign In Failures

**Issue**: Authentication fails with "Invalid credentials" or "User not found"

**Solution**:
1. Verify environment variables:
   ```bash
   # Check .env.local
   cat .env.local
   ```
2. Ensure Supabase credentials are correct:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Check Supabase Auth settings in dashboard
4. Verify email configuration for SMTP

### Session Management Problems

**Issue**: User appears logged out or session flickers

**Solution**:
1. Check middleware configuration:
   ```typescript
   // middleware.ts
   export async function middleware(request: NextRequest) {
     // Ensure proper session handling
   }
   ```
2. Verify cookie settings in Supabase client:
   ```typescript
   // lib/supabase.ts
   const supabase = createBrowserClient<Database>(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   );
   ```
3. Check for proper session refresh in AuthContext:
   ```typescript
   // contexts/AuthContext.tsx
   useEffect(() => {
     const { data: { subscription } } = supabase.auth.onAuthStateChange(
       async (event, session) => {
         // Handle session changes
       }
     );
     
     return () => subscription.unsubscribe();
   }, []);
   ```

### OAuth Integration Issues

**Issue**: Google/GitHub login fails or redirects incorrectly

**Solution**:
1. Verify OAuth credentials in Supabase dashboard
2. Check redirect URLs match configuration:
   ```
   # Development
   http://localhost:3000/auth/callback
   
   # Production
   https://adventurersguild.vercel.app/auth/callback
   ```
3. Ensure proper scopes are configured:
   ```typescript
   const { data, error } = await supabase.auth.signInWithOAuth({
     provider: 'github',
     options: {
       redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
       scopes: 'read:user user:email'
     }
   });
   ```

## Database Issues

### Connection Errors

**Issue**: "Connection refused" or "Unable to connect to database"

**Solution**:
1. Verify Supabase connection settings:
   ```bash
   # Test connection
   supabase status
   ```
2. Check network connectivity:
   ```bash
   ping your-project.supabase.co
   ```
3. Ensure firewall allows connections to Supabase

### RLS (Row Level Security) Issues

**Issue**: "permission denied" or missing data

**Solution**:
1. Check RLS policies in Supabase dashboard
2. Verify user roles and permissions:
   ```sql
   -- Check user role
   SELECT role FROM users WHERE id = 'user-id';
   ```
3. Test policies with Supabase SQL editor:
   ```sql
   -- Test as authenticated user
   SET LOCAL "role" = 'authenticated';
   SELECT * FROM quests;
   ```

### Migration Problems

**Issue**: Database schema out of sync or migration failures

**Solution**:
1. Check current migration status:
   ```bash
   supabase db diff
   ```
2. Reset local database:
   ```bash
   supabase db reset
   ```
3. Apply migrations:
   ```bash
   supabase db push
   ```

## API Issues

### 404 Errors

**Issue**: API routes return 404 "Not Found"

**Solution**:
1. Verify route file structure:
   ```
   app/
   └── api/
       └── quests/
           └── route.ts
   ```
2. Check HTTP method implementation:
   ```typescript
   // app/api/quests/route.ts
   export async function GET(request: Request) {
     // Implementation
   }
   
   export async function POST(request: Request) {
     // Implementation
   }
   ```
3. Ensure proper export of HTTP methods

### CORS Errors

**Issue**: "Blocked by CORS policy" in browser console

**Solution**:
1. Configure CORS in Supabase dashboard:
   - Add your domain to allowed origins
   - Ensure proper headers
2. For local development, add localhost to CORS settings:
   ```
   http://localhost:3000
   ```

### Rate Limiting

**Issue**: "Too Many Requests" or 429 errors

**Solution**:
1. Implement client-side rate limiting:
   ```typescript
   // lib/api.ts
   const rateLimitedFetch = async (url: string) => {
     // Add delay between requests
     await new Promise(resolve => setTimeout(resolve, 100));
     return fetch(url);
   };
   ```
2. Check Supabase rate limits in dashboard
3. Implement exponential backoff for retries:
   ```typescript
   async function fetchWithRetry(url: string, retries = 3) {
     try {
       return await fetch(url);
     } catch (error) {
       if (retries > 0) {
         await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
         return fetchWithRetry(url, retries - 1);
       }
       throw error;
     }
   }
   ```

## UI/UX Issues

### Responsive Design Problems

**Issue**: Layout breaks on mobile or specific screen sizes

**Solution**:
1. Check responsive breakpoints:
   ```css
   @media (max-width: 640px) {
     /* Mobile styles */
   }
   
   @media (min-width: 1024px) {
     /* Desktop styles */
   }
   ```
2. Verify Tailwind classes:
   ```html
   <div class="w-full sm:w-1/2 lg:w-1/3">
     <!-- Responsive width -->
   </div>
   ```
3. Test on actual devices or browser dev tools

### Styling Issues

**Issue**: Components not styled correctly or CSS conflicts

**Solution**:
1. Check global CSS imports:
   ```typescript
   // app/layout.tsx
   import './globals.css';
   ```
2. Verify Tailwind configuration:
   ```javascript
   // tailwind.config.js
   module.exports = {
     content: [
       './app/**/*.{js,ts,jsx,tsx}',
       './components/**/*.{js,ts,jsx,tsx}'
     ],
     // ...
   };
   ```
3. Clear CSS cache:
   ```bash
   # Restart development server
   pnpm dev
   ```

### Performance Issues

**Issue**: Slow page loads or unresponsive UI

**Solution**:
1. Use React Profiler in dev tools
2. Implement code splitting:
   ```typescript
   import dynamic from 'next/dynamic';
   
   const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
     ssr: false,
     loading: () => <p>Loading...</p>
   });
   ```
3. Optimize images:
   ```typescript
   import Image from 'next/image';
   
   <Image
     src="/image.jpg"
     alt="Description"
     width={800}
     height={600}
     quality={75}
   />
   ```

## Email Functionality

### SMTP Configuration Issues

**Issue**: Email sending fails or "Invalid credentials"

**Solution**:
1. Verify SMTP settings in `.env.local`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```
2. Generate app password for Gmail:
   - Enable 2FA on Google account
   - Generate app password in Security settings
3. Test email configuration:
   ```typescript
   // lib/email.ts
   import nodemailer from 'nodemailer';
   
   const transporter = nodemailer.createTransporter({
     host: process.env.SMTP_HOST,
     port: parseInt(process.env.SMTP_PORT || '587'),
     secure: false,
     auth: {
       user: process.env.SMTP_USER,
       pass: process.env.SMTP_PASS
     }
   });
   ```

## Deployment Issues

### Build Failures

**Issue**: Deployment fails with build errors

**Solution**:
1. Check build logs in Vercel dashboard
2. Fix TypeScript errors:
   ```bash
   pnpm build
   ```
3. Ensure all environment variables are set in Vercel
4. Check for missing dependencies

### Runtime Errors

**Issue**: Application works locally but fails in production

**Solution**:
1. Check environment variables in Vercel
2. Verify Supabase credentials
3. Check for hardcoded localhost URLs
4. Review browser console for errors

### Domain Issues

**Issue**: Custom domain not working or SSL errors

**Solution**:
1. Verify DNS configuration:
   ```dns
   A Record: your-domain.com -> 76.76.21.21
   CNAME: www.your-domain.com -> cname.vercel-dns.com
   ```
2. Check domain status in Vercel dashboard
3. Wait for SSL certificate provisioning (can take up to 24 hours)

## Testing Issues

### Test Failures

**Issue**: Tests fail or produce inconsistent results

**Solution**:
1. Clear test cache:
   ```bash
   # For Jest
   jest --clearCache
   
   # For Cypress
   rm -rf cypress/screenshots cypress/videos
   ```
2. Ensure test environment variables are set
3. Check for timing issues in async tests:
   ```typescript
   // Use async/await properly
   it('should fetch data', async () => {
     const data = await fetchData();
     expect(data).toBeDefined();
   });
   ```

### Mocking Issues

**Issue**: Mocks not working or returning undefined

**Solution**:
1. Verify mock setup:
   ```typescript
   // __mocks__/module-name.ts
   export const mockFunction = jest.fn();
   ```
2. Clear mocks between tests:
   ```typescript
   beforeEach(() => {
     jest.clearAllMocks();
   });
   ```
3. Check import paths for mocks

## Supabase-Specific Issues

### Realtime Subscriptions

**Issue**: Realtime updates not working

**Solution**:
1. Enable Realtime in Supabase dashboard
2. Check subscription setup:
   ```typescript
   const channel = supabase
     .channel('quest-updates')
     .on(
       'postgres_changes',
       {
         event: 'UPDATE',
         schema: 'public',
         table: 'quests'
       },
       (payload) => {
         console.log('Quest updated:', payload);
       }
     )
     .subscribe();
   ```
3. Verify RLS allows realtime subscriptions

### Storage Issues

**Issue**: File uploads fail or files not accessible

**Solution**:
1. Check storage bucket permissions in Supabase
2. Verify file upload code:
   ```typescript
   const { data, error } = await supabase.storage
     .from('bucket-name')
     .upload('path/to/file', file);
   ```
3. Ensure proper CORS settings for storage

## Performance Optimization Issues

### Bundle Size Problems

**Issue**: Large bundle size affecting load times

**Solution**:
1. Analyze bundle size:
   ```bash
   # Install bundle analyzer
   npm install @next/bundle-analyzer
   
   # Add to next.config.js
   const withBundleAnalyzer = require('@next/bundle-analyzer')({
     enabled: process.env.ANALYZE === 'true',
   });
   
   module.exports = withBundleAnalyzer({});
   ```
2. Run analysis:
   ```bash
   ANALYZE=true npm run build
   ```
3. Optimize large dependencies

### Image Optimization

**Issue**: Images not loading or optimization failing

**Solution**:
1. Check image imports:
   ```typescript
   import Image from 'next/image';
   import profilePic from '../public/profile.jpg';
   
   <Image src={profilePic} alt="Profile" />
   ```
2. Verify image optimization settings in `next.config.js`:
   ```javascript
   module.exports = {
     images: {
       domains: ['your-domain.com'],
     },
   };
   ```

## Security Issues

### XSS Prevention

**Issue**: User input not properly sanitized

**Solution**:
1. Use DOMPurify for sanitization:
   ```typescript
   import DOMPurify from 'dompurify';
   
   const cleanContent = DOMPurify.sanitize(userInput);
   ```
2. Validate all inputs with Zod:
   ```typescript
   import { z } from 'zod';
   
   const userSchema = z.object({
     name: z.string().min(1).max(100),
     email: z.string().email(),
   });
   ```

### CSRF Protection

**Issue**: Form submissions vulnerable to CSRF

**Solution**:
1. Use built-in Next.js CSRF protection
2. Implement custom tokens if needed:
   ```typescript
   // Generate CSRF token
   import { randomBytes } from 'crypto';
   
   const csrfToken = randomBytes(32).toString('hex');
   ```

## Common Error Messages and Solutions

### "Module not found"

**Solution**:
1. Check import paths
2. Verify file exists
3. Restart development server

### "Cannot find module 'X'"

**Solution**:
1. Install missing dependency:
   ```bash
   pnpm add module-name
   ```
2. Check for typos in import statements

### "Unexpected token" or "SyntaxError"

**Solution**:
1. Check for syntax errors in code
2. Verify TypeScript configuration
3. Ensure proper file extensions

### "Network error" or "Failed to fetch"

**Solution**:
1. Check API endpoint URLs
2. Verify network connectivity
3. Check CORS settings
4. Verify environment variables

## Debugging Tools and Techniques

### Browser Developer Tools

1. **Network Tab**: Monitor API requests and responses
2. **Console**: Check for JavaScript errors
3. **Elements**: Inspect DOM and CSS
4. **Performance**: Analyze page load performance
5. **Application**: Check local storage and cookies

### Supabase Debugging

1. **SQL Editor**: Test queries directly
2. **Logs**: Monitor database operations
3. **Auth**: Check user authentication status
4. **Storage**: Verify file access

### Logging Strategies

1. **Client-side Logging**:
   ```typescript
   console.log('Debug info:', data);
   ```

2. **Server-side Logging**:
   ```typescript
   import { createLogger } from '@/lib/logger';
   
   const logger = createLogger('auth');
   logger.info('User signed in', { userId });
   ```

3. **Error Boundary Logging**:
   ```typescript
   class ErrorBoundary extends React.Component {
     componentDidCatch(error, errorInfo) {
       console.error('Error caught:', error, errorInfo);
       // Send to error tracking service
     }
   }
   ```

## Prevention Best Practices

### Code Quality

1. **Regular Code Reviews**: Peer review all changes
2. **Linting**: Use ESLint and Prettier
3. **Type Checking**: Enable strict TypeScript
4. **Testing**: Maintain comprehensive test coverage

### Monitoring

1. **Error Tracking**: Implement Sentry or similar
2. **Performance Monitoring**: Track Core Web Vitals
3. **Uptime Monitoring**: Monitor application availability
4. **Alerting**: Set up notifications for critical issues

### Documentation

1. **Update Documentation**: Keep docs in sync with code
2. **Troubleshooting Guide**: Maintain this guide
3. **Runbooks**: Create operational procedures
4. **Knowledge Base**: Document common solutions

This troubleshooting guide should help resolve most common issues. For complex problems, consider reaching out to the community on Discord or creating a GitHub issue.