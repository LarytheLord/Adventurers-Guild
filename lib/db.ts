import { PrismaClient } from '@prisma/client';
import { env } from '@/lib/env';

type GlobalPrismaState = {
  prisma?: PrismaClient;
};

// Force early env validation for DB-dependent routes.
void env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as GlobalPrismaState;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
