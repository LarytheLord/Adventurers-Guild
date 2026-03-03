import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, TrendingUp, Zap, Clock } from "lucide-react";
import Link from "next/link";
import { RankBadge } from "@/components/ui/rank-badge";
import type { Rank } from "@/components/ui/rank-badge";

const XP_THRESHOLDS: Record<string, { next: string; required: number }> = {
  F: { next: "E", required: 500 },
  E: { next: "D", required: 1500 },
  D: { next: "C", required: 3500 },
  C: { next: "B", required: 7500 },
  B: { next: "A", required: 15000 },
  A: { next: "S", required: 30000 },
  S: { next: "S", required: 30000 },
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const userId = session?.user?.id;

  const [user, activeAssignments] = await Promise.all([
    userId
      ? prisma.user.findUnique({
          where: { id: userId },
          select: { xp: true, rank: true, skillPoints: true, name: true },
        })
      : null,
    userId
      ? prisma.questAssignment.findMany({
          where: {
            userId,
            status: { in: ["assigned", "started", "in_progress"] },
          },
          include: {
            quest: {
              select: { id: true, title: true, xpReward: true, monetaryReward: true, deadline: true },
            },
          },
          orderBy: { assignedAt: "desc" },
          take: 5,
        })
      : [],
  ]);

  const completedCount = userId
    ? await prisma.questAssignment.count({ where: { userId, status: "completed" } })
    : 0;

  const xp = user?.xp ?? 0;
  const rank = (user?.rank ?? "F") as Rank;
  const threshold = XP_THRESHOLDS[rank];
  const xpToNext = Math.max(0, threshold.required - xp);

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name ?? "Adventurer"}.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/quests">Find New Quests</Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{xp.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {rank === "S" ? "Max rank reached" : `${xpToNext.toLocaleString()} XP to ${threshold.next}-Rank`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Quests</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAssignments.length}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">Quests finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <RankBadge rank={rank} size="sm" />
              <span className="text-2xl font-bold">{rank}-Rank</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {user?.skillPoints ?? 0} skill points
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Quests */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Quests</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/my-quests">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {activeAssignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground border-2 border-dashed rounded-lg gap-3">
                <p>No active quests yet.</p>
                <Button size="sm" asChild>
                  <Link href="/dashboard/quests">Browse Quest Board</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeAssignments.map((a) => (
                  <Link
                    key={a.id}
                    href={`/dashboard/quests/${a.quest.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{a.quest.title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />{a.quest.xpReward} XP
                        </span>
                        {a.quest.monetaryReward && (
                          <span>${Number(a.quest.monetaryReward)}</span>
                        )}
                        {a.quest.deadline && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(a.quest.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-3 capitalize shrink-0">
                      {a.status.replace("_", " ")}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/quests">Quest Board</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/my-quests">My Quests</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/leaderboard">Leaderboard</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/profile">Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
