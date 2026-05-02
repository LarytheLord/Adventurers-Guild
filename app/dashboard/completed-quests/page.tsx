import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Completion = {
  id: string;
  questTitle: string;
  difficulty: string;
  questCategory: string;
  xpEarned: number;
  qualityScore: number;
  completionDate: string;
};

// Fetch from your API
async function getCompletions(): Promise<Completion[]> {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/adventurer/completions`,
    { cache: "no-store" }
  );

  if (!res.ok) return [];

  const data = await res.json();
  return data.completions || [];
}

export default async function CompletedQuestsPage() {
  const session = await getServerSession(authOptions);

  // 🔐 Auth guard
  if (!session) {
    redirect("/login");
  }

  const completions = await getCompletions();

  // 📊 Stats
  const totalXP = completions.reduce(
    (sum, c) => sum + c.xpEarned,
    0
  );

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">
        Completed Quests
      </h1>
      <p className="text-muted-foreground mb-6">
        Your full quest completion history.
      </p>

      {/* Stats Row */}
      <div className="flex gap-6 mb-6">
        <div className="bg-muted p-4 rounded-xl">
          <p className="text-sm text-muted-foreground">
            Total XP Earned
          </p>
          <p className="text-xl font-bold">{totalXP}</p>
        </div>

        <div className="bg-muted p-4 rounded-xl">
          <p className="text-sm text-muted-foreground">
            Quests Completed
          </p>
          <p className="text-xl font-bold">
            {completions.length}
          </p>
        </div>
      </div>

      {/* Empty State */}
      {completions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              No completed quests yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {completions.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg">
                    {c.questTitle}
                  </h3>

                  <Badge>{c.difficulty}</Badge>
                </div>

                <div className="text-sm text-muted-foreground flex flex-wrap gap-4">
                  <span>XP: {c.xpEarned}</span>
                  <span>Quality: {c.qualityScore}</span>
                  <span>
                    {new Date(
                      c.completionDate
                    ).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}