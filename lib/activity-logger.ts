// lib/activity-logger.ts
import { prisma } from './db';
import { Prisma, PrismaClient } from '@prisma/client';
import { ACTIVITY_POINTS } from './activity-points';

export async function logActivity(
  userId: string,
  action: string,
  metadata?: Record<string, unknown>,
  db?: PrismaClient | Prisma.TransactionClient
) {
  const client = db || prisma;
  const points = ACTIVITY_POINTS[action] ?? 0;
  await client.activityLog.create({
    data: { 
      userId, 
      action, 
      points, 
      metadata: metadata as Prisma.InputJsonValue 
    },
  });
}
