/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  serverExternalPackages: ['@prisma/client', 'prisma'],
};

// Import Sentry configuration (only wraps with Sentry if DSN is configured)
let sentryConfig = nextConfig;
try {
  const { withSentryConfig } = require('@sentry/nextjs');
  sentryConfig = withSentryConfig(nextConfig, {
    // For all available options, see:
    // https://github.com/getsentry/sentry-javascript/tree/develop/packages/nextjs/types/config/types.ts

    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,

    // Only print logs for Sentry initialization in CI
    silent: !process.env.CI,

    // Upload source maps to Sentry
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: false,

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors.
    automaticVercelMonitors: true,
  });
} catch {
  // Sentry not installed or misconfigured, use plain config
}

export default sentryConfig;
