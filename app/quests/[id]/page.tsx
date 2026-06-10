/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
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
      <div className="min-h-screen bg-background ds-page-grain pt-24 relative">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.1),transparent_50%)]" />
        <div className="container px-6 mx-auto max-w-5xl py-10 relative z-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 mb-8 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to quests
          </button>
          <div className="rounded-2xl border border-border/70 bg-white/90 p-8 space-y-6 shadow-[0_12px_40px_rgba(15,23,42,0.03)] backdrop-blur">
            <div className="flex gap-4">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-32 rounded-full" />
            </div>
            <Skeleton className="h-8 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/3 rounded-lg" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <div className="flex gap-3 flex-wrap">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quest) {
    return (
      <div className="min-h-screen bg-background ds-page-grain py-20 relative">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.1),transparent_50%)]" />
        <div className="container px-6 mx-auto max-w-5xl text-center relative z-10">
          <XCircle className="w-16 h-16 mx-auto text-slate-300 mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Quest not found</h2>
          <p className="text-sm text-slate-500 mb-6">
            This quest may have been filled, cancelled, or removed.
          </p>
          <Button asChild variant="outline" className="border-slate-300 bg-white hover:bg-slate-50">
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
    { label: `${quest.xpReward} XP`, icon: <Zap className="w-4 h-4" />, color: 'text-orange-600 border-orange-100 bg-orange-50/50' },
    quest.monetaryReward != null && {
      label: `$${quest.monetaryReward}`,
      icon: <DollarSign className="w-4 h-4" />,
      color: 'text-emerald-700 border-emerald-100 bg-emerald-50/50',
    },
    quest.maxParticipants && quest.maxParticipants > 1 && {
      label: `${quest.maxParticipants} slots`,
      icon: <Users className="w-4 h-4" />,
      color: 'text-sky-700 border-sky-100 bg-sky-50/50',
    },
  ].filter(Boolean) as { label: string; icon: React.ReactNode; color: string }[];

  return (
    <div className="min-h-screen bg-background ds-page-grain relative pt-24 pb-16">
      {/* Top radial light spreads */}
      <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.12),transparent_60%)] pointer-events-none" />
      <div className="absolute right-[-8rem] top-20 h-80 w-80 rounded-full bg-orange-100/30 blur-3xl pointer-events-none" />
      
      {/* Sub Navigation Bar — sticks below the global fixed nav (top-[72px]) */}
      <div className="sticky top-[72px] z-40 border-b border-border/70 bg-white/80 backdrop-blur-md">
        <div className="container px-6 mx-auto max-w-5xl h-14 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-950 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to quests
          </button>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      setIsBookmarked(!isBookmarked);
                      toast(isBookmarked ? 'Removed from bookmarks' : 'Saved to bookmarks');
                    }}
                    className="p-2 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 transition-colors"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`}
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
                          text: `Check out this quest on Guild!`,
                          url: `${typeof window !== 'undefined' ? window.location.origin : ''}/quests/${quest.id}`,
                        });
                      } else {
                        navigator.clipboard.writeText(
                          `${typeof window !== 'undefined' ? window.location.origin : ''}/quests/${quest.id}`
                        );
                        toast('Link copied to clipboard!');
                      }
                    }}
                    className="p-2 rounded-lg text-slate-500 hover:text-orange-600 hover:bg-slate-100 transition-colors"
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
      <div className="container px-6 mx-auto max-w-5xl py-10 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <RankBadge rank={quest.difficulty as Rank} size="lg" glow />
            <Badge
              variant="secondary"
              className="text-xs capitalize bg-white border border-slate-200 text-slate-600 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            >
              {quest.questCategory.replace(/_/g, ' ')}
              {quest.track && quest.track !== 'OPEN' && (
                <span className="ml-1 opacity-60">· {quest.track.toLowerCase()}</span>
              )}
            </Badge>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 leading-tight tracking-tight font-display">
            {quest.title}
          </h1>

          <div className="flex items-center gap-2 text-slate-500 text-sm mb-6 flex-wrap">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-800">{quest.company}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {quest.deadline ? formatDeadline(quest.deadline) : 'No deadline'}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {quest.applicants} adventurer{quest.applicants !== 1 ? 's' : ''} applied
            </span>
          </div>
        </div>

        {/* Reward Chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {rewardBadges.map((badge, i) => (
            <div
              key={i}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-sm shadow-[0_1px_2px_rgba(0,0,0,0.01)] ${badge.color}`}
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
            <Card className="border-border/75 bg-white/95 shadow-[0_12px_40px_rgba(15,23,42,0.03)] backdrop-blur rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 font-display">
                  Quest Brief
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-slate-600 text-sm">
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => <p className="mb-4 last:mb-0 leading-relaxed" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
                      li: ({ node, ...props }) => <li className="text-slate-600" {...props} />,
                      h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-3 mt-4 text-slate-900" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-base font-bold mb-2 mt-3 text-slate-900" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-sm font-semibold mb-2 mt-3 text-slate-800" {...props} />,
                      a: ({ node, ...props }) => <a className="text-orange-500 underline hover:text-orange-600" {...props} />,
                      code: ({ node, ...props }) => <code className="bg-slate-100 text-orange-600 px-1.5 py-0.5 rounded text-xs font-mono" {...props} />,
                      pre: ({ node, ...props }) => <pre className="bg-slate-50 border border-slate-100 p-3 rounded-lg overflow-x-auto my-3 font-mono text-xs text-slate-700" {...props} />,
                    }}
                  >
                    {quest.description}
                  </ReactMarkdown>
                </div>
                {quest.detailedDescription && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">
                      Detailed Requirements
                    </p>
                    <div className="text-slate-600 text-sm">
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => <p className="mb-4 last:mb-0 leading-relaxed" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
                          li: ({ node, ...props }) => <li className="text-slate-600" {...props} />,
                          h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-3 mt-4 text-slate-900" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-base font-bold mb-2 mt-3 text-slate-900" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-sm font-semibold mb-2 mt-3 text-slate-800" {...props} />,
                          a: ({ node, ...props }) => <a className="text-orange-500 underline hover:text-orange-600" {...props} />,
                          code: ({ node, ...props }) => <code className="bg-slate-100 text-orange-600 px-1.5 py-0.5 rounded text-xs font-mono" {...props} />,
                          pre: ({ node, ...props }) => <pre className="bg-slate-50 border border-slate-100 p-3 rounded-lg overflow-x-auto my-3 font-mono text-xs text-slate-700" {...props} />,
                        }}
                      >
                        {quest.detailedDescription}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Required Skills */}
            {quest.requiredSkills.length > 0 && (
              <Card className="border-border/75 bg-white/95 shadow-[0_12px_40px_rgba(15,23,42,0.03)] backdrop-blur rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900 font-display">
                    Required Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {quest.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-700 font-medium"
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
              <Card className="border-border/75 bg-white/95 shadow-[0_12px_40px_rgba(15,23,42,0.03)] backdrop-blur rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900 font-display">
                    Rank Requirement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm">
                    You need to be at least{' '}
                    <RankBadge rank={quest.requiredRank as Rank} size="md" glow />{' '}
                    <span className="font-semibold text-slate-800">{quest.requiredRank}-Rank</span> or above
                    to take on this quest.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* CTA: Sign up to claim */}
            <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50/50 p-8 text-center shadow-[0_10px_30px_rgba(249,115,22,0.02)]">
              <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">
                Ready to Accept This Quest?
              </h3>
              <p className="text-sm text-slate-600 mb-5 max-w-md mx-auto">
                Join the Guild, claim this quest, earn verified XP and real money
                when you deliver.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                  <Link href="/register">
                    <Sword className="w-4 h-4 mr-2" />
                    Join & Claim Quest
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-11 rounded-xl border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
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
            <Card className="border-border/75 bg-white/95 shadow-[0_12px_40px_rgba(15,23,42,0.03)] backdrop-blur rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider font-display">
                  Mission Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Category</span>
                  <span className="text-slate-800 font-semibold capitalize">
                    {quest.questCategory.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Difficulty</span>
                  <RankBadge rank={quest.difficulty as Rank} size="sm" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Track</span>
                  <Badge
                    variant="secondary"
                    className={`text-xs font-semibold capitalize px-2 py-0.5 ${
                      quest.track === 'OPEN'
                        ? 'bg-blue-50/80 text-blue-700 border-blue-200'
                        : quest.track === 'INTERN'
                        ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200'
                        : 'bg-purple-50/80 text-purple-700 border-purple-200'
                    }`}
                  >
                    {quest.track.toLowerCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Max Slots</span>
                  <span className="text-slate-800 font-semibold">
                    {quest.maxParticipants || 'Solo Quest'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Posted</span>
                  <span className="text-slate-600 font-medium text-xs">
                    {new Date(quest.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Deadline</span>
                  <span className="text-slate-800 font-semibold text-xs bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
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
            <Card className="border-border/75 bg-white/95 shadow-[0_12px_40px_rgba(15,23,42,0.03)] backdrop-blur rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider font-display">
                  How to Apply
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2.5">
                  <span className="text-orange-500 font-bold mt-0.5">1</span>
                  <span className="text-slate-600 font-medium">Register on Guild</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-orange-500 font-bold mt-0.5">2</span>
                  <span className="text-slate-600 font-medium">Meet the rank requirement</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-orange-500 font-bold mt-0.5">3</span>
                  <span className="text-slate-600 font-medium">Click &#34;Claim Quest&#34; above</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-orange-500 font-bold mt-0.5">4</span>
                  <span className="text-slate-600 font-medium">
                    Complete and submit for review
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-orange-500 font-bold mt-0.5">5</span>
                  <span className="text-slate-700 font-semibold">
                    Get paid & earn XP on approval ✓
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Share Card */}
            <Card className="border-border/75 bg-white/95 shadow-[0_12px_40px_rgba(15,23,42,0.03)] backdrop-blur rounded-2xl">
              <CardContent className="pt-4">
                <p className="text-xs text-slate-500 mb-3 text-center font-medium">Share this quest</p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => {
                      const text = `🔥 ${quest.title} on @AdventurersGuild — ${quest.xpReward} XP, $${quest.monetaryReward || 'XP only'}. Claim it!`;
                      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
                      window.open(url, '_blank', 'width=550,height=420');
                    }}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.share) {
                        navigator.share({
                          title: quest.title,
                          text: `Check out this coding quest on Guild!`,
                          url: window.location.href,
                        });
                      }
                    }}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
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
          <h2 className="text-lg font-bold text-slate-900 mb-6 font-display">
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
          <div key={i} className="rounded-2xl border border-border/70 bg-white/90 p-5 space-y-3 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-6 w-3/4 rounded-lg" />
            <Skeleton className="h-20 w-full rounded-xl" />
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
          className="rounded-2xl border border-border/70 bg-white/92 hover:bg-white hover:border-orange-200 transition-all duration-200 cursor-pointer group p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(249,115,22,0.03)]"
          onClick={() => router.push(`/quests/${quest.id}`)}
        >
          <div className="flex items-center justify-between mb-3">
            <RankBadge rank={quest.difficulty} size="sm" />
            <Badge variant="secondary" className="text-[10px] capitalize bg-slate-50 border border-slate-200 text-slate-600">
              {quest.questCategory}
            </Badge>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 leading-snug mb-1 group-hover:text-orange-600 transition-colors line-clamp-2">
            {quest.title}
          </h3>
          <p className="text-xs text-slate-500 mb-3">{quest.company}</p>
          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 mt-2">
            <span className="text-slate-600 flex items-center gap-1 font-medium">
              <Zap className="w-3.5 h-3.5 text-orange-500" />
              {quest.xpReward} XP
            </span>
            <span className="text-slate-500 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
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