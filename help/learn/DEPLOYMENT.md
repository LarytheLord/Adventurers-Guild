# Deployment Documentation

This document provides detailed information about deploying The Adventurers Guild platform.

## Deployment Architecture

The platform uses a modern cloud-native architecture with:

1. **Frontend** - Next.js application deployed on Vercel
2. **Backend** - Supabase (PostgreSQL, Auth, Storage, Functions)
3. **Domain** - Custom domain with SSL
4. **Monitoring** - Error tracking and performance monitoring
5. **CI/CD** - Automated deployment pipeline

## Frontend Deployment (Vercel)

### Deployment Process

1. **Automatic Deployments**
   - Push to `main` branch triggers production deployment
   - Pull requests trigger preview deployments
   - Vercel automatically builds and deploys the application

2. **Manual Deployments**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy to production
   vercel --prod
   
   # Deploy to preview
   vercel
   ```

### Environment Variables

Configure environment variables in Vercel dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=https://adventurersguild.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=your-email@gmail.com
```

### Build Configuration

Vercel automatically detects Next.js projects, but you can customize with `vercel.json`:

```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/",
      "continue": true
    }
  ]
}
```

### Performance Optimization

1. **Static Site Generation (SSG)**
   - Pre-render pages at build time
   - Use `getStaticProps` and `getStaticPaths`

2. **Incremental Static Regeneration (ISR)**
   - Update static pages after deployment
   - Use `revalidate` option in `getStaticProps`

3. **Server-Side Rendering (SSR)**
   - Render pages on each request
   - Use `getServerSideProps`

4. **Client-Side Rendering (CSR)**
   - Render pages in the browser
   - Use React hooks for data fetching

## Backend Deployment (Supabase)

### Database Deployment

1. **Schema Migrations**
   ```bash
   # Push local schema to production
   supabase db push
   
   # Pull remote schema to local
   supabase db pull
   ```

2. **Seed Data**
   ```bash
   # Apply seed data
   supabase db seed
   ```

3. **Database Monitoring**
   - Monitor query performance
   - Track connection usage
   - Set up alerts for slow queries

### Authentication Configuration

1. **Email Setup**
   - Configure SMTP settings in Supabase dashboard
   - Enable email confirmations
   - Set up email templates

2. **OAuth Providers**
   - Configure Google OAuth credentials
   - Configure GitHub OAuth credentials
   - Enable/disable providers as needed

3. **Security Settings**
   - Set password requirements
   - Configure session timeouts
   - Enable multi-factor authentication

### Storage Configuration

1. **Bucket Setup**
   - Create storage buckets for different file types
   - Set access policies for each bucket
   - Configure CDN settings

2. **File Management**
   - Implement file upload limits
   - Set up automatic file processing
   - Configure backup policies

### Functions Deployment

1. **Edge Functions**
   ```bash
   # Deploy functions
   supabase functions deploy
   
   # Deploy specific function
   supabase functions deploy function-name
   ```

2. **Local Development**
   ```bash
   # Start local function server
   supabase functions serve
   
   # Test functions locally
   supabase functions serve --env-file .env.local
   ```

## Domain Configuration

### Custom Domain Setup

1. **Domain Purchase**
   - Purchase domain from registrar
   - Point DNS to Vercel nameservers

2. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - Let's Encrypt certificates are renewed automatically

3. **DNS Configuration**
   ```dns
   # A Records
   your-domain.com -> 76.76.21.21
   your-domain.com -> 99.86.160.10
   
   # CNAME Records
   www.your-domain.com -> cname.vercel-dns.com
   ```

## Monitoring & Analytics

### Error Tracking

1. **Sentry Integration**
   ```bash
   # Install Sentry
   npm install @sentry/nextjs
   
   # Configure in next.config.js
   const { withSentryConfig } = require('@sentry/nextjs');
   
   const moduleExports = {
     // ... your existing configuration
   };
   
   const sentryWebpackPluginOptions = {
     // ... sentry options
   };
   
   module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
   ```

2. **Error Boundaries**
   ```typescript
   // components/ErrorBoundary.tsx
   import { ErrorBoundary } from 'react-error-boundary';
   
   function MyErrorBoundary({ children }: { children: React.ReactNode }) {
     return (
       <ErrorBoundary
         fallback={<div>Something went wrong</div>}
         onError={(error, info) => {
           // Log to Sentry or other service
           console.error('Error caught by boundary:', error, info);
         }}
       >
         {children}
       </ErrorBoundary>
     );
   }
   ```

### Performance Monitoring

1. **Web Vitals**
   - Track Core Web Vitals (LCP, FID, CLS)
   - Set up alerts for performance degradation
   - Monitor real-user metrics

2. **Analytics**
   ```typescript
   // lib/analytics.ts
   export const trackEvent = (eventName: string, properties: Record<string, any>) => {
     // Send to analytics service
     if (typeof window !== 'undefined' && (window as any).gtag) {
       (window as any).gtag('event', eventName, properties);
     }
   };
   ```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Environment-Specific Deployments

