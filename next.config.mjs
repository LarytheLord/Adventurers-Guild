import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  outputFileTracingRoot: __dirname,
  reactStrictMode: true,
  serverExternalPackages: ['@prisma/client', 'prisma'],
};

export default nextConfig;
