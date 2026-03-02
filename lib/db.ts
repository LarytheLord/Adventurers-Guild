import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

// Prevent multiple Prisma instances in development (hot-reload)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaNeon(pool as any);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
