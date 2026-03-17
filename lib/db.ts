import { PrismaClient, Prisma } from '@prisma/client';
import { env } from '@/lib/env';

type GlobalPrismaState = {
  prisma?: PrismaClient;
};

// Force early env validation for DB-dependent routes.
void env.DATABASE_URL;

const runtimeDatabaseUrl =
  process.env.NODE_ENV === 'production'
    ? env.DATABASE_URL
    : env.DATABASE_URL_UNPOOLED || env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as GlobalPrismaState;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: runtimeDatabaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Retries a DB operation on Neon cold-start connection errors.
 * Neon's Scale-to-Zero feature suspends the compute; the first
 * connection attempt can fail before the compute wakes up.
 */
export async function withDbRetry<T>(fn: () => Promise<T>, maxAttempts = 5): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      const isInitError = err instanceof Prisma.PrismaClientInitializationError;
      const isConnError =
        err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P1001';
      const hasReachabilityMessage =
        err instanceof Error && err.message.includes("Can't reach database server");
      if (isInitError || isConnError || hasReachabilityMessage) {
        await new Promise(r => setTimeout(r, 500 * attempt));
        continue;
      }
      throw err;
    }
  }
  // unreachable
  throw new Error('withDbRetry: exhausted attempts');
}
