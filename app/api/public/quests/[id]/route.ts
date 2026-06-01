/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma, withDbRetry } from '@/lib/db';
import { QuestStatus, QuestTrack } from '@prisma/client';

interface QuestParams {
  id: string;
}

export async function GET(
  _req: NextRequest,
  props: { params: Promise<QuestParams> }
) {
  const { id } = await props.params;

  try {
    const quest = await withDbRetry(() =>
      prisma.quest.findUnique({
        where: { id },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              companyProfile: {
                select: { companyName: true },
              },
            },
          },
          parentQuest: {
            select: {
              id: true,
              title: true,
              difficulty: true,
              track: true,
              status: true,
            },
          },
          subQuests: {
            select: {
              id: true,
              title: true,
              difficulty: true,
              track: true,
              status: true,
            },
            orderBy: { createdAt: 'asc' },
          },
          assignments: {
            select: {
              id: true,
              status: true,
              _count: { select: { submissions: true } },
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                  rank: true,
                },
              },
            },
          },
          party: {
            select: {
              id: true,
              leaderId: true,
              maxSize: true,
              track: true,
              members: {
                select: {
                  id: true,
                  isLeader: true,
                  joinedAt: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      avatar: true,
                      rank: true,
                    },
                  },
                },
                orderBy: { joinedAt: 'asc' },
              },
            },
          },
        },
      })
    );

    if (!quest) {
      return NextResponse.json(
        { success: false, error: 'Quest not found' },
        { status: 404 }
      );
    }

    // Only show OPEN and BOOTCAMP track quests publicly (no INTERN for public view)
    if (quest.track === QuestTrack.INTERN) {
      return NextResponse.json(
        { success: false, error: 'Quest not found' },
        { status: 404 }
      );
    }

    const q = quest as any;
    const shaped = {
      id: q.id,
      title: q.title,
      description: q.description,
      detailedDescription: q.detailedDescription,
      company: q.company?.companyProfile?.companyName || q.company?.name || 'Unknown Company',
      companyAvatar: q.company?.avatar || null,
      companyEmail: q.company?.email || null,
      difficulty: q.difficulty,
      xpReward: q.xpReward,
      skillPointsReward: q.skillPointsReward,
      monetaryReward: q.monetaryReward ? Number(q.monetaryReward) : null,
      deadline: q.deadline ? q.deadline.toISOString() : null,
      requiredSkills: q.requiredSkills || [],
      requiredRank: q.requiredRank || null,
      maxParticipants: q.maxParticipants,
      questCategory: q.questCategory,
      track: q.track,
      source: q.source,
      status: q.status,
      applicants: q.assignments.length,
      createdAt: q.createdAt.toISOString(),
      updatedAt: q.updatedAt.toISOString(),
      submissionInstructions: q.submissionInstructions || null,
      expectedDeliverables: q.expectedDeliverables || null,
      attachments: q.attachments || null,
      clientResources: q.clientResources || [],
      reviewNotes: null,
      parentQuest: quest.parentQuest
        ? {
            id: quest.parentQuest.id,
            title: quest.parentQuest.title,
            difficulty: quest.parentQuest.difficulty,
            status: quest.parentQuest.status,
          }
        : null,
      subQuests: quest.subQuests.map((sq) => ({
        id: sq.id,
        title: sq.title,
        difficulty: sq.difficulty,
        status: sq.status,
      })),
      party: quest.party
        ? {
            id: quest.party.id,
            leaderId: quest.party.leaderId,
            maxSize: quest.party.maxSize,
            track: quest.party.track,
            members: quest.party.members.map((m) => ({
              id: m.id,
              isLeader: m.isLeader,
              joinedAt: m.joinedAt.toISOString(),
              user: {
                id: m.user.id,
                name: m.user.name,
                avatar: m.user.avatar || null,
                rank: m.user.rank,
              },
            })),
          }
        : null,
    };

    return NextResponse.json({ success: true, quest: shaped });
  } catch (error) {
    console.error('Error fetching public quest:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quest' },
      { status: 500 }
    );
  }
}