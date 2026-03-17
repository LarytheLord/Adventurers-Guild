import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { QuestTrack, UserRank, QuestCategory } from '@prisma/client';
import { notifyDiscord } from '@/lib/discord-notify';

interface HackathonQuestImport {
  hackathonEventId?: string;
  hackathonEventName?: string;
  hackathonLocation?: string;
  hackathonDate?: string;
  title: string;
  description: string;
  rank: string;
  track: string;
  partnerOrgName: string;
  problemStatement?: string;
  deliverables?: string[];
  acceptanceCriteria?: { id: string; description: string }[];
  techStack?: string[];
  originalTeamEmails?: string[];
  questCategory: string;
  xpReward: number;
  monetaryReward?: number;
  deadline?: string;
}

export async function POST(request: NextRequest) {
  const user = await requireAuth(request, 'admin');
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: HackathonQuestImport = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.partnerOrgName || !body.rank || !body.questCategory || !body.xpReward) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, partnerOrgName, rank, questCategory, xpReward' },
        { status: 400 }
      );
    }

    if (!Object.values(UserRank).includes(body.rank as UserRank)) {
      return NextResponse.json({ error: 'Invalid rank value' }, { status: 400 });
    }
    if (!Object.values(QuestCategory).includes(body.questCategory as QuestCategory)) {
      return NextResponse.json({ error: 'Invalid questCategory value' }, { status: 400 });
    }

    const track = (body.track as QuestTrack) || 'OPEN';
    if (!Object.values(QuestTrack).includes(track)) {
      return NextResponse.json({ error: 'Invalid track value' }, { status: 400 });
    }

    // Find or create hackathon event
    let hackathonEventId = body.hackathonEventId;
    if (!hackathonEventId && body.hackathonEventName) {
      const event = await prisma.hackathonEvent.create({
        data: {
          name: body.hackathonEventName,
          location: body.hackathonLocation || 'Remote',
          date: body.hackathonDate ? new Date(body.hackathonDate) : new Date(),
        },
      });
      hackathonEventId = event.id;
    }

    // Build detailed description from structured fields
    let detailedDescription = body.problemStatement || '';
    if (body.deliverables?.length) {
      detailedDescription += '\n\n## Deliverables\n' + body.deliverables.map((d) => `- ${d}`).join('\n');
    }
    if (body.acceptanceCriteria?.length) {
      detailedDescription += '\n\n## Acceptance Criteria\n' + body.acceptanceCriteria.map((c) => `- [${c.id}] ${c.description}`).join('\n');
    }

    // Create the quest
    const quest = await prisma.quest.create({
      data: {
        title: body.title,
        description: body.description,
        detailedDescription: detailedDescription || null,
        questType: 'commission',
        difficulty: body.rank as UserRank,
        xpReward: body.xpReward,
        monetaryReward: body.monetaryReward ?? null,
        requiredSkills: body.techStack || [],
        questCategory: body.questCategory as QuestCategory,
        track,
        source: 'HACKATHON',
        partnerOrgName: body.partnerOrgName,
        hackathonEventId: hackathonEventId || null,
        status: 'available',
        deadline: body.deadline ? new Date(body.deadline) : null,
      },
    });

    // Increment hackathon event quest counter
    if (hackathonEventId) {
      await prisma.hackathonEvent.update({
        where: { id: hackathonEventId },
        data: { questsCreated: { increment: 1 } },
      });
    }

    await notifyDiscord(
      'quests',
      `New hackathon quest imported: "${body.title}" (${body.rank}-Rank) from ${body.partnerOrgName}`
    );

    return NextResponse.json({
      success: true,
      quest,
      hackathonEventId,
    }, { status: 201 });
  } catch (error) {
    console.error('Error importing hackathon quest:', error);
    return NextResponse.json({ error: 'Failed to import hackathon quest' }, { status: 500 });
  }
}
