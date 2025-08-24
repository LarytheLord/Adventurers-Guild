import { Database } from "@/types/supabase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, DollarSign, Trophy, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Quest = Database['public']['Tables']['quests']['Row'];

export default function QuestBoard({ quests }: { quests: Quest[] }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
      {quests.map((quest) => (
        <QuestCard key={quest.id} quest={quest} />
      ))}
    </div>
  );
}

function QuestCard({ quest }: { quest: Quest }) {
    const rankColor = {
        S: 'bg-yellow-500 text-black',
        A: 'bg-red-500 text-white',
        B: 'bg-blue-500 text-white',
        C: 'bg-green-500 text-white',
        D: 'bg-gray-500 text-white',
        F: 'bg-gray-400 text-white',
      }[quest.difficulty] || 'bg-gray-400';

  return (
    <Card className="bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 overflow-hidden flex flex-col">
      <CardHeader className="p-0">
        <Image src="/images/quest-board.png" alt={quest.title} width={400} height={225} className="w-full h-40 sm:h-48 object-cover" />
      </CardHeader>
      <CardContent className="p-4 sm:p-6 flex-grow">
        <div className="flex items-center justify-between mb-3">
          <Badge className={`${rankColor} text-xs sm:text-sm`}>{quest.difficulty}-Rank</Badge>
          <span className="text-xs text-muted-foreground">{quest.company_name}</span>
        </div>
        <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3">{quest.title}</CardTitle>
        {quest.description && <CardDescription className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed mb-4">
          {quest.description}
        </CardDescription>}
        <div className="flex flex-wrap gap-1 mb-4">
          {quest.tags && quest.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 sm:p-6 bg-card-foreground/5 flex flex-col gap-3">
        <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
          <span className="flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            ${quest.budget}
          </span>
          <span className="flex items-center">
            <Trophy className="w-4 h-4 mr-1" />
            {quest.xp_reward} XP
          </span>
          <span className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {quest.applications_count}
          </span>
        </div>
        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm sm:text-base">
          <Link href={`/quests/${quest.id}`}>
            View Quest <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}