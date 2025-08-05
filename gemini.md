
# Adventurers Guild - Gemini Development Log

This file contains the code for the profile page and related components, as developed by Gemini.

## `app/home/page.tsx`

```tsx
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

function QuestCard({ quest }: { quest: any }) {
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
  }, [quests, searchTerm, rankFilter]);

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
```

## `app/profile/page.tsx`

```tsx
'use client'
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { UserProfileCard } from "@/components/profile/UserProfileCard";
import { SkillPentagon } from "@/components/profile/SkillPentagon";
import { SkillDetail } from "@/components/profile/SkillDetail";
import { useState } from "react";

const user = {
  name: "LaryTheLord",
  avatar: "/placeholder-user.jpg",
  rank: "S",
  xp: 24500,
  xpNextLevel: 25000,
  bio: "A passionate developer on a quest to master the art of coding and build amazing things.",
  social: {
    github: "https://github.com/LarytheLord",
    linkedin: "https://www.linkedin.com/in/larythelord/",
    twitter: "https://twitter.com/larythelord",
  },
  banner: "/images/profile-banner.png",
};

const skills = [
    { name: 'Frontend', value: 90, description: 'Mastery of modern frontend technologies including React, Next.js, and Tailwind CSS.' },
    { name: 'Backend', value: 75, description: 'Proficient in building robust and scalable backend systems with Node.js, Express, and databases.' },
    { name: 'AI/ML', value: 60, description: 'Experience in developing AI-powered features and working with machine learning models.' },
    { name: 'DevOps', value: 50, description: 'Knowledge of CI/CD pipelines, containerization with Docker, and cloud deployment.' },
    { name: 'Soft Skills', value: 80, description: 'Excellent communication, teamwork, and problem-solving abilities.' },
];

export default function ProfilePage() {
  const [selectedSkill, setSelectedSkill] = useState(skills[0]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative h-48 md:h-64">
        <Link href="/home" className="absolute top-4 left-4 z-10 bg-background/50 p-2 rounded-full hover:bg-background/80 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <img src={user.banner} alt="Profile Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 -mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <UserProfileCard user={user} />
          </div>
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card p-4 rounded-lg">
                <SkillPentagon skills={skills} onSkillSelect={setSelectedSkill} />
              </div>
              <div className="bg-card p-4 rounded-lg">
                <SkillDetail skill={selectedSkill} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## `app/commission/page.tsx`

```tsx
'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CommissionPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [rank, setRank] = useState('C')
  const [xp, setXp] = useState(500)
  const [image, setImage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setIsSubmitted(false)

    try {
      const response = await fetch('/api/quests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, rank, xp, image }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSubmitted(true)
        setTitle('')
        setDescription('')
        setRank('C')
        setXp(500)
        setImage('')
        setTimeout(() => setIsSubmitted(false), 5000)
      } else {
        throw new Error(data.message || 'Failed to submit quest')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Something went wrong. Please try again.')
      setTimeout(() => setError(''), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center mb-8">
          <Link href="/home">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold ml-4">Commission a Quest</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Create a New Quest</CardTitle>
          </CardHeader>
          <CardContent>
            {isSubmitted && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                Quest submitted successfully!
              </div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-muted-foreground mb-2">Quest Title</label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Bug Bounty Brigades"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-muted-foreground mb-2">Quest Description</label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A detailed description of the quest."
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="rank" className="block text-sm font-medium text-muted-foreground mb-2">Rank</label>
                  <select
                    id="rank"
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="S">S-Rank</option>
                    <option value="A">A-Rank</option>
                    <option value="B">B-Rank</option>
                    <option value="C">C-Rank</option>
                    <option value="D">D-Rank</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="xp" className="block text-sm font-medium text-muted-foreground mb-2">XP Reward</label>
                  <Input
                    id="xp"
                    type="number"
                    value={xp}
                    onChange={(e) => setXp(Number(e.target.value))}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-muted-foreground mb-2">Image URL (Optional)</label>
                <Input
                  id="image"
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/quest-image.png"
                  disabled={isSubmitting}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Quest'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

## `app/api/quests/route.ts`

```ts
import { NextResponse } from 'next/server'

// Mock database
let quests = [
  { title: "Bug Bounty Brigades", description: "Hunt down and squash bugs in existing codebases. A great way to learn and earn XP.", image: "/images/quest-board.png", rank: "C", xp: 500 },
  { title: "Digital Archaeology", description: "Explore and document legacy codebases. Uncover hidden gems and learn from the past.", image: "/images/quest-board.png", rank: "B", xp: 800 },
  { title: "Narrative-Driven Hackathons", description: "Participate in themed hackathons with engaging storylines. Build innovative solutions and win prizes.", image: "/images/quest-board.png", rank: "A", xp: 1200 },
  { title: "UI/UX Redesign Challenge", description: "Redesign the user interface of a popular open-source application. Focus on usability and modern design principles.", image: "/images/quest-board.png", rank: "B", xp: 750 },
  { title: "Open Source Contribution", description: "Contribute to a major open-source project. Add a new feature, fix a critical bug, or improve documentation.", image: "/images/quest-board.png", rank: "S", xp: 2000 },
  { title: "Code Refactoring Quest", description: "Refactor a messy codebase to improve its readability, performance, and maintainability.", image: "/images/quest-board.png", rank: "D", xp: 300 },
];

export async function GET() {
  return NextResponse.json({ quests })
}

export async function POST(request: Request) {
  try {
    const { title, description, rank, xp, image } = await request.json()

    if (!title || !description || !rank || !xp) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
    }

    const newQuest = { title, description, rank, xp, image: image || '/images/quest-board.png' };
    quests.push(newQuest);

    return NextResponse.json({ success: true, quest: newQuest })
  } catch (error) {
    console.error('Error creating quest:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
```

## `components/profile/UserProfileCard.tsx`

```tsx
'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Github, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";

export function UserProfileCard({ user }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col items-center text-center p-0">
        <div className="relative w-full h-24 bg-muted" />
        <Avatar className="w-32 h-32 -mt-16 border-4 border-background">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="p-6">
          <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
          <p className="text-muted-foreground">{user.rank}-Rank Adventurer</p>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-center mb-6">{user.bio}</p>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">XP</span>
            <span>{user.xp.toLocaleString()} / {user.xpNextLevel.toLocaleString()}</span>
          </div>
          <Progress value={(user.xp / user.xpNextLevel) * 100} />
        </div>
        <div className="flex justify-center space-x-4">
          <Link href={user.social.github} passHref>
            <Button variant="outline" size="icon">
              <Github className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={user.social.linkedin} passHref>
            <Button variant="outline" size="icon">
              <Linkedin className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={user.social.twitter} passHref>
            <Button variant="outline" size="icon">
              <Twitter className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
```

## `components/profile/SkillPentagon.tsx`

```tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

export function SkillPentagon({ skills, onSkillSelect }) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Skill Pentagon</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={skills} outerRadius="80%">
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="name" tick={{ fill: 'hsl(var(--foreground))' }} onClick={(data) => onSkillSelect(skills.find(s => s.name === data.value))} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <Radar name="Skills" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

## `components/profile/SkillDetail.tsx`

```tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function SkillDetail({ skill }) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Skill Details</CardTitle>
      </CardHeader>
      <CardContent>
        {skill ? (
          <div>
            <h3 className="text-xl font-bold mb-4">{skill.name}</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Proficiency</span>
              <span>{skill.value}%</span>
            </div>
            <Progress value={skill.value} className="[&>div]:bg-primary" />
            <p className="text-muted-foreground mt-4">
              {skill.description}
            </p>
          </div>
        ) : (
          <p>Select a skill to see details.</p>
        )}
      </CardContent>
    </Card>
  );
}
```
