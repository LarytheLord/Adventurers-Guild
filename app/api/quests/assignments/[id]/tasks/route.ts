import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/api-auth';
import { z } from 'zod';

const taskToggleSchema = z.object({
  taskName: z.string().min(1, 'Task name is required'),
  completed: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  try {
    const assignmentId = params.id;
    const body = await request.json();
    const { taskName, completed } = taskToggleSchema.parse(body);

    // Fetch assignment and its quest tasks
    const assignment = await prisma.questAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        quest: {
          select: {
            tasks: true,
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found', success: false }, { status: 404 });
    }

    if (assignment.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized to modify tasks for this assignment', success: false }, { status: 403 });
    }

    // Calculate new completedTasks array
    let completedTasks = [...assignment.completedTasks];
    if (completed) {
      if (!completedTasks.includes(taskName)) {
        completedTasks.push(taskName);
      }
    } else {
      completedTasks = completedTasks.filter((t) => t !== taskName);
    }

    // Calculate progress percentage
    const totalTasks = assignment.quest.tasks.length;
    const progress = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

    const updatedAssignment = await prisma.questAssignment.update({
      where: { id: assignmentId },
      data: {
        completedTasks,
        progress: Number(progress.toFixed(2)),
      },
      select: {
        id: true,
        completedTasks: true,
        progress: true,
      },
    });

    return NextResponse.json({ assignment: updatedAssignment, success: true });
  } catch (error) {
    console.error('Failed to update task completion:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message, success: false }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error', success: false }, { status: 500 });
  }
}
