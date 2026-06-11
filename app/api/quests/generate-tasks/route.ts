import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';
import { generateDefaultTasks } from '@/lib/ai-generator';
import { z } from 'zod';

const generateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || (user.role !== 'company' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category } = generateSchema.parse(body);

    const tasks = generateDefaultTasks(title, description, category);

    return NextResponse.json({ tasks, success: true });
  } catch (error) {
    console.error('Failed to generate tasks:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message, success: false }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error', success: false }, { status: 500 });
  }
}
