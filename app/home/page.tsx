import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import HomePageClient from "./HomePageClient";
import { Database } from "@/types/supabase";
import AdventureSearch from '@/components/AdventureSearch';
import AdventureFilter from '@/components/AdventureFilter';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { X, Menu, Linkedin, Twitter, Github } from 'lucide-react';
import SkillTree from "@/components/skill-tree";
import QuestCompletion from "@/components/quest-completion";
import QuestCard from "@/components/home/QuestCard";


async function getQuests() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data, error } = await supabase.from('quests').select('*');

  if (error) {
    console.error('Error fetching quests:', error);
    return [];
  }
  return data;
}

function UserDashboard() {
    // NOTE: This is a placeholder. Replace with actual user data.
    const user = {
        name: 'Adventurer',
        avatar: '/images/avatar.png',
        rank: 'S',
        xp: 1500,
        xpNextLevel: 2000,
    };

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

export default async function HomePage() {
    const quests = await getQuests();
    // NOTE: This is a placeholder. Replace with actual user data.
    const user = {
        name: 'Adventurer',
        avatar: '/images/avatar.png',
    };


  return (
    <div className="min-h-screen bg-background text-foreground">
      <HomePageClient quests={quests} />
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