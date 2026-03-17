'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircle,
  ArrowLeft,
  Coins,
  Crown,
  Loader2,
  Rocket,
  Sparkles,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { GuildCard, GuildChip, GuildHero, GuildPage } from '@/components/guild/primitives';
import { QUEST_CATEGORIES, QUEST_TYPES, DIFFICULTY_RANKS, getQuestListPath } from '@/lib/quest-constants';

export default function CreateQuestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    description: '',
    detailedDescription: '',
    questType: 'commission',
    questCategory: 'frontend',
    difficulty: 'D',
    xpReward: 500,
    skillPointsReward: 10,
    monetaryReward: '',
    requiredSkills: '',
    requiredRank: '',
    maxParticipants: 1,
    deadline: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (status === 'unauthenticated' || (session?.user?.role !== 'company' && session?.user?.role !== 'admin')) {
    router.push('/dashboard');
    return null;
  }

  const skillPreview = form.requiredSkills
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 6);

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required');
      setLoading(false);
      return;
    }

    try {
      const body = {
        title: form.title.trim(),
        description: form.description.trim(),
        detailedDescription: form.detailedDescription.trim() || null,
        questType: form.questType,
        questCategory: form.questCategory,
        difficulty: form.difficulty,
        xpReward: Number(form.xpReward),
        skillPointsReward: Number(form.skillPointsReward),
        monetaryReward: form.monetaryReward ? Number(form.monetaryReward) : null,
        requiredSkills: form.requiredSkills
          ? form.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        requiredRank: form.requiredRank || null,
        maxParticipants: Number(form.maxParticipants) || 1,
        deadline: form.deadline || null,
      };

      const response = await fetch('/api/company/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Quest created successfully!');
        router.push(getQuestListPath(session?.user?.role ?? ''));
      } else {
        setError(data.error || 'Failed to create quest');
      }
    } catch (submitError) {
      console.error('Error creating quest:', submitError);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuildPage>
      <GuildHero>
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge className="rounded-full border border-sky-300 bg-sky-100 text-sky-700">
              Quest Launch Console
            </Badge>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Create New Quest</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                Define scope, rewards, and rank requirements so the right adventurers apply immediately.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <GuildChip>Structured brief</GuildChip>
              <GuildChip>Rank-aware targeting</GuildChip>
              <GuildChip>Fast publishing</GuildChip>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href={getQuestListPath(session?.user?.role ?? '')}>
              <ArrowLeft className="h-4 w-4" />
              Back to Quests
            </Link>
          </Button>
        </div>
      </GuildHero>

      <GuildCard className="border-slate-200/80">
        <CardHeader className="border-b border-slate-200/80 bg-slate-50/70">
          <CardTitle className="text-xl">Quest Specification</CardTitle>
          <CardDescription>
            Strong briefs reduce review churn and improve delivery quality.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Quest Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Build a user authentication API"
                    value={form.title}
                    onChange={(event) => updateField('title', event.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Short Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the quest..."
                    value={form.description}
                    onChange={(event) => updateField('description', event.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="detailedDescription">Detailed Requirements</Label>
                  <Textarea
                    id="detailedDescription"
                    placeholder="Detailed requirements, acceptance criteria, etc..."
                    value={form.detailedDescription}
                    onChange={(event) => updateField('detailedDescription', event.target.value)}
                    rows={7}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requiredSkills">Required Skills</Label>
                  <Input
                    id="requiredSkills"
                    placeholder="React, Node.js, PostgreSQL"
                    value={form.requiredSkills}
                    onChange={(event) => updateField('requiredSkills', event.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated</p>
                  {skillPreview.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {skillPreview.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="space-y-2">
                    <Label>Quest Type</Label>
                    <Select value={form.questType} onValueChange={(value) => updateField('questType', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QUEST_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={form.questCategory} onValueChange={(value) => updateField('questCategory', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QUEST_CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select value={form.difficulty} onValueChange={(value) => updateField('difficulty', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTY_RANKS.map((rank) => (
                          <SelectItem key={rank} value={rank}>
                            {rank}-Rank
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Rank Required</Label>
                    <Select
                      value={form.requiredRank || 'any'}
                      onValueChange={(value) => updateField('requiredRank', value === 'any' ? '' : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any rank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Rank</SelectItem>
                        {DIFFICULTY_RANKS.map((rank) => (
                          <SelectItem key={rank} value={rank}>
                            {rank}-Rank
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={form.deadline}
                      onChange={(event) => updateField('deadline', event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      min={1}
                      value={form.maxParticipants}
                      onChange={(event) =>
                        updateField('maxParticipants', Math.max(1, Number(event.target.value) || 1))
                      }
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Launch Tips</p>
                  <p className="text-sm text-slate-600">
                    Define acceptance criteria in the detailed section and include tech stack expectations in skills.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1">
                      <Target className="h-3.5 w-3.5" />
                      Clear deliverables
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      Faster reviews
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="xpReward">XP Reward *</Label>
                <div className="relative">
                  <Target className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="xpReward"
                    type="number"
                    min={0}
                    value={form.xpReward}
                    onChange={(event) => updateField('xpReward', Math.max(0, Number(event.target.value) || 0))}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skillPointsReward">Skill Points</Label>
                <div className="relative">
                  <Crown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="skillPointsReward"
                    type="number"
                    min={0}
                    value={form.skillPointsReward}
                    onChange={(event) =>
                      updateField('skillPointsReward', Math.max(0, Number(event.target.value) || 0))
                    }
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monetaryReward">Payment (INR)</Label>
                <div className="relative">
                  <Coins className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="monetaryReward"
                    type="number"
                    min={0}
                    placeholder="Optional"
                    value={form.monetaryReward}
                    onChange={(event) =>
                      updateField(
                        'monetaryReward',
                        event.target.value === '' ? '' : String(Math.max(0, Number(event.target.value) || 0))
                      )
                    }
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="outline" asChild>
                <Link href={getQuestListPath(session?.user?.role ?? '')}>
                  <ArrowLeft className="h-4 w-4" />
                  Cancel
                </Link>
              </Button>
              <Button type="submit" className="sm:min-w-[180px]" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Quest...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    Create Quest
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </GuildCard>
    </GuildPage>
  );
}
