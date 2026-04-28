'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircle,
  ArrowRight,
  Clock,
  Search,
  Sparkles,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import { GuildCard, GuildHero, GuildKpi, GuildPage, GuildPanel } from '@/components/guild/primitives';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

type FormatFilter = 'all' | 'solo' | 'squad';

interface Quest {
  id: string;
  title: string;
  description: string;
  questType: string;
  status: string;
  difficulty: string;
  track: 'OPEN' | 'INTERN' | 'BOOTCAMP';
  xpReward: number;
  skillPointsReward: number;
  monetaryReward?: number;
  requiredSkills: string[];
  requiredRank?: string;
  maxParticipants?: number;
  questCategory: string;
  companyId: string;
  createdAt: string;
  deadline?: string;
  company?: {
    name: string;
    email: string;
  };
  party?: {
    id: string;
    maxSize: number;
    members: Array<{ id: string }>;
  } | null;
}

const EMPTY_QUESTS: Quest[] = [];

function getRewardAmount(monetaryReward?: number | string): number {
  return Number(monetaryReward ?? 0);
}

function getCollaborationBadge(quest: Quest) {
  if (quest.track === 'OPEN') {
    return {
      label: 'Solo',
      className: 'border-slate-200 bg-slate-50 text-slate-700',
    };
  }

  if (quest.party) {
    const memberCount = quest.party.members.length;
    const capacity = quest.party.maxSize || quest.maxParticipants || (quest.track === 'BOOTCAMP' ? 2 : 5);
    const isFull = memberCount >= capacity;

    return {
      label: `Party: ${memberCount}/${capacity}`,
      className: isFull
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-amber-200 bg-amber-50 text-amber-700',
    };
  }

  return {
    label: 'Open Party',
    className: 'border-orange-200 bg-orange-50 text-orange-700',
  };
}

