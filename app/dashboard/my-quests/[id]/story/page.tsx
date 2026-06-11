import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma, withDbRetry } from "@/lib/db";
import { StoryClient } from "./story-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quest Story - Adventurers Guild",
};

export default async function QuestStoryPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const assignment = await withDbRetry(() => prisma.questAssignment.findUnique({
    where: {
      questId_userId: {
        questId: params.id,
        userId: session.user.id,
      }
    },
    include: {
      quest: {
        include: { company: true },
      },
      dailyUpdates: {
        orderBy: { createdAt: 'desc' },
      }
    }
  }));

  if (!assignment) {
    redirect("/dashboard/my-quests");
  }

  return <StoryClient assignment={assignment} quest={assignment.quest} updates={assignment.dailyUpdates} />;
}
