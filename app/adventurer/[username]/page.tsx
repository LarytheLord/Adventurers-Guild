import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import {
  CalendarDays,
  CheckCircle2,
  Flame,
  MapPin,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';

import {
  GuildCard,
  GuildChip,
  GuildHero,
  GuildKpi,
  GuildPage,
  GuildPanel,
} from '@/components/guild/primitives';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RankBadge } from '@/components/ui/rank-badge';
import { XPBar } from '@/components/ui/xp-bar';
import {
  getAdventurerInitials,
  getPublicAdventurerProfile,
  getPublicAppUrl,
} from '@/lib/public-adventurer-profile';

function humanizeValue(value: string): string {
  return value
    .split(/[_-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function buildProfileDescription(questsCompleted: number, skills: string[]): string {
  const skillText =
    skills.length > 0 ? skills.slice(0, 3).join(', ') : 'Verified Adventurers Guild progress';
  return `${questsCompleted} quests completed - ${skillText}`;
}

export async function generateMetadata(
  props: { params: Promise<{ username: string }> }
): Promise<Metadata> {
  const { username } = await props.params;
  const profile = await getPublicAdventurerProfile(username);

  if (!profile) {
    return {
      title: 'Adventurer Not Found | Adventurers Guild',
      description: 'The requested Guild Card could not be found.',
    };
  }

  const appUrl = getPublicAppUrl();
  const profileUrl = new URL(`/adventurer/${profile.username}`, appUrl).toString();
  const ogImageUrl = new URL(`/api/og/adventurer/${profile.username}`, appUrl).toString();
  const description = buildProfileDescription(profile.stats.totalQuestsCompleted, profile.skills);

  return {
    metadataBase: new URL(appUrl),
    title: `${profile.name} - ${profile.rank}-Rank Adventurer | Adventurers Guild`,
    description,
    alternates: {
      canonical: profileUrl,
    },
    openGraph: {
      title: `${profile.name} - ${profile.rank}-Rank Adventurer`,
      description,
      type: 'website',
      url: profileUrl,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${profile.name} Guild Card`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${profile.name} - ${profile.rank}-Rank Adventurer`,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function PublicAdventurerPage(
  props: { params: Promise<{ username: string }> }
) {
  const { username } = await props.params;
  const profile = await getPublicAdventurerProfile(username);

  if (!profile) {
    notFound();
  }

  const joinedAt = format(new Date(profile.joinedAt), 'MMMM yyyy');
  const latestQuest = profile.questHistory[0];

  return (
    <div className="guild-shell">
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <GuildPage>
          <GuildHero>
            <div className="relative z-10 grid gap-6 lg:grid-cols-[1.45fr_0.95fr] lg:items-start">
              <div className="space-y-5">
                <Badge className="w-fit rounded-full border border-orange-300 bg-orange-100 text-orange-700">
                  Public Guild Card
                </Badge>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg sm:h-28 sm:w-28">
                    <AvatarImage src={profile.avatar || undefined} alt={profile.name} />
                    <AvatarFallback className="bg-slate-900 text-2xl font-bold text-white">
                      {getAdventurerInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        {profile.name}
                      </h1>
                      <RankBadge rank={profile.rank} size="lg" glow />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-4 w-4 text-orange-500" />
                        Joined {joinedAt}
                      </span>
                      {profile.location ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-sky-500" />
                          {profile.location}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {profile.specialization ? <GuildChip>{profile.specialization}</GuildChip> : null}
                      <GuildChip>Level {profile.level}</GuildChip>
                      {profile.stats.currentStreak > 0 ? (
                        <GuildChip>{profile.stats.currentStreak} day streak</GuildChip>
                      ) : null}
                    </div>
                  </div>
                </div>

                <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  {profile.bio ||
                    `${profile.name} is building verified work history inside the Adventurers Guild. This public card highlights completed quests, progression milestones, and the skills earned along the way.`}
                </p>

                {profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="rounded-full border-slate-300 bg-white/90 px-3 py-1 text-slate-700"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 text-white shadow-[0_24px_60px_-36px_rgba(15,23,42,0.9)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">
                      Verified Progress
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">{profile.rank}-Rank trajectory</p>
                  </div>
                  <p className="text-right text-sm text-slate-300">{profile.xp.toLocaleString()} XP</p>
                </div>

                <div className="mt-4">
                  <XPBar
                    currentXP={profile.xp}
                    currentRank={profile.xpProgress.currentRank}
                    nextRank={profile.xpProgress.nextRank}
                    progressPercent={profile.xpProgress.progressPercent}
                    xpToNext={profile.xpProgress.xpToNext ?? undefined}
                    animate={false}
                  />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Latest completion</p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {latestQuest ? latestQuest.title : 'No completed quests yet'}
                    </p>
                    {latestQuest ? (
                      <p className="mt-1 text-xs text-slate-400">
                        {format(new Date(latestQuest.completedAt), 'MMM d, yyyy')}
                      </p>
                    ) : null}
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Credential link</p>
                    <p className="mt-2 break-all text-sm font-semibold text-orange-200">
                      /adventurer/{profile.username}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </GuildHero>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <GuildKpi>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Quests Completed
                </p>
                <Trophy className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {profile.stats.totalQuestsCompleted}
              </p>
              <p className="mt-1 text-xs text-slate-500">Approved quest delivery history</p>
            </GuildKpi>

            <GuildKpi>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total XP
                </p>
                <Zap className="h-4 w-4 text-sky-500" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{profile.xp.toLocaleString()}</p>
              <p className="mt-1 text-xs text-slate-500">
                {profile.xpProgress.nextRank
                  ? `${profile.xpProgress.xpToNext?.toLocaleString() ?? 0} XP to ${profile.xpProgress.nextRank}-Rank`
                  : 'Top rank achieved'}
              </p>
            </GuildKpi>

            <GuildKpi>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Current Streak
                </p>
                <Flame className="h-4 w-4 text-orange-500" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{profile.stats.currentStreak}</p>
              <p className="mt-1 text-xs text-slate-500">
                Best run: {profile.stats.longestStreak} days
              </p>
            </GuildKpi>

            <GuildKpi>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Completion Rate
                </p>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {profile.stats.completionRate.toFixed(1)}%
              </p>
              <p className="mt-1 text-xs text-slate-500">Based on completed assignments</p>
            </GuildKpi>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
            <div className="space-y-6">
              <GuildPanel className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">
                      Profile Summary
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                      Verified builder snapshot
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                      This public credential highlights confirmed quest completions only. In-progress work,
                      private notes, and contact data stay hidden.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">Looking for more context?</p>
                    <p className="mt-1">Completed work and rank milestones are listed below.</p>
                  </div>
                </div>
              </GuildPanel>

              <GuildCard>
                <CardHeader>
                  <CardTitle>Completed Quest History</CardTitle>
                  <CardDescription>
                    Only approved quest completions are shown on this public profile.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.questHistory.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-6 text-sm text-slate-500">
                      No public quest completions yet.
                    </div>
                  ) : (
                    profile.questHistory.map((quest) => (
                      <div
                        key={quest.id}
                        className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-base font-semibold text-slate-900">{quest.title}</p>
                              <RankBadge rank={quest.difficulty} size="sm" />
                              <Badge variant="outline" className="border-slate-300 text-slate-600">
                                {humanizeValue(quest.category)}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                                {format(new Date(quest.completedAt), 'MMM d, yyyy')}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                {quest.xpEarned} XP earned
                              </span>
                            </div>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                            {quest.qualityScore !== null ? (
                              <span className="font-semibold text-slate-900">
                                Quality {quest.qualityScore}/10
                              </span>
                            ) : (
                              <span>Quality not scored</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </GuildCard>
            </div>

            <div className="space-y-6">
              <GuildCard>
                <CardHeader>
                  <CardTitle>Rank Progression</CardTitle>
                  <CardDescription>Guild promotion milestones over time.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.rankHistory.map((entry, index) => (
                    <div key={`${entry.rank}-${entry.earnedAt}-${index}`} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="rounded-full border border-orange-200 bg-orange-50 p-1.5">
                          <RankBadge rank={entry.rank} size="sm" />
                        </div>
                        {index < profile.rankHistory.length - 1 ? (
                          <div className="mt-2 h-full w-px bg-slate-200" />
                        ) : null}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {entry.previousRank ? `${entry.previousRank} to ${entry.rank}` : 'Joined the guild'}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                          {format(new Date(entry.earnedAt), 'MMM d, yyyy')}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">{entry.label}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </GuildCard>

              <GuildCard>
                <CardHeader>
                  <CardTitle>Credential Notes</CardTitle>
                  <CardDescription>What this public profile confirms.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                  <p>
                    Rank, XP, streaks, and quest history are pulled from the live Adventurers Guild account.
                  </p>
                  <p>
                    Only completed work appears here. Drafts, rework notes, emails, and any in-progress assignment data are excluded.
                  </p>
                  <p>
                    Internal viewers can see more context inside the app, but this page stays safe to share publicly.
                  </p>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 font-semibold text-orange-600 transition hover:text-orange-700"
                  >
                    Build your own Guild Card
                    <Sparkles className="h-4 w-4" />
                  </Link>
                </CardContent>
              </GuildCard>
            </div>
          </section>
        </GuildPage>
      </main>
    </div>
  );
}
