/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  serverExternalPackages: ['@prisma/client', 'prisma'],
};

export default nextConfig;
