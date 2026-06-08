// app/api/admin/quest-field-templates/route.ts
// Admin/PM CRUD for field templates — the "editable" half of DB-driven
// templates. The AI Product Manager (guild-ai) will eventually call the same
// endpoints to author templates from a client request.
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { QuestCategory, QuestType, Prisma } from '@prisma/client';
import { asFieldDefs } from '@/lib/quest-field-templates';

function validateBody(body: Record<string, unknown>): string | null {
  if (!body.name || String(body.name).trim() === '') return 'name is required';
  if (!Array.isArray(body.briefFields)) return 'briefFields must be an array';
  if (!Array.isArray(body.submissionFields)) return 'submissionFields must be an array';
  if (asFieldDefs(body.briefFields).length !== (body.briefFields as unknown[]).length)
    return 'every briefField needs a key and label';
  if (asFieldDefs(body.submissionFields).length !== (body.submissionFields as unknown[]).length)
    return 'every submissionField needs a key and label';
  if (body.questCategory && !Object.values(QuestCategory).includes(body.questCategory as QuestCategory))
    return 'invalid questCategory';
  if (body.questType && !Object.values(QuestType).includes(body.questType as QuestType))
    return 'invalid questType';
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, 'admin');
    if (!authUser) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });

    const templates = await prisma.questFieldTemplate.findMany({
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      include: { _count: { select: { quests: true } } },
    });
    return NextResponse.json({ templates, success: true });
  } catch (error) {
    console.error('Error listing templates:', error);
    return NextResponse.json({ error: 'Failed to list templates', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, 'admin');
    if (!authUser) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });

    const body = await request.json();
    const err = validateBody(body);
    if (err) return NextResponse.json({ error: err, success: false }, { status: 400 });

    const created = await prisma.questFieldTemplate.create({
      data: {
        name: String(body.name).trim(),
        description: body.description ? String(body.description) : null,
        questCategory: (body.questCategory as QuestCategory) ?? null,
        questType: (body.questType as QuestType) ?? null,
        briefFields: body.briefFields as Prisma.InputJsonValue,
        submissionFields: body.submissionFields as Prisma.InputJsonValue,
        defaultCriteria: Array.isArray(body.defaultCriteria) ? (body.defaultCriteria as string[]) : [],
        isActive: body.isActive !== false,
        isDefault: body.isDefault === true,
      },
    });
    return NextResponse.json({ template: created, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Failed to create template', success: false }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, 'admin');
    if (!authUser) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });

    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'id is required', success: false }, { status: 400 });
    const err = validateBody(body);
    if (err) return NextResponse.json({ error: err, success: false }, { status: 400 });

    const updated = await prisma.questFieldTemplate.update({
      where: { id },
      data: {
        name: String(body.name).trim(),
        description: body.description ? String(body.description) : null,
        questCategory: (body.questCategory as QuestCategory) ?? null,
        questType: (body.questType as QuestType) ?? null,
        briefFields: body.briefFields as Prisma.InputJsonValue,
        submissionFields: body.submissionFields as Prisma.InputJsonValue,
        defaultCriteria: Array.isArray(body.defaultCriteria) ? (body.defaultCriteria as string[]) : [],
        isActive: body.isActive !== false,
        isDefault: body.isDefault === true,
      },
    });
    return NextResponse.json({ template: updated, success: true });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'Failed to update template', success: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, 'admin');
    if (!authUser) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required', success: false }, { status: 400 });

    // Soft-disable rather than hard delete (quests may reference it).
    await prisma.questFieldTemplate.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Failed to delete template', success: false }, { status: 500 });
  }
}
