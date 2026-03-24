import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { notifyDiscord } from '@/lib/discord-notify';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET — list revision requests for a quest
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id: questId } = await props.params;
  const user = await requireAuth(request, 'company', 'admin');
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!UUID_REGEX.test(questId)) {
    return NextResponse.json({ error: 'Invalid quest ID' }, { status: 400 });
  }

  try {
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      select: {
        id: true,
        companyId: true,
        revisionCount: true,
        maxRevisions: true,
        revisionRequests: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
    }

    // Only quest owner or admin can view revisions
    if (user.role !== 'admin' && quest.companyId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      revisionCount: quest.revisionCount,
      maxRevisions: quest.maxRevisions,
      canRequestRevision: quest.revisionCount < quest.maxRevisions,
      revisions: quest.revisionRequests,
    });
  } catch (error) {
    console.error('Error fetching revisions:', error);
    return NextResponse.json({ error: 'Failed to fetch revisions' }, { status: 500 });
  }
}

// POST — create a new revision request (structured modification form)
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id: questId } = await props.params;
  const user = await requireAuth(request, 'company', 'admin');
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!UUID_REGEX.test(questId)) {
    return NextResponse.json({ error: 'Invalid quest ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { unmetCriteria, description, isNewScope } = body;

    // Validate required fields
    if (!unmetCriteria || !Array.isArray(unmetCriteria) || unmetCriteria.length === 0) {
      return NextResponse.json(
        { error: 'At least one unmet criterion must be specified' },
        { status: 400 }
      );
    }
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }
    if (description.length > 1000) {
      return NextResponse.json(
        { error: 'Description must be 1000 characters or fewer' },
        { status: 400 }
      );
    }

    // Fetch quest with ownership check
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      select: {
        id: true,
        title: true,
        companyId: true,
        revisionCount: true,
        maxRevisions: true,
        status: true,
      },
    });

    if (!quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
    }

    if (user.role !== 'admin' && quest.companyId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // If new scope flagged, don't create revision — tell client to create a new quest
    if (isNewScope) {
      return NextResponse.json({
        success: false,
        escalation: true,
        message: 'This request contains new requirements. Please create a new quest for the additional scope.',
      });
    }

    // Check revision cap
    if (quest.revisionCount >= quest.maxRevisions) {
      // Escalate — create an ESCALATED revision request
      const revision = await prisma.revisionRequest.create({
        data: {
          questId,
          unmetCriteria,
          description: description.trim(),
          isNewScope: false,
          status: 'ESCALATED',
        },
      });

      await notifyDiscord(
        'alerts',
        `Quest "${quest.title}" has hit the revision cap (${quest.maxRevisions}). Escalated for review team investigation.`
      );

      return NextResponse.json({
        success: true,
        escalated: true,
        message: `Revision limit reached (${quest.maxRevisions}/${quest.maxRevisions}). This quest has been escalated for review team investigation.`,
        revision,
      });
    }

    // Create revision request and increment counter
    const [revision] = await prisma.$transaction([
      prisma.revisionRequest.create({
        data: {
          questId,
          unmetCriteria,
          description: description.trim(),
          isNewScope: false,
          status: 'PENDING',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      }),
      prisma.quest.update({
        where: { id: questId },
        data: { revisionCount: { increment: 1 } },
      }),
    ]);

    await notifyDiscord(
      'reviews',
      `Revision requested on quest "${quest.title}" (${quest.revisionCount + 1}/${quest.maxRevisions}). ${unmetCriteria.length} criteria flagged.`
    );

    return NextResponse.json({
      success: true,
      escalated: false,
      remainingRevisions: quest.maxRevisions - quest.revisionCount - 1,
      revision,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating revision request:', error);
    return NextResponse.json({ error: 'Failed to create revision request' }, { status: 500 });
  }
}
