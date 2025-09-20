"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  ArrowRight,
  Github,
  Linkedin,
  Menu,
  Search,
  Star,
  Twitter,
  X,
  Sparkles,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { SkillTree } from "@/components/skill-tree";
import { QuestCompletion } from "@/components/quest-completion";

import AdventureSearch from "@/components/AdventureSearch";
import AdventureFilter from "@/components/AdventureFilter";

// --- MOCK DATA ---
const quests = [
  {
    title: "Bug Bounty Brigades",
    description:
      "Hunt down and squash bugs in existing codebases. A great way to learn and earn XP.",
    image: "/images/quest-board.png",
    rank: "C",
    xp: 500,
  },
  {
    title: "Digital Archaeology",
    description:
      "Explore and document legacy codebases. Uncover hidden gems and learn from the past.",
    image: "/images/quest-board.png",
    rank: "B",
    xp: 800,
  },
  {
    title: "Narrative-Driven Hackathons",
    description:
      "Participate in themed hackathons with engaging storylines. Build innovative solutions and win prizes.",
    image: "/images/quest-board.png",
    rank: "A",
    xp: 1200,
  },
  {
    title: "UI/UX Redesign Challenge",
    description:
      "Redesign the user interface of a popular open-source application. Focus on usability and modern design principles.",
    image: "/images/quest-board.png",
    rank: "B",
    xp: 750,
  },
  {
    title: "Open Source Contribution",
    description:
      "Contribute to a major open-source project. Add a new feature, fix a critical bug, or improve documentation.",
    image: "/images/quest-board.png",
    rank: "S",
    xp: 2000,
  },
  {
    title: "Code Refactoring Quest",
    description:
      "Refactor a messy codebase to improve its readability, performance, and maintainability.",
    image: "/images/quest-board.png",
    rank: "D",
    xp: 300,
  },
];

const user = {
  name: "LaryTheLord",
  avatar: "/placeholder-user.jpg",
  rank: "S",
  xp: 24500,
  xpNextLevel: 25000,
};

// --- REUSABLE COMPONENTS ---

