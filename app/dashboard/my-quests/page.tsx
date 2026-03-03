import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuestSubmissionDialog } from "@/components/quest-submission-dialog";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
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
  const assignments = await prisma.questAssignment.findMany({
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
  });

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">My Quests</h1>
      <p className="text-muted-foreground mb-8">Manage your active quests and view your history.</p>

      <div className="grid gap-6">
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-4 mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No quests found</h3>
              <p className="text-muted-foreground mb-4">You haven&apos;t accepted any quests yet.</p>
              <Button asChild>
                <Link href="/dashboard/quests">Find Quests</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          assignments.map((assignment) => (
            <Card key={assignment.id} className="flex flex-col md:flex-row overflow-hidden">
              <div className={`w-2 md:w-2 ${
                assignment.status === 'completed' ? 'bg-green-500' :
                assignment.status === 'assigned' ? 'bg-blue-500' :
                assignment.status === 'submitted' ? 'bg-yellow-500' :
                'bg-gray-300'
              }`} />
              <div className="flex-1 flex flex-col md:flex-row">
                <div className="flex-1 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={
                      assignment.status === 'completed' ? 'default' :
                      assignment.status === 'assigned' ? 'secondary' :
                      'outline'
                    }>
                      {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {assignment.quest.company?.name}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{assignment.quest.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Due {assignment.quest.deadline ? new Date(assignment.quest.deadline).toLocaleDateString() : 'No deadline'}
                    </span>
                    <span>{assignment.quest.xpReward} XP</span>
                    {assignment.quest.monetaryReward && <span>${Number(assignment.quest.monetaryReward)}</span>}
                  </div>
                </div>
                <div className="p-6 bg-muted/30 flex items-center justify-end gap-3 border-t md:border-t-0 md:border-l">
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/quests/${assignment.quest.id}`}>View Details</Link>
                  </Button>
                  
                  {assignment.status === 'assigned' && (
                    <QuestSubmissionDialog 
                      questId={assignment.quest.id} 
                      questTitle={assignment.quest.title} 
                    />
                  )}
                  
                  {assignment.status === 'submitted' && (
                    <Button disabled variant="secondary">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Under Review
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
