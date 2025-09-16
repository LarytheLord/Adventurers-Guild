import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import HomePageClient from "./HomePageClient";
import { Database } from "@/types/supabase";
import Image from 'next/image';
import Link from 'next/link';
import { Linkedin, Twitter, Github } from 'lucide-react';


async function getQuests() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data, error } = await supabase.from('quests').select('*');

  if (error) {
    console.error('Error fetching quests:', error);
    return [];
  }
  return data;
}

export default async function HomePage() {
    const quests = await getQuests();

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