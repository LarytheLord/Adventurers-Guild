import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma, withDbRetry } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuestSubmissionDialog } from "@/components/quest-submission-dialog";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

// ✅ Status config (clean + scalable)
const statusConfig: Record<
  string,
  { color: string; variant: "default" | "secondary" | "outline" }
> = {
  completed: { color: "bg-green-500", variant: "default" },
  assigned: { color: "bg-blue-500", variant: "secondary" },
  submitted: { color: "bg-yellow-500", variant: "outline" },
};

// ✅ Helpers
const formatDate = (date?: string | Date | null) =>
  date ? new Date(date).toLocaleDateString() : "No deadline";

const formatCurrency = (amount?: number | null) =>
  amount ? `$${amount.toFixed(2)}` : null;

export default async function MyQuestsPage() {
  const session = await getServerSession(authOptions);

  // 🔐 Auth guards
  if (!session) {
    redirect("/login");
  }

  if (session.user.role === "company") {
    redirect("/dashboard/company");
  }

  // 📦 Fetch assignments safely
  let assignments: any[] = [];

  try {
    assignments = await withDbRetry(() =>
      prisma.questAssignment.findMany({
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
          assignedAt: "desc",
        },
      })
    );
  } catch (error) {
    console.error("Failed to fetch assignments:", error);
  }

  return (
    <div className="container py-8">
      {/* 🔝 Header with navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Quests</h1>
          <p className="text-muted-foreground">
            Manage your active quests and view your history.
          </p>
        </div>

        <Button variant="outline" asChild>
          <Link href="/dashboard/completed-quests">
            View Completed
          </Link>
        </Button>
      </div>

      {/* 📋 Content */}
      <div className="grid gap-6">
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 sm:py-12 px-4">
              <div className="rounded-full bg-muted p-4 mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>

              <h3 className="text-lg font-semibold mb-2 text-center">
                No quests found
              </h3>

              <p className="text-muted-foreground mb-4 text-center text-sm sm:text-base">
                You haven&apos;t accepted any quests yet.
              </p>

              <Button asChild>
                <Link href="/dashboard/quests">Find Quests</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          assignments.map((assignment) => {
            const config =
              statusConfig[assignment.status] || {
                color: "bg-gray-300",
                variant: "outline",
              };

            return (
              <Card
                key={assignment.id}
                className="flex flex-col md:flex-row overflow-hidden"
              >
                {/* Status Indicator */}
                <div className={`w-2 ${config.color}`} />

                <div className="flex-1 flex flex-col md:flex-row">
                  {/* Left Content */}
                  <div className="flex-1 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={config.variant}>
                        {assignment.status.charAt(0).toUpperCase() +
                          assignment.status.slice(1)}
                      </Badge>

                      <span className="text-sm text-muted-foreground">
                        {assignment.quest.company?.name || "Unknown Company"}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold mb-2">
                      {assignment.quest.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Due {formatDate(assignment.quest.deadline)}
                      </span>

                      <span>{assignment.quest.xpReward} XP</span>

                      {assignment.quest.monetaryReward && (
                        <span>
                          {formatCurrency(
                            Number(assignment.quest.monetaryReward)
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="p-6 bg-muted/30 flex items-center justify-end gap-3 border-t md:border-t-0 md:border-l">
                    <Button variant="outline" asChild>
                      <Link
                        href={`/dashboard/quests/${assignment.quest.id}`}
                      >
                        View Details
                      </Link>
                    </Button>

                    {/* Submit */}
                    {assignment.status === "assigned" && (
                      <QuestSubmissionDialog
                        questTitle={assignment.quest.title}
                        assignmentId={assignment.id}
                      />
                    )}

                    {/* Under Review */}
                    {assignment.status === "submitted" && (
                      <Button disabled variant="secondary">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Under Review
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}