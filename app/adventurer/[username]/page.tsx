import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { GuildCardProfile } from '@/components/guild-card/GuildCardProfile';

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;

  const user = await prisma.user.findFirst({
    where: { username, role: 'adventurer', isActive: true },
    select: { name: true, username: true, rank: true, xp: true, adventurerProfile: { select: { primarySkills: true, totalQuestsCompleted: true } } },
  });

  if (!user) {
    return { title: 'Adventurer Not Found | Adventurers Guild' };
  }

  const skills = user.adventurerProfile?.primarySkills?.slice(0, 3).join(', ') || 'Adventurer';
  const quests = user.adventurerProfile?.totalQuestsCompleted || 0;

  return {
    title: `${user.name || user.username} — ${user.rank}-Rank Adventurer | Adventurers Guild`,
    description: `${quests} quests completed · ${skills} · ${user.xp} XP`,
    openGraph: {
      title: `${user.name || user.username} — ${user.rank}-Rank Adventurer`,
      description: `${quests} quests completed · ${skills}`,
      images: [`/api/og/adventurer/${user.username}`],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${user.name || user.username} — ${user.rank}-Rank`,
      description: `${quests} quests completed · ${skills} · ${user.xp} XP`,
      images: [`/api/og/adventurer/${user.username}`],
    },
  };
}

export default async function GuildCardPage({ params }: PageProps) {
  const { username } = await params;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adventurersguild.space';

  // Fetch from our own API to keep logic centralized
  const res = await fetch(`${appUrl}/api/adventurer/${encodeURIComponent(username)}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    notFound();
  }

  const data = await res.json();
  if (!data.success || !data.adventurer) {
    notFound();
  }

  return <GuildCardProfile adventurer={data.adventurer} />;
}
