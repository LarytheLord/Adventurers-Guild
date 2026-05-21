/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Zap,
  DollarSign,
  Users,
  Target,
  FileText,
  Sparkles,
  ShieldCheck,
  Award,
  MessageCircle,
  Share2,
  Bookmark,
  CheckCircle2,
  XCircle,
  Building2,
  Sword,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RankBadge } from '@/components/ui/rank-badge';
import type { Rank } from '@/components/ui/rank-badge';
import { toast } from 'sonner';

interface Quest {
  id: string;
  title: string;
  description: string;
  detailedDescription?: string;
  company: string;
  companyEmail?: string;
  difficulty: string;
  xpReward: number;
  monetaryReward: number | null;
  deadline: string | null;
  requiredSkills: string[];
  requiredRank?: string;
  maxParticipants: number | null;
  questCategory: string;
  applicants: number;
  track: string;
  createdAt: string;
}

export default function QuestDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const questId = params?.id;

  const [quest, setQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    if (!questId) return;
    fetchQuest();
  }, [questId]);

  const fetchQuest = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/public/quests/${questId}`);
      if (!res.ok) throw new Error('Quest not found');
      const data = await res.json();
      setQuest(data.quest);
    } catch (e) {
      setError('Failed to load quest details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 py-20">
        <div className="container px-6 mx-auto max-w-5xl">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-slate-500 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to quests
          </button>
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/50 p-8 space-y-6">
            <div className="flex gap-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-48 w-full" />
            <div className="flex gap-3 flex-wrap">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quest) {
    return (
      <div className="min-h-screen bg-slate-950 py-20">
        <div className="container px-6 mx-auto max-w-5xl text-center">
          <XCircle className="w-16 h-16 mx-auto text-slate-700 mb-4" />
          <h2 className="text-xl font-semibold text-slate-400 mb-2">Quest not found</h2>
          <p className="text-sm text-slate-500 mb-6">
            This quest may have been filled, cancelled, or removed.
          </p>
          <Button asChild variant="outline">
            <Link href="/quests">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to all quests
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const rewardBadges = [
    { label: `${quest.xpReward} XP`, icon: <Zap className="w-4 h-4" />, color: 'text-amber-400' },
    quest.monetaryReward != null && {
      label: `$${quest.monetaryReward}`,
      icon: <DollarSign className="w-4 h-4" />,
      color: 'text-emerald-400',
    },
    quest.maxParticipants && quest.maxParticipants > 1 && {
      label: `${quest.maxParticipants} slots`,
      icon: <Users className="w-4 h-4" />,
      color: 'text-sky-400',
    },
  ].filter(Boolean) as { label: string; icon: React.ReactNode; color: string }[];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-30 border-b border-slate-800/60 bg-slate-950/90 backdrop-blur-md">
        <div className="container px-6 mx-auto max-w-5xl h-14 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to quests
          </button>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      setIsBookmarked(!isBookmarked);
                      toast(isBookmarked ? 'Removed from bookmarks' : 'Saved to bookmarks');
                    }}
                    className="p-2 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-slate-800/60 transition-colors"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isBookmarked ? 'Remove bookmark' : 'Bookmark quest'}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.share) {
                        navigator.share({
                          title: quest.title,
                          text: `Check out this quest on Adventurers Guild!`,
                          url: `${typeof window !== 'undefined' ? window.location.origin : ''}/quests/${quest.id}`,
                        });
                      } else {
                        navigator.clipboard.writeText(
                          `${typeof window !== 'undefined' ? window.location.origin : ''}/quests/${quest.id}`
                        );
                        toast('Link copied to clipboard!');
                      }
                    }}
                    className="p-2 rounded-lg text-slate-500 hover:text-orange-400 hover:bg-slate-800/60 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share quest</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-6 mx-auto max-w-5xl py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <RankBadge rank={quest.difficulty as Rank} size="lg" glow />
            <Badge
              variant="secondary"
              className="text-xs capitalize bg-slate-800/60 text-slate-300 border-slate-700"
            >
              {quest.questCategory.replace(/_/g, ' ')}
              {quest.track && quest.track !== 'OPEN' && (
                <span className="ml-1 opacity-60">· {quest.track.toLowerCase()}</span>
              )}
            </Badge>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
            {quest.title}
          </h1>

          <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
            <Building2 className="w-4 h-4" />
            <span className="font-medium text-slate-300">{quest.company}</span>
            <span>·</span>
            <span>
              <Clock className="w-3.5 h-3.5 inline mr-1" />
              {quest.deadline ? formatDeadline(quest.deadline) : 'No deadline'}
            </span>
            <span>·</span>
            <span>
              <Users className="w-3.5 h-3.5 inline mr-1" />
              {quest.applicants} adventurer{quest.applicants !== 1 ? 's' : ''} applied
            </span>
          </div>
        </div>

        {/* Reward Chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {rewardBadges.map((badge, i) => (
            <div
              key={i}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-sm ${badge.color}`}
            >
              {badge.icon}
              <span className="font-semibold">{badge.label}</span>
            </div>
          ))}
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Left: Description */}
          <div className="space-y-6">
            {/* Quest Brief */}
            <Card className="border-slate-800/60 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-orange-400" />
                  Quest Brief
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {quest.description}
                </p>
                {quest.detailedDescription && (
                  <div className="mt-4 p-4 rounded-lg bg-slate-800/40 border border-slate-700/40">
                    <p className="text-sm text-slate-400 mb-2 font-semibold uppercase tracking-wide">
                      Detailed Requirements
                    </p>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                      {quest.detailedDescription}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Required Skills */}
            {quest.requiredSkills.length > 0 && (
              <Card className="border-slate-800/60 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-sky-400" />
                    Required Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {quest.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-sm text-slate-300 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rank Requirement */}
            {quest.requiredRank && (
              <Card className="border-slate-800/60 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    Rank Requirement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-sm">
                    You need to be at least{' '}
                    <RankBadge rank={quest.requiredRank as Rank} size="md" glow />{' '}
                    <span className="font-semibold">{quest.requiredRank}-Rank</span> or above
                    to take on this quest.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* CTA: Sign up to claim */}
            <div className="rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5 p-6 text-center">
              <Award className="w-8 h-8 text-orange-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Ready to Accept This Quest?
              </h3>
              <p className="text-sm text-slate-400 mb-4 max-w-md mx-auto">
                Join the Guild, claim this quest, earn verified XP and real money
                when you deliver.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="h-11 rounded-xl">
                  <Link href="/register">
                    <Sword className="w-4 h-4 mr-2" />
                    Join & Claim Quest
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-11 rounded-xl border-slate-700"
                  asChild
                >
                  <Link href="/quests">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Browse More Quests
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Details Sidebar */}
          <div className="space-y-5">
            {/* Quest Metadata Card */}
            <Card className="border-slate-800/60 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-slate-300">
                  Mission Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Category</span>
                  <span className="text-slate-300 capitalize">
                    {quest.questCategory.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Difficulty</span>
                  <RankBadge rank={quest.difficulty as Rank} size="sm" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Track</span>
                  <Badge
                    variant="secondary"
                    className={`text-xs capitalize ${
                      quest.track === 'OPEN'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-600/30'
                        : quest.track === 'INTERN'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-600/30'
                        : 'bg-purple-500/10 text-purple-400 border-purple-600/30'
                    }`}
                  >
                    {quest.track.toLowerCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Max Participants</span>
                  <span className="text-slate-300">
                    {quest.maxParticipants || 'Solo'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Posted</span>
                  <span className="text-slate-400 text-xs">
                    {new Date(quest.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Deadline</span>
                  <span className="text-slate-300 text-xs">
                    {quest.deadline
                      ? new Date(quest.deadline).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Open-ended'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* How to Apply Card */}
            <Card className="border-slate-800/60 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-slate-300">
                  How to Apply
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">1</span>
                  <span className="text-slate-400">Register on Adventurers Guild</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">2</span>
                  <span className="text-slate-400">Meet the rank requirement</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">3</span>
                  <span className="text-slate-400">Click &#34;Claim Quest&#34; above</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">4</span>
                  <span className="text-slate-400">
                    Complete and submit for review
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">5</span>
                  <span className="text-slate-400">
                    Get paid & earn XP on approval ✓
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Share Card */}
            <Card className="border-slate-800/60 bg-slate-900/50">
              <CardContent className="pt-4">
                <p className="text-xs text-slate-500 mb-3 text-center">Share this quest</p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => {
                      const text = `🔥 ${quest.title} on @AdventurersGuild — ${quest.xpReward} XP, $${quest.monetaryReward || 'XP only'}. Claim it!`;
                      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
                      window.open(url, '_blank', 'width=550,height=420');
                    }}
                    className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-slate-400 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.share) {
                        navigator.share({
                          title: quest.title,
                          text: `Check out this coding quest on Adventurers Guild!`,
                          url: window.location.href,
                        });
                      }
                    }}
                    className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-slate-400 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Quests */}
        <section className="mt-16">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-400" />
            Similar Quests
          </h2>
          <SimilarQuests currentQuestId={quest.id} category={quest.questCategory} />
        </section>
      </div>
    </div>
  );
}

function SimilarQuests({
  currentQuestId,
  category,
}: {
  currentQuestId: string;
  category: string;
}) {
  const router = useRouter();
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/public/quests?category=${category}&limit=6`)
      .then((r) => r.json())
      .then((data) => {
        setSimilar(
          (data.quests || []).filter((q: any) => q.id !== currentQuestId)
        );
      })
      .finally(() => setLoading(false));
  }, [category, currentQuestId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-800/60 bg-slate-900/50 p-5 space-y-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (similar.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {similar.map((quest: any) => (
        <div
          key={quest.id}
          className="rounded-xl border border-slate-800/60 bg-slate-900/50 hover:bg-slate-900/80 hover:border-slate-700/80 transition-all duration-200 cursor-pointer group p-5"
          onClick={() => router.push(`/quests/${quest.id}`)}
        >
          <div className="flex items-center justify-between mb-3">
            <RankBadge rank={quest.difficulty} size="sm" />
            <Badge variant="secondary" className="text-[10px] capitalize bg-slate-800/60 text-slate-400">
              {quest.questCategory}
            </Badge>
          </div>
          <h3 className="text-sm font-semibold text-white leading-snug mb-1 group-hover:text-orange-400 transition-colors line-clamp-2">
            {quest.title}
          </h3>
          <p className="text-xs text-slate-500 mb-3">{quest.company}</p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">
              <Zap className="w-3 h-3 inline mr-1 text-amber-400" />
              {quest.xpReward} XP
            </span>
            <span className="text-slate-600">
              <Users className="w-3 h-3 inline mr-1" />
              {quest.applicants} applied
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDeadline(iso: string | null): string {
  if (!iso) return 'No deadline';
  const diff = new Date(iso).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return 'Expired';
  if (days === 0) return 'Today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}