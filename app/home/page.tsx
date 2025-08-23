
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import HomePageClient from "./HomePageClient";
import { Database } from "@/types/supabase";

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

  return <HomePageClient quests={quests} />;
}
