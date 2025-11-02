/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

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

export default nextConfig;
