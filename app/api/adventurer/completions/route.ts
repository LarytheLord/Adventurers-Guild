import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const completions = await prisma.questCompletion.findMany({
      where: {
        userId: authUser.id,
      },
      include: {
        quest: {
          select: {
            title: true,
            difficulty: true,
            category: true,
          },
        },
      },
      orderBy: {
        completionDate: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      completions: completions.map((c) => ({
        id: c.id,
        questTitle: c.quest.title,
        difficulty: c.quest.difficulty,
        questCategory: c.quest.category,
        xpEarned: c.xpEarned,
        qualityScore: c.qualityScore,
        completionDate: c.completionDate,
      })),
    });
  } catch (error) {
    console.error("Completions API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}