1. **Development**
   - Deployed automatically on PR creation
   - Uses development database
   - Preview URLs for testing

2. **Staging**
   - Manual deployment to staging environment
   - Uses staging database
   - Pre-production testing

3. **Production**
   - Deployed automatically on main branch push
   - Uses production database
   - Full production environment

## Backup & Recovery

### Database Backups

1. **Automated Backups**
   - Supabase provides daily backups
   - Point-in-time recovery available
   - Backup retention policies configurable

2. **Manual Backups**
   ```bash
   # Export database
   supabase db dump --file backup.sql
   
   # Import database
   supabase db reset
   psql -h db.supabase.co -d postgres -U postgres -f backup.sql
   ```

### Disaster Recovery

1. **Recovery Plan**
   - Documented recovery procedures
   - Regular backup testing
   - Team training on recovery processes

2. **Rollback Procedures**
   - Git rollback to previous commit
   - Database rollback to previous backup
   - CDN cache invalidation

## Security Deployment

### Security Headers

Configure security headers in `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders
      }
    ];
  }
};
```

### Content Security Policy

Implement CSP to prevent XSS attacks:

```javascript
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\s{2,}/g, ' ').trim()
          }
        ]
      }
    ];
  }
};
```

## Performance Optimization

### Caching Strategy

1. **Browser Caching**
   - Static assets cached for long periods
   - Versioned filenames for cache busting
   - Proper cache headers

2. **CDN Caching**
   - Vercel's global CDN
   - Edge caching for static content
   - Dynamic content caching

3. **Database Caching**
   - Query result caching
   - Redis for session storage
   - CDN for frequently accessed data

### Image Optimization

1. **Next.js Image Component**
   ```typescript
   import Image from 'next/image';
   
   <Image
     src="/images/hero.jpg"
     alt="Hero image"
     width={1200}
     height={600}
     quality={75}
     placeholder="blur"
     blurDataURL="data:image/jpeg;base64,..."
   />
   ```

2. **Responsive Images**
   - Multiple sizes for different devices
   - WebP format for modern browsers
   - Lazy loading for performance

## Scaling Considerations

### Horizontal Scaling

1. **Vercel Edge Network**
   - Global distribution of static assets
   - Edge functions for reduced latency
   - Automatic scaling based on traffic

2. **Database Scaling**
   - Supabase handles database scaling
   - Connection pooling for performance
   - Read replicas for high-traffic queries

### Vertical Scaling

1. **Compute Resources**
   - Vercel automatically scales compute
   - Serverless functions scale automatically
   - Resource limits configurable

2. **Storage Scaling**
   - Supabase Storage scales automatically
   - CDN distribution for global access
   - Backup and replication handled automatically

## Monitoring & Alerts

### Health Checks

1. **Application Health**
   ```typescript
   // pages/api/health.ts
   export default function handler(req: NextApiRequest, res: NextApiResponse) {
     res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
   }
   ```

2. **Database Health**
   ```typescript
   // lib/health.ts
   export async function checkDatabaseHealth() {
     try {
       const { data, error } = await supabase
         .from('users')
         .select('count')
         .limit(1);
       
       return !error;
     } catch (error) {
       return false;
     }
   }
   ```

### Alerting System

1. **Uptime Monitoring**
   - Monitor application uptime
   - Alert on downtime
   - SLA tracking

2. **Performance Alerts**
   - Alert on slow response times
   - Alert on high error rates
   - Alert on resource usage

## Rollback Procedures

### Automated Rollbacks

1. **Vercel Rollbacks**
   ```bash
   # List deployments
   vercel list
   
   # Rollback to previous deployment
   vercel rollback <deployment-id>
   ```

2. **Database Rollbacks**
   ```bash
   # Restore from backup
   supabase db reset
   # Apply backup
   ```

### Manual Rollbacks

1. **Git Rollbacks**
   ```bash
   # Revert to previous commit
   git revert <commit-hash>
   git push origin main
   ```

2. **Environment Rollbacks**
   - Restore environment variables
   - Revert database schema
   - Update DNS records if needed

## Post-Deployment Checklist

### Verification Steps

1. **Application Functionality**
   - [ ] Home page loads correctly
   - [ ] Authentication works (sign up, sign in, sign out)
   - [ ] Quest browsing and filtering
   - [ ] Profile management
   - [ ] All forms submit correctly

2. **Performance Metrics**
   - [ ] Page load times under 3 seconds
   - [ ] Core Web Vitals passing
   - [ ] API response times acceptable
   - [ ] Database query performance

3. **Security Checks**
   - [ ] SSL certificate valid
   - [ ] Security headers present
   - [ ] No console errors
   - [ ] Authentication working correctly

4. **Monitoring**
   - [ ] Error tracking configured
   - [ ] Analytics tracking working
   - [ ] Health checks passing
   - [ ] Alerts configured

This deployment documentation ensures consistent, reliable deployments with proper monitoring and rollback procedures.