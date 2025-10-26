import nextPwa from 'next-pwa';

/** @type {import('next-pwa').RuntimeCaching[]} */
const runtimeCaching = [
  {
    urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'google-fonts',
      expiration: {
        maxEntries: 4,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      },
    },
  },
  {
    urlPattern: /\.(?:js|css)$/,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-resources',
    },
  },
  {
    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|mp4)$/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'images',
      expiration: {
        maxEntries: 64,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  {
    urlPattern: /^\/$/, // homepage
    handler: 'NetworkFirst',
    options: {
      cacheName: 'start-url',
    },
  },
  {
    urlPattern: /^\/.*$/, // all other routes
    handler: 'NetworkFirst',
    options: {
      cacheName: 'pages',
      networkTimeoutSeconds: 15,
      expiration: {
        maxEntries: 64,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      },
    },
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // REMOVED: eslint.ignoreDuringBuilds - We should fix linting errors instead
  // REMOVED: typescript.ignoreBuildErrors - We should fix TypeScript errors instead
  
  images: {
    unoptimized: true,
  },
  // Production optimizations
  reactStrictMode: true,
  // Note: swcMinify is enabled by default in Next.js 15
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true,
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes in your app
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
        ],
      },
    ]
  },
  webpack: (config, { isServer, nextRuntime }) => {
    // Production-specific optimizations
    if (!isServer && nextRuntime === 'nodejs') {
      // Server-side optimizations
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Enable tree shaking - removed usedExports as it conflicts with cacheUnaffected
    config.optimization = {
      ...config.optimization,
      sideEffects: false,
      minimize: true,
    };

    return config;
  },
};

export default nextPwa({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching,
})(nextConfig);