export default function QuestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quests, setQuests] = useState<Quest[]>(EMPTY_QUESTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState<FormatFilter>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role === 'company') {
      router.push('/dashboard/company');
      return;
    }

    let isCancelled = false;

    const fetchQuests = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchWithAuth('/api/quests?status=available&limit=60');
        const data = await response.json();

        if (!data.success) {
          if (!isCancelled) {
            setError(data.error || 'Failed to fetch quests');
          }
          return;
        }

        if (!isCancelled) {
          setQuests(data.quests || EMPTY_QUESTS);
        }
      } catch (fetchError) {
        console.error('Error fetching quests:', fetchError);
        if (!isCancelled) {
          setError('An error occurred while fetching quests');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    if (status === 'authenticated') {
      void fetchQuests();
    }

    return () => {
      isCancelled = true;
    };
  }, [router, session?.user?.role, status]);

  const isBootcampOnlyView = useMemo(
    () =>
      session?.user?.role === 'adventurer' &&
      quests.length > 0 &&
      quests.every((quest) => quest.track === 'BOOTCAMP'),
    [quests, session?.user?.role]
  );

  useEffect(() => {
    if (isBootcampOnlyView && formatFilter !== 'all') {
      setFormatFilter('all');
    }
  }, [formatFilter, isBootcampOnlyView]);

  const filteredQuests = useMemo(
    () =>
      quests.filter((quest) => {
        const matchesSearch = [
          quest.title,
          quest.description,
          quest.questCategory,
          ...(quest.requiredSkills || []),
          quest.company?.name || '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        const matchesFormat =
          formatFilter === 'all'
            ? true
            : formatFilter === 'solo'
              ? quest.track === 'OPEN'
              : quest.track !== 'OPEN';

        return matchesSearch && matchesFormat;
      }),
    [formatFilter, quests, searchTerm]
  );

  if (status === 'loading' || loading) {
    return (
      <GuildPage>
        <GuildPanel className="flex min-h-64 items-center justify-center sm:min-h-[320px]">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        </GuildPanel>
      </GuildPage>
    );
  }

  if (error) {
    return (
      <GuildPage>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </GuildPage>
    );
  }

  const highRewardCount = filteredQuests.filter((quest) => quest.xpReward >= 1500).length;

  return (
    <GuildPage>
      <GuildHero>
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="rounded-full border border-emerald-300 bg-emerald-100 text-emerald-700">
              Quest Marketplace
            </Badge>
            <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Available Quests</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              Browse live company projects, match your rank, and choose your next challenge.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              Back to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </GuildHero>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GuildKpi className="sm:col-span-2 xl:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Open Quests</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{filteredQuests.length}</p>
          <p className="mt-1 text-xs text-slate-500">Matching your current search</p>
        </GuildKpi>
        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">High XP Quests</p>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{highRewardCount}</p>
          <p className="mt-1 text-xs text-slate-500">1500 XP and above</p>
        </GuildKpi>
        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Newly Posted</p>
            <Sparkles className="h-4 w-4 text-violet-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {filteredQuests.filter((quest) => Date.now() - new Date(quest.createdAt).getTime() <= 1000 * 60 * 60 * 24 * 7).length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Posted in last 7 days</p>
        </GuildKpi>
        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quest Formats</p>
            <Users className="h-4 w-4 text-sky-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {new Set(filteredQuests.map((quest) => (quest.track === 'OPEN' ? 'solo' : 'squad'))).size}
          </p>
          <p className="mt-1 text-xs text-slate-500">Solo and squad delivery modes</p>
        </GuildKpi>
      </section>

      <GuildPanel className="space-y-4 p-4 sm:p-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by title, category, skills, or company"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="pl-9"
          />
        </div>

        {!isBootcampOnlyView ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Format</span>
            {([
              { value: 'all', label: 'All' },
              { value: 'solo', label: 'Solo' },
              { value: 'squad', label: 'Squad' },
            ] as const).map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={formatFilter === option.value ? 'default' : 'outline'}
                onClick={() => setFormatFilter(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        ) : null}
      </GuildPanel>

      {filteredQuests.length === 0 ? (
        <GuildPanel className="p-12 text-center">
          <Target className="mx-auto mb-4 h-14 w-14 text-slate-400" />
          <h3 className="text-xl font-semibold text-slate-900">No quests found</h3>
          <p className="mt-2 text-sm text-slate-500">Try adjusting your search or format filter.</p>
          <Button
            className="mt-4"
            onClick={() => {
              setSearchTerm('');
              setFormatFilter('all');
            }}
          >
            Reset View
          </Button>
        </GuildPanel>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredQuests.map((quest) => {
            const collaborationBadge = getCollaborationBadge(quest);

            return (
              <GuildCard key={quest.id} className="border-slate-200/80">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="line-clamp-2 text-lg">{quest.title}</CardTitle>
                      <CardDescription className="mt-1 truncate">
                        Posted by {quest.company?.name || 'Unknown Company'}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{quest.difficulty}-Rank</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="capitalize">{quest.questCategory}</Badge>
                    <Badge variant="outline" className="capitalize">{quest.questType.replace('_', ' ')}</Badge>
                    <Badge variant="outline" className={collaborationBadge.className}>
                      {collaborationBadge.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-slate-600">{quest.description}</p>

                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                    <div className="flex items-center gap-1 text-slate-700">
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      {quest.xpReward} XP
                    </div>
                    <div className="text-slate-700">{quest.skillPointsReward} SP</div>
                    {quest.monetaryReward ? (
                      <div className="col-span-2 font-semibold text-emerald-600">
                        ${getRewardAmount(quest.monetaryReward)} reward
                      </div>
                    ) : null}
                  </div>

                  {quest.requiredSkills?.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {quest.requiredSkills.slice(0, 3).map((skill) => (
                        <Badge key={`${quest.id}-${skill}`} variant="outline" className="text-[11px]">
                          {skill}
                        </Badge>
                      ))}
                      {quest.requiredSkills.length > 3 ? (
                        <Badge variant="outline" className="text-[11px]">+{quest.requiredSkills.length - 3}</Badge>
                      ) : null}
                    </div>
                  ) : null}

                  {quest.deadline ? (
                    <div className="mt-4 flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      Due {new Date(quest.deadline).toLocaleDateString()}
                    </div>
                  ) : null}

                  <Button className="mt-4 w-full" asChild>
                    <Link href={`/dashboard/quests/${quest.id}`}>
                      View Quest Details
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </GuildCard>
            );
          })}
        </section>
      )}
    </GuildPage>
  );
}
