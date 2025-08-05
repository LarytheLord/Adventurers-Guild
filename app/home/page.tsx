'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowRight, Github, Linkedin, Menu, Search, Star, Twitter, X, Sparkles, Trophy, User, LogOut } from 'lucide-react';
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { SkillTree } from "@/components/skill-tree";
import { QuestCompletion } from "@/components/quest-completion";



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
        <Image src={quest.image} alt={quest.title} width={400} height={225} className="w-full h-40 sm:h-48 object-cover" />
      </CardHeader>
      <CardContent className="p-4 sm:p-6 flex-grow">
        <Badge className={`mb-3 sm:mb-4 ${rankColor} text-xs sm:text-sm`}>{quest.rank}-Rank</Badge>
        <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3">{quest.title}</CardTitle>
        <CardDescription className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">{quest.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 sm:p-6 bg-card-foreground/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="font-bold text-base sm:text-lg text-primary">{quest.xp} XP</div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold w-full sm:w-auto text-sm sm:text-base">
          View Quest <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function UserDashboard() {
  return (
    <section id="profile" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-card text-card-foreground">
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
              <Link href="/commission">
                <Button>Commission a Quest</Button>
              </Link>
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
                <p className="text-muted-foreground text-sm sm:text-base">Adventurer</p>
              </div>
            </div>
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-1 sm:gap-0">
                <span className="font-semibold text-sm sm:text-base">Rank: {user.rank}</span>
                <span className="font-semibold text-sm sm:text-base">XP: {user.xp.toLocaleString()} / {user.xpNextLevel.toLocaleString()}</span>
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
  const [quests, setQuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [rankFilter, setRankFilter] = useState('all');

  useEffect(() => {
    const fetchQuests = async () => {
      const response = await fetch('/api/quests');
      const data = await response.json();
      setQuests(data.quests);
    };

    fetchQuests();
  }, []);

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
    <section id="quests" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6 text-foreground">
            The Quest Board
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-medium max-w-3xl mx-auto px-4">
            Choose your next adventure. Filter by rank, skills, or rewards to find the perfect quest for you.
          </p>
        </div>

        <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <Input 
              type="text"
              placeholder="Search for quests..." 
              className="pl-10 sm:pl-12 text-base sm:text-lg py-4 sm:py-6 border-2 border-border focus:border-primary w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={rankFilter} onValueChange={setRankFilter}>
            <SelectTrigger className="text-base sm:text-lg py-4 sm:py-6 border-2 border-border focus:border-primary min-w-[140px] sm:min-w-[160px]">
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
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredQuests.map((quest, index) => (
            <QuestCard key={index} quest={quest} />
          ))}
        </div>
        {filteredQuests.length === 0 && (
            <div className="text-center col-span-full py-12 sm:py-16">
                <p className="text-lg sm:text-2xl text-muted-foreground">No quests match your criteria. Try a different search!</p>
            </div>
        )}
      </div>
    </section>
  );
}

function AppFooter() {
  return (
    <footer className="py-12 sm:py-16 px-4 sm:px-6 bg-card text-card-foreground">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-6 sm:mb-0">
            <Image src="/images/guild-logo.png" alt="The Adventurers Guild" width={28} height={28} className="w-7 h-7 sm:w-8 sm:h-8" />
            <div>
              <div className="text-lg sm:text-xl font-bold">The Adventurers Guild</div>
              <div className="text-muted-foreground text-sm">Forging Digital Pioneers</div>
            </div>
          </div>
          <div className="flex items-center space-x-4 sm:space-x-6">
            <Link href="https://www.linkedin.com/company/adventurers-guild" className="text-muted-foreground hover:text-card-foreground transition-colors">
              <Linkedin className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-card-foreground transition-colors">
              <Twitter className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
            <Link href="https://github.com/LarytheLord/Adventurers-Guild" className="text-muted-foreground hover:text-card-foreground transition-colors">
              <Github className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
          </div>
        </div>
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border text-center text-muted-foreground text-sm">
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
      <nav className="sticky top-0 w-full z-50 bg-background/95 backdrop-blur-xl border-b border-border/30 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Image src="/images/guild-logo.png" alt="The Adventurers Guild" width={32} height={32} className="w-8 h-8 sm:w-10 sm:h-10" />
            <span className="text-lg sm:text-xl font-bold text-foreground">The Adventurers Guild</span>
          </div>
          
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link href="#quests" className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm xl:text-base">Quest Board</Link>
            <Link href="#profile" className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm xl:text-base">Profile</Link>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <div className="p-2">
                  <div className="font-bold">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.rank}-Rank Adventurer</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center space-x-2 lg:hidden">
            <ThemeToggle />
            <button className="p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-background/95 backdrop-blur-xl border-t border-border">
            <div className="px-4 sm:px-6 py-4 space-y-4">
              <Link 
                href="#quests" 
                className="block text-muted-foreground hover:text-foreground font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Quest Board
              </Link>
              <Link 
                href="#profile" 
                className="block text-muted-foreground hover:text-foreground font-medium py-2"
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
        <QuestBoard />
      </main>

      <AppFooter />
    </div>
  );
}