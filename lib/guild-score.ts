import { prisma } from './db';
import { Prisma } from '@prisma/client';

export async function recalculateGuildScore(userId: string, tx?: Prisma.TransactionClient) {
  const client = tx || prisma;

  // 1. Delivery Rate
  const completedCount = await client.questAssignment.count({
    where: { userId, startedAt: { not: null }, status: 'completed' },
  });
  const totalFinishedCount = await client.questAssignment.count({
    where: { userId, startedAt: { not: null }, status: { in: ['completed', 'cancelled'] } },
  });
  const deliveryRate = totalFinishedCount === 0 ? 100.0 : (completedCount / totalFinishedCount) * 100;

  // 2. On-Time Rate
  const completedAssignments = await client.questAssignment.findMany({
    where: { userId, status: 'completed' },
    select: {
      completedAt: true,
      quest: {
        select: {
          deadline: true,
        },
      },
    },
  });
  let onTimeCount = 0;
  for (const ass of completedAssignments) {
    if (!ass.quest.deadline || (ass.completedAt && ass.completedAt <= ass.quest.deadline)) {
      onTimeCount++;
    }
  }
  const onTimeRate = completedAssignments.length === 0 ? 100.0 : (onTimeCount / completedAssignments.length) * 100;

  // 3. Update Consistency
  const startedAssignments = await client.questAssignment.findMany({
    where: { userId, startedAt: { not: null } },
    select: {
      id: true,
      startedAt: true,
      completedAt: true,
      dailyUpdates: {
        select: {
          id: true,
        },
      },
    },
  });
  let totalExpected = 0;
  let totalActual = 0;
  for (const ass of startedAssignments) {
    const endTime = ass.completedAt ?? new Date();
    const durationMs = endTime.getTime() - ass.startedAt!.getTime();
    const expectedForThis = Math.floor(durationMs / (1000 * 60 * 60 * 24));
    totalExpected += expectedForThis;
    totalActual += ass.dailyUpdates.length;
  }
  const updateConsistency = totalExpected === 0 ? 100.0 : Math.min(100.0, (totalActual / totalExpected) * 100);

  // 4. Guild Score
  const guildScore = Math.round((deliveryRate + onTimeRate + updateConsistency) / 3);

  // Update profile
  await client.adventurerProfile.update({
    where: { userId },
    data: {
      guildScore,
      deliveryRate: new Prisma.Decimal(deliveryRate.toFixed(2)),
      onTimeRate: new Prisma.Decimal(onTimeRate.toFixed(2)),
      updateConsistency: new Prisma.Decimal(updateConsistency.toFixed(2)),
    },
  });

  return {
    guildScore,
    deliveryRate,
    onTimeRate,
    updateConsistency,
  };
}
