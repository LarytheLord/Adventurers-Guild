// app/api/quest-field-templates/route.ts
// Active field templates — read-only. Used by the create-quest brief form to
// adapt fields to the selected work type. Available to company + admin.
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, 'company', 'admin');
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const templates = await prisma.questFieldTemplate.findMany({
      where: { isActive: true },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        description: true,
        questCategory: true,
        questType: true,
        briefFields: true,
        submissionFields: true,
        defaultCriteria: true,
        isDefault: true,
      },
    });

    return NextResponse.json({ templates, success: true });
  } catch (error) {
    console.error('Error fetching quest field templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates', success: false }, { status: 500 });
  }
}
