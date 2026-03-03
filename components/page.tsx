import RankingsBoard from "@/components/RankingsBoard";
import { Trophy } from "lucide-react";

export default function LeaderboardPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col items-center text-center mb-8 space-y-4">
        <div className="p-3 bg-yellow-100 rounded-full dark:bg-yellow-900/20">
          <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Adventurer Leaderboard</h1>
        <p className="text-muted-foreground max-w-2xl">
          The most legendary adventurers in the guild. Earn XP by completing quests to climb the ranks.
        </p>
      </div>

      <RankingsBoard showUserPosition={true} limit={50} />
    </div>
  );
}