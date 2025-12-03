/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  transpilePackages: ['next-auth'],
};

export default nextConfig;
