import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export interface QuestCardProps {
  id?: string;
  rank: 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
  title: string;
  company: string;
  reward: string;
  xp: string;
  tags: string[];
}

export function QuestCard({ id, rank, title, company, reward, xp, tags }: QuestCardProps) {
  const rankColors: Record<string, string> = {
    'F': 'bg-gray-500 hover:bg-gray-600',
    'E': 'bg-slate-500 hover:bg-slate-600',
    'D': 'bg-green-500 hover:bg-green-600',
    'C': 'bg-emerald-500 hover:bg-emerald-600',
    'B': 'bg-amber-500 hover:bg-amber-600',
    'A': 'bg-orange-500 hover:bg-orange-600',
    'S': 'bg-red-500 hover:bg-red-600',
  };

  return (
    <Card className="hover:shadow-md transition-all cursor-pointer group flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Badge className={`${rankColors[rank]} mb-2`}>
            {rank}-Rank
          </Badge>
          <span className="text-xs font-medium text-muted-foreground">{xp}</span>
        </div>
        <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">{title}</CardTitle>
        <CardDescription className="line-clamp-1">{company}</CardDescription>
      </CardHeader>
      <CardContent className="pb-3 flex-grow">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t flex justify-between items-center mt-auto">
        <span className="font-bold text-yellow-600 dark:text-yellow-400 flex items-center text-sm">
          💰 {reward}
        </span>
        <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity" asChild>
           <Link href={`/quests/${id || '#'}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
