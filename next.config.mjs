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
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextPwa({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching,
})(nextConfig);
