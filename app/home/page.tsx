'use client'

import { useState, useEffect, Suspense } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Github, Linkedin, Menu, Twitter, X, User, LogOut } from 'lucide-react';
import Image from "next/image";
import Link from "next/link";
import { SkillTree } from "@/components/skill-tree";
import { QuestCompletion } from "@/components/quest-completion";
import AdventureSearch from '@/components/AdventureSearch';
import AdventureFilter from '@/components/AdventureFilter';
import { useAuth } from "@/hooks/useAuth";
import QuestBoard from "@/components/home/QuestBoard";

export default function HomePage() {
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [rankFilter, setRankFilter] = useState('all');

  useEffect(() => {
    if (user && profile?.role !== 'student') {
      window.location.href = '/company/dashboard';
    }
  }, [user, profile]);

  const handleLogout = () => {
    signOut();
    window.location.href = '/';
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading your adventure...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 w-full z-50 bg-background/95 backdrop-blur-xl border-b border-border/30 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
            <Image src="/images/guild-logo.png" alt="The Adventurers Guild" width={32} height={32} className="w-8 h-8 sm:w-10 sm:h-10" />
            <span className="text-lg sm:text-xl font-bold text-foreground">The Adventurers Guild</span>
          </Link>

          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link href="#quests" className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm xl:text-base">Quest Board</Link>
            <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm xl:text-base">Profile</Link>
            <Link href="/commission" className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm xl:text-base">Post Quest</Link>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile.avatar_url || undefined} alt={profile.name || 'User'} />
                    <AvatarFallback>{profile.name?.substring(0, 2) || '??'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {profile.name && <p className="font-medium">{profile.name}</p>}
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
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
                href="/profile"
                className="block text-muted-foreground hover:text-foreground font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <div className="flex justify-between items-center">
                <Avatar>
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback>{profile.name?.substring(0, 2) || '??'}</AvatarFallback>
                </Avatar>
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main>
        {/* User Dashboard */}
        <section id="profile" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-card text-card-foreground">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-3 gap-8 sm:gap-12 items-center">
              <div className="lg:col-span-2">
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-3 sm:mb-4 text-foreground leading-tight">
                  Welcome Back, {profile.name || 'Adventurer'}!
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
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback>{profile.name?.substring(0, 2) || '??'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold">{profile.name || 'Adventurer'}</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">Adventurer</p>
                  </div>
                </div>
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-1 sm:gap-0">
                    <span className="font-semibold text-sm sm:text-base">Rank: {profile.rank}</span>
                    <span className="font-semibold text-sm sm:text-base">XP: {profile.xp?.toLocaleString()} / 25,000</span>
                  </div>
                  <Progress value={((profile.xp || 0) / 25000) * 100} className="w-full" />
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Quest Board */}
        <section id="quests" className="px-6 py-8 max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4">Available Quests</h2>
            <AdventureSearch query={searchTerm} setQuery={setSearchTerm} />
            <AdventureFilter
              filter={{ difficulty: rankFilter, category: '' }}
              setFilter={({ difficulty }) => setRankFilter(difficulty || 'all')}
              categories={[]}
              difficulties={['all', 'S', 'A', 'B', 'C', 'D', 'F']}
            />
          </div>

          <Suspense fallback={<p>Loading quests...</p>}>
            <QuestBoard />
          </Suspense>
        </section>
      </main>

      <AppFooter />
    </div>
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
            <Link href="https://www.linkedin.com/company/adventurers-guild" className="text-muted-foreground hover:text-card-foreground transition-colors">
              <Linkedin className="w-6 h-6" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-card-foreground transition-colors">
              <Twitter className="w-6 h-6" />
            </Link>
            <Link href="https://github.com/LarytheLord/Adventurers-Guild" className="text-muted-foreground hover:text-card-foreground transition-colors">
              <Github className="w-6 h-6" />
            </Link>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground">
          © {new Date().getFullYear()} The Adventurers Guild. All rights reserved.
        </div>
      </div>
    </footer>
  );
}