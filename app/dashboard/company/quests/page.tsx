'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Clock,
  Plus,
  Search,
  Sparkles,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

interface Quest {
  id: string;
  title: string;
  description: string;
  questType: string;
  status: string;
  difficulty: string;
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
  _count?: {
    assignments?: number;
  };
}

function statusClass(status: string) {
  switch (status) {
    case 'available':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    case 'in_progress':
      return 'bg-sky-100 text-sky-700 border-sky-300';
    case 'review':
      return 'bg-amber-100 text-amber-700 border-amber-300';
    case 'completed':
      return 'bg-violet-100 text-violet-700 border-violet-300';
    case 'cancelled':
      return 'bg-rose-100 text-rose-700 border-rose-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300';
  }
}

export default function CompanyQuestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'company' && session.user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const fetchCompanyQuests = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/company/quests?limit=80');
        const data = await response.json();

        if (!data.success) {
          setError(data.error || 'Failed to fetch quests');
          return;
        }

        setQuests(data.quests || []);
      } catch (err) {
        console.error('Error fetching company quests:', err);
        setError('An error occurred while fetching quests');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && session?.user) {
      fetchCompanyQuests();
    }
  }, [status, session, router]);

  const filteredQuests = useMemo(
    () =>
      quests.filter((quest) =>
        [quest.title, quest.description, quest.questCategory, quest.status]
          .join(' ')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ),
    [quests, searchTerm]
  );

  if (status === 'loading' || loading) {
    return (
      <div className="guild-page">
        <div className="guild-panel flex min-h-[320px] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="guild-page">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const activeQuests = filteredQuests.filter((quest) => ['available', 'in_progress', 'review'].includes(quest.status)).length;
  const completedQuests = filteredQuests.filter((quest) => quest.status === 'completed').length;

  return (
    <div className="guild-page">
      <section className="guild-hero">
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="rounded-full border border-sky-300 bg-sky-100 text-sky-700">
              Company Quest Operations
            </Badge>
            <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Your Quests</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              Manage every quest lifecycle from posting to completion.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/company">
                Back to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/company/create-quest">
                <Plus className="h-4 w-4" />
                Create Quest
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="guild-kpi sm:col-span-2 xl:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Quests</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{filteredQuests.length}</p>
          <p className="mt-1 text-xs text-slate-500">In your current workspace</p>
        </article>
        <article className="guild-kpi">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active</p>
            <Target className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{activeQuests}</p>
          <p className="mt-1 text-xs text-slate-500">Open, in progress, or review</p>
        </article>
        <article className="guild-kpi">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completed</p>
            <Sparkles className="h-4 w-4 text-violet-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{completedQuests}</p>
          <p className="mt-1 text-xs text-slate-500">Delivered successfully</p>
        </article>
        <article className="guild-kpi">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recruitment Focus</p>
            <Briefcase className="h-4 w-4 text-sky-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {filteredQuests.filter((quest) => (quest._count?.assignments ?? 0) === 0).length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Quests needing applicants</p>
        </article>
      </section>

      <section className="guild-panel p-4 sm:p-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by title, category, or status"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="pl-9"
          />
        </div>
      </section>

      {filteredQuests.length === 0 ? (
        <section className="guild-panel p-12 text-center">
          <Target className="mx-auto mb-4 h-14 w-14 text-slate-400" />
          <h3 className="text-xl font-semibold text-slate-900">No quests found</h3>
          <p className="mt-2 text-sm text-slate-500">Create your first quest to start attracting adventurers.</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/company/create-quest">
              <Plus className="h-4 w-4" />
              Create Quest
            </Link>
          </Button>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredQuests.map((quest) => (
            <Card key={quest.id} className="guild-panel border-slate-200/80">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="line-clamp-2 text-lg">{quest.title}</CardTitle>
                    <CardDescription>
                      Created on {new Date(quest.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className={statusClass(quest.status)}>
                    {quest.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="capitalize">{quest.questCategory}</Badge>
                  <Badge variant="outline">{quest.difficulty}-Rank</Badge>
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
                  {(quest._count?.assignments ?? 0) > 0 && (
                    <div className="col-span-2 flex items-center gap-1 text-slate-600">
                      <Users className="h-3.5 w-3.5" />
                      {quest._count?.assignments} applicant(s)
                    </div>
                  )}
                  {quest.monetaryReward && (
                    <div className="col-span-2 font-semibold text-emerald-600">
                      ${Number(quest.monetaryReward)} budget
                    </div>
                  )}
                </div>

                {quest.deadline && (
                  <div className="mt-4 flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    Due {new Date(quest.deadline).toLocaleDateString()}
                  </div>
                )}

                <Button className="mt-4 w-full" variant="outline" asChild>
                  <Link href={`/dashboard/company/quests/${quest.id}`}>
                    View Details
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
