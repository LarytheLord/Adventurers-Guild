import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Globe, Shield, Target, Trophy, Users, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuestApplyButton } from "@/components/quest-apply-button";

// Mock data for demonstration
interface Quest {
  id: string;
  title: string;
  company: string;
  description: string;
  rank: string;
  xp: string;
  reward: string;
  tags: string[];
  deadline: string;
  applicants: number;
  maxParticipants: number;
  location: string;
  requirements: string[];
  deliverables: string[];
}

const QUESTS: Record<string, Quest> = {
  "1": {
    id: "1",
    title: "Fix React Hydration Error",
    company: "TechCorp Inc.",
    description: "We are facing a persistent hydration error in our main dashboard component. The error seems to be related to a date formatting library mismatch between server and client. We need an experienced React developer to debug and fix this issue.",
    rank: "D",
    xp: "100 XP",
    reward: "500 Gold",
    tags: ["React", "Bug Fix", "Next.js"],
    deadline: "2023-12-31",
    applicants: 12,
    maxParticipants: 1,
    location: "Remote",
    requirements: [
      "Proficient in React and Next.js",
      "Understanding of SSR and Hydration",
      "Git version control"
    ],
    deliverables: [
      "Pull Request with the fix",
      "Explanation of the root cause",
      "Verification steps"
    ]
  },
  "2": {
    id: "2",
    title: "Build Landing Page Component",
    company: "StartupX",
    description: "We need a high-converting landing page component built with Tailwind CSS and Framer Motion. Design files will be provided in Figma.",
    rank: "C",
    xp: "250 XP",
    reward: "1200 Gold",
    tags: ["Frontend", "Tailwind", "Framer Motion"],
    deadline: "2024-01-15",
    applicants: 5,
    maxParticipants: 1,
    location: "Remote",
    requirements: [
      "Experience with Tailwind CSS",
      "Framer Motion animations",
      "Pixel-perfect implementation"
    ],
    deliverables: [
      "Responsive React Component",
      "Animation implementation",
      "Tests"
    ]
  }
};

export default function QuestPage({ params }: { params: { id: string } }) {
  // In a real app, fetch data based on params.id
  const quest = QUESTS[params.id] || QUESTS["1"]; 

  if (!quest) return notFound();

  const rankColors: Record<string, string> = {
    'D': 'bg-green-500',
    'C': 'bg-blue-500',
    'B': 'bg-purple-500',
    'A': 'bg-red-500',
    'S': 'bg-yellow-500',
  };

  return (
    <div className="container py-8 md:py-12 max-w-5xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="pl-0 hover:pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
          <Link href="/quests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quest Board
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Badge className={`${rankColors[quest.rank]} text-white px-3 py-1 text-sm`}>
                {quest.rank}-Rank Quest
              </Badge>
              <div className="flex gap-2">
                {quest.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{quest.title}</h1>
            <div className="flex items-center text-muted-foreground gap-2">
              <Globe className="h-4 w-4" />
              <span className="font-medium">{quest.company}</span>
              <span>•</span>
              <span>{quest.location}</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quest Brief</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                {quest.description}
              </p>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" /> Requirements
                </h3>
                <ul className="space-y-2">
                  {quest.requirements.map((req: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" /> Deliverables
                </h3>
                <ul className="space-y-2">
                  {quest.deliverables.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-2 border-primary/10 shadow-lg">
            <CardHeader>
              <CardTitle>Rewards & Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-500/10 p-4 rounded-lg text-center border border-yellow-500/20">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{quest.reward}</div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Bounty</div>
                </div>
                <div className="bg-blue-500/10 p-4 rounded-lg text-center border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{quest.xp}</div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Experience</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" /> Deadline
                  </span>
                  <span className="font-medium">{quest.deadline}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" /> Applicants
                  </span>
                  <span className="font-medium">{quest.applicants} Adventurers</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-muted-foreground">
                    <Shield className="h-4 w-4 mr-2" /> Min. Rank
                  </span>
                  <Badge variant="outline">{quest.rank}-Rank</Badge>
                </div>
              </div>

              <Separator />

              <QuestApplyButton questId={quest.id} />
              <p className="text-xs text-center text-muted-foreground">
                By accepting, you agree to the Guild&apos;s Code of Conduct.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}