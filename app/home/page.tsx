'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowRight, Github, Linkedin, Menu, Search, Star, Twitter, X, Sparkles, Trophy } from 'lucide-react';
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { SkillTree } from "@/components/skill-tree";
import { QuestCompletion } from "@/components/quest-completion";

// --- MOCK DATA ---
const quests = [
  { title: "Bug Bounty Brigades", description: "Hunt down and squash bugs in existing codebases. A great way to learn and earn XP.", image: "/images/quest-board.png", rank: "C", xp: 500 },
  { title: "Digital Archaeology", description: "Explore and document legacy codebases. Uncover hidden gems and learn from the past.", image: "/images/quest-board.png", rank: "B", xp: 800 },
  { title: "Narrative-Driven Hackathons", description: "Participate in themed hackathons with engaging storylines. Build innovative solutions and win prizes.", image: "/images/quest-board.png", rank: "A", xp: 1200 },
  { title: "UI/UX Redesign Challenge", description: "Redesign the user interface of a popular open-source application. Focus on usability and modern design principles.", image: "/images/quest-board.png", rank: "B", xp: 750 },
  { title: "Open Source Contribution", description: "Contribute to a major open-source project. Add a new feature, fix a critical bug, or improve documentation.", image: "/images/quest-board.png", rank: "S", xp: 2000 },
  { title: "Code Refactoring Quest", description: "Refactor a messy codebase to improve its readability, performance, and maintainability.", image: "/images/quest-board.png", rank: "D", xp: 300 },
];

const user = {
  name: "LaryTheLord",
  avatar: "/placeholder-user.jpg",
  rank: "S",
  xp: 24500,
  xpNextLevel: 25000,
};

// --- REUSABLE COMPONENTS ---

function QuestCard({ quest }: { quest: typeof quests[0] }) {
  const rankColor = {
    S: 'bg-yellow-500 text-black',
    A: 'bg-red-500 text-white',
    B: 'bg-blue-500 text-white',
    C: 'bg-green-500 text-white',
    D: 'bg-gray-500 text-white',
  }[quest.rank] || 'bg-gray-400';

  return (
    <Card className="bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 overflow-hidden flex flex-col">
      <CardHeader className="p-0">
        <Image src={quest.image} alt={quest.title} width={400} height={225} className="w-full h-48 object-cover" />
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <Badge className={`mb-4 ${rankColor}`}>{quest.rank}-Rank</Badge>
        <CardTitle className="text-2xl font-bold mb-3">{quest.title}</CardTitle>
        <CardDescription className="text-muted-foreground text-lg leading-relaxed">{quest.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-6 bg-card-foreground/5 flex items-center justify-between">
        <div className="font-bold text-lg text-primary">{quest.xp} XP</div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
          View Quest <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function UserDashboard() {
  return (
    <section id="profile" className="py-24 px-6 bg-card text-card-foreground">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-12 items-center">
          <div className="lg:col-span-2">
            <h1 className="text-4xl md:text-6xl font-black mb-4 text-foreground leading-tight">
              Welcome Back, Adventurer!
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8">
              Ready to embark on a new quest and forge your legend?
            </p>
            
            {/* Feature Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <SkillTree />
              <QuestCompletion />
            </div>
          </div>
          <Card className="bg-background rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">{user.name}</h3>
                <p className="text-muted-foreground">Adventurer</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Rank: {user.rank}</span>
                <span className="font-semibold">XP: {user.xp.toLocaleString()} / {user.xpNextLevel.toLocaleString()}</span>
              </div>
              <Progress value={(user.xp / user.xpNextLevel) * 100} className="w-full" />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

function QuestBoard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [rankFilter, setRankFilter] = useState('all');

  const filteredQuests = useMemo(() => {
    return quests
      .filter(quest => 
        quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quest.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(quest => 
        rankFilter === 'all' || quest.rank === rankFilter
      );
  }, [searchTerm, rankFilter]);

  return (
    <section id="quests" className="py-24 px-6 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-black mb-6 text-foreground">
            The Quest Board
          </h2>
          <p className="text-2xl text-muted-foreground font-medium max-w-3xl mx-auto">
            Choose your next adventure. Filter by rank, skills, or rewards to find the perfect quest for you.
          </p>
        </div>

        <div className="mb-12 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              type="text"
              placeholder="Search for quests..." 
              className="pl-12 text-lg py-6 border-2 border-border focus:border-primary w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={rankFilter} onValueChange={setRankFilter}>
            <SelectTrigger className="text-lg py-6 border-2 border-border focus:border-primary">
              <SelectValue placeholder="Filter by rank" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ranks</SelectItem>
              <SelectItem value="S">S-Rank</SelectItem>
              <SelectItem value="A">A-Rank</SelectItem>
              <SelectItem value="B">B-Rank</SelectItem>
              <SelectItem value="C">C-Rank</SelectItem>
              <SelectItem value="D">D-Rank</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredQuests.map((quest, index) => (
            <QuestCard key={index} quest={quest} />
          ))}
        </div>
        {filteredQuests.length === 0 && (
            <div className="text-center col-span-full py-16">
                <p className="text-2xl text-muted-foreground">No quests match your criteria. Try a different search!</p>
            </div>
        )}
      </div>
    </section>
  );
}

function AppFooter() {
  return (
    <footer className="py-16 px-6 bg-card text-card-foreground">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-8 md:mb-0">
            <Image src="/images/guild-logo.png" alt="The Adventurers Guild" width={32} height={32} className="w-8 h-8" />
            <div>
              <div className="text-xl font-bold">The Adventurers Guild</div>
              <div className="text-muted-foreground">Forging Digital Pioneers</div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="https://www.linkedin.com/company/adventurers-guild" className="text-muted-foreground hover:text-card-foreground transition-colors"><Linkedin className="w-6 h-6" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-card-foreground transition-colors"><Twitter className="w-6 h-6" /></Link>
            <Link href="https://github.com/LarytheLord/Adventurers-Guild" className="text-muted-foreground hover:text-card-foreground transition-colors"><Github className="w-6 h-6" /></Link>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} The Adventurers Guild. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// --- MAIN PAGE COMPONENT ---

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 w-full z-50 bg-background/30 backdrop-blur-xl border-b border-border/30 transition-all duration-300">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image src="/images/guild-logo.png" alt="The Adventurers Guild" width={40} height={40} className="w-10 h-10" />
            <span className="text-xl font-bold text-foreground">The Adventurers Guild</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#quests" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Quest Board</Link>
            <Link href="#profile" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Profile</Link>
            <ThemeToggle />
            <Avatar>
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-border">
            <div className="px-6 py-4 space-y-4">
              <Link href="#quests" className="block text-muted-foreground hover:text-foreground font-medium" onClick={() => setMobileMenuOpen(false)}>Quest Board</Link>
              <Link href="#profile" className="block text-muted-foreground hover:text-foreground font-medium" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
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
        <QuestBoard />
      </main>

      <AppFooter />
    </div>
  );
}