function QuestCard({ quest }: { quest: (typeof quests)[0] }) {
  const rankColor =
    {
      S: "bg-yellow-500 text-black",
      A: "bg-red-500 text-white",
      B: "bg-blue-500 text-white",
      C: "bg-green-500 text-white",
      D: "bg-gray-500 text-white",
    }[quest.rank] || "bg-gray-400";

  return (
    <Card className="bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 overflow-hidden flex flex-col">
      <CardHeader className="p-0">
        <Image
          src={quest.image}
          alt={quest.title}
          width={400}
          height={225}
          className="w-full h-40 sm:h-48 object-cover"
        />
      </CardHeader>
      <CardContent className="p-4 sm:p-6 flex-grow">
        <Badge className={`mb-3 sm:mb-4 ${rankColor} text-xs sm:text-sm`}>
          {quest.rank}-Rank
        </Badge>
        <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3">
          {quest.title}
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">
          {quest.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 sm:p-6 bg-card-foreground/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="font-bold text-base sm:text-lg text-primary">
          {quest.xp} XP
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold w-full sm:w-auto text-sm sm:text-base">
          View Quest <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function UserDashboard() {
  return (
    <section
      id="profile"
      className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-card text-card-foreground"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8 sm:gap-12 items-center">
          <div className="lg:col-span-2">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-3 sm:mb-4 text-foreground leading-tight">
              Welcome Back, Adventurer!
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed mb-6 sm:mb-8">
              Ready to embark on a new quest and forge your legend?
            </p>
            {/* Feature Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
              <SkillTree />
              <QuestCompletion />
            </div>
          </div>
          <Card className="bg-background rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
              <Avatar className="w-12 h-12 sm:w-16 sm:h-16">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg sm:text-xl font-bold">{user.name}</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Adventurer
                </p>
              </div>
            </div>
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-1 sm:gap-0">
                <span className="font-semibold text-sm sm:text-base">
                  Rank: {user.rank}
                </span>
                <span className="font-semibold text-sm sm:text-base">
                  XP: {user.xp.toLocaleString()} /{" "}
                  {user.xpNextLevel.toLocaleString()}
                </span>
              </div>
              <Progress
                value={(user.xp / user.xpNextLevel) * 100}
                className="w-full"
              />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Added filtering & search state
  const [searchTerm, setSearchTerm] = useState("");
  const [rankFilter, setRankFilter] = useState("all");

  // Filtered Quests
  const filteredQuests = useMemo(() => {
    return quests
      .filter(
        (quest) =>
          quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quest.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((quest) => rankFilter === "all" || quest.rank === rankFilter);
  }, [searchTerm, rankFilter]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 w-full z-50 bg-background/95 backdrop-blur-xl border-b border-border/30 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Image
              src="/images/guild-logo.png"
              alt="The Adventurers Guild"
              width={32}
              height={32}
              className="w-8 h-8 sm:w-10 sm:h-10"
            />
            <span className="text-lg sm:text-xl font-bold text-foreground">
              The Adventurers Guild
            </span>
          </div>

          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link
              href="#quests"
              className="text-foreground hover:text-primary transition-all duration-300 ease-out font-medium text-sm xl:text-base relative group"
            >
              Quest Board
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
            <Link
              href="#profile"
              className="text-foreground hover:text-primary transition-all duration-300 ease-out font-medium text-sm xl:text-base relative group"
            >
              Profile
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
            <ThemeToggle />
            <Avatar>
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
          </div>

          <div className="flex items-center space-x-2 lg:hidden">
            <ThemeToggle />
            <button
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-background/95 backdrop-blur-xl border-t border-border">
            <div className="px-4 sm:px-6 py-4 space-y-4">
              <Link
                href="#quests"
                className="block text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 ease-out font-medium py-3 px-2 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Quest Board
              </Link>
              <Link
                href="#profile"
                className="block text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 ease-out font-medium py-3 px-2 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <div className="flex justify-between items-center">
                <ThemeToggle />
                <Avatar>
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main>
        <UserDashboard />

        {/* Search and Filter Section */}
        <section className="px-6 py-8 max-w-6xl mx-auto">
          <AdventureSearch query={searchTerm} setQuery={setSearchTerm} />
          <AdventureFilter
            filter={{ difficulty: rankFilter, category: "" }}
            setFilter={({ difficulty }) => setRankFilter(difficulty || "all")}
            categories={[]}
            difficulties={["all", "S", "A", "B", "C", "D"]}
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
            {filteredQuests.map((quest, index) => (
              <QuestCard key={index} quest={quest} />
            ))}
          </div>

          {filteredQuests.length === 0 && (
            <div className="text-center col-span-full py-16">
              <p className="text-2xl text-muted-foreground">
                No quests match your criteria. Try a different search!
              </p>
            </div>
          )}
        </section>

        <QuestBoard />
      </main>

      <AppFooter />
    </div>
  );
}

function QuestBoard() {
  return null; // Rendering replaced by filtered quests, so returning null here
}

function AppFooter() {
  return (
    <footer className="py-16 px-6 bg-card text-card-foreground">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-8 md:mb-0">
            <Image
              src="/images/guild-logo.png"
              alt="The Adventurers Guild"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <div>
              <div className="text-xl font-bold">The Adventurers Guild</div>
              <div className="text-muted-foreground">
                Forging Digital Pioneers
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <Link
              href="https://www.linkedin.com/company/adventurers-guild"
              className="text-muted-foreground hover:text-card-foreground transition-colors"
            >
              <Linkedin className="w-6 h-6" />
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-card-foreground transition-colors"
            >
              <Twitter className="w-6 h-6" />
            </Link>
            <Link
              href="https://github.com/LarytheLord/Adventurers-Guild"
              className="text-muted-foreground hover:text-card-foreground transition-colors"
            >
              <Github className="w-6 h-6" />
            </Link>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground">
          © {new Date().getFullYear()} The Adventurers Guild. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
