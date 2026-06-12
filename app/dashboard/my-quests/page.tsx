import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma, withDbRetry } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MyQuestCard } from "@/components/my-quest-card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function MyQuestsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role === 'company') {
    redirect('/dashboard/company');
  }

  // Fetch user's assignments
  const assignments = await withDbRetry(() => prisma.questAssignment.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      quest: {
        include: {
          company: true,
        },
      },
    },
    orderBy: {
      assignedAt: 'desc',
    },
  }));

  return (
    <div className="container py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-2">My Quests</h1>
      <p className="text-muted-foreground mb-8">Manage your active quests and view your history.</p>

      <div className="grid gap-6">
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
              <div className="rounded-full bg-muted p-4 mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-center">No quests found</h3>
              <p className="text-muted-foreground mb-4 text-center text-sm sm:text-base">You haven&apos;t accepted any quests yet.</p>
              <Button asChild>
                <Link href="/dashboard/quests">Find Quests</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          assignments.map((assignment) => (
            <MyQuestCard key={assignment.id} initialAssignment={assignment} />
          ))
        )}
      </div>
    </div>
  );
}
