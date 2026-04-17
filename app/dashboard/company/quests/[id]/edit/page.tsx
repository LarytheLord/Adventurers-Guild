'use client';

import { useState, useEffect, use } from 'react';
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
  Save,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { GuildCard, GuildChip, GuildHero, GuildPage } from '@/components/guild/primitives';
import { QUEST_CATEGORIES, QUEST_TYPES, DIFFICULTY_RANKS } from '@/lib/quest-constants';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

interface QuestData {
  id: string;
  title: string;
  description: string;
  detailedDescription?: string | null;
  questType: string;
  questCategory: string;
  difficulty: string;
  xpReward: number;
  skillPointsReward: number;
  monetaryReward?: number | null;
  requiredSkills: string[];
  requiredRank?: string | null;
  maxParticipants?: number | null;
  deadline?: string | null;
  status: string;
  companyId?: string | null;
}

export default function EditQuestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
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

  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [questData, setQuestData] = useState<QuestData | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated' && session?.user?.role !== 'company' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    if (status !== 'authenticated') return;

    const fetchQuest = async () => {
      try {
        const res = await fetchWithAuth(`/api/quests/${id}`);
        const data = await res.json();
        if (!data.success) {
          toast.error('Quest not found');
          router.push('/dashboard/company/quests');
          return;
        }
        const q: QuestData = data.quest;
        setQuestData(q);

        // Verify ownership (admin can edit any quest)
        if (session?.user?.role === 'company' && q.companyId !== session.user.id) {
          toast.error('You do not own this quest');
          router.push('/dashboard/company/quests');
          return;
        }

        // Pre-fill form
        setForm({
          title: q.title,
          description: q.description,
          detailedDescription: q.detailedDescription || '',
          questType: q.questType,
          questCategory: q.questCategory,
          difficulty: q.difficulty,
          xpReward: q.xpReward,
          skillPointsReward: q.skillPointsReward,
          monetaryReward: q.monetaryReward != null ? String(q.monetaryReward) : '',
          requiredSkills: q.requiredSkills.join(', '),
          requiredRank: q.requiredRank || '',
          maxParticipants: q.maxParticipants ?? 1,
          deadline: q.deadline ? new Date(q.deadline).toISOString().split('T')[0] : '',
        });
      } catch {
        toast.error('Failed to load quest');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchQuest();
  }, [id, status, session, router]);

  const skillPreview = form.requiredSkills
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 6);

  const updateField = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const backHref = `/dashboard/company/quests/${id}`;

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
        questId: id,
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
          ? form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        requiredRank: form.requiredRank || null,
        maxParticipants: Number(form.maxParticipants) || 1,
        deadline: form.deadline || null,
      };

      const response = await fetchWithAuth('/api/company/quests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Quest updated successfully!');
        router.push(backHref);
        router.refresh();
      } else {
        setError(data.error || 'Failed to update quest');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!questData) return null;

  return (
    <GuildPage>
      <GuildHero>
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge className="rounded-full border border-sky-300 bg-sky-100 text-sky-700">
              Edit Quest
            </Badge>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Edit Quest</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                Update the quest details. Changes take effect immediately for adventurers browsing the board.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <GuildChip>Live editing</GuildChip>
              <GuildChip>Instant publish</GuildChip>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4" />
              Back to Quest
            </Link>
          </Button>
        </div>
      </GuildHero>

      <GuildCard className="border-slate-200/80">
        <CardHeader className="border-b border-slate-200/80 bg-slate-50/70">
          <CardTitle className="text-xl">Quest Specification</CardTitle>
          <CardDescription>
            Update the fields below. All changes are saved immediately on submit.
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
                    onChange={e => updateField('title', e.target.value)}
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
                    onChange={e => updateField('description', e.target.value)}
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
                    onChange={e => updateField('detailedDescription', e.target.value)}
                    rows={7}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requiredSkills">Required Skills</Label>
                  <Input
                    id="requiredSkills"
                    placeholder="React, Node.js, PostgreSQL"
                    value={form.requiredSkills}
                    onChange={e => updateField('requiredSkills', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated</p>
                  {skillPreview.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {skillPreview.map(skill => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="space-y-2">
                    <Label>Quest Type</Label>
                    <Select value={form.questType} onValueChange={v => updateField('questType', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {QUEST_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={form.questCategory} onValueChange={v => updateField('questCategory', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {QUEST_CATEGORIES.map(c => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select value={form.difficulty} onValueChange={v => updateField('difficulty', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DIFFICULTY_RANKS.map(r => (
                          <SelectItem key={r} value={r}>{r}-Rank</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Rank Required</Label>
                    <Select
                      value={form.requiredRank || 'any'}
                      onValueChange={v => updateField('requiredRank', v === 'any' ? '' : v)}
                    >
                      <SelectTrigger><SelectValue placeholder="Any rank" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Rank</SelectItem>
                        {DIFFICULTY_RANKS.map(r => (
                          <SelectItem key={r} value={r}>{r}-Rank</SelectItem>
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
                      onChange={e => updateField('deadline', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      min={1}
                      value={form.maxParticipants}
                      onChange={e => updateField('maxParticipants', Math.max(1, Number(e.target.value) || 1))}
                    />
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
                    onChange={e => updateField('xpReward', Math.max(0, Number(e.target.value) || 0))}
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
                    onChange={e => updateField('skillPointsReward', Math.max(0, Number(e.target.value) || 0))}
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
                    onChange={e =>
                      updateField('monetaryReward', e.target.value === '' ? '' : String(Math.max(0, Number(e.target.value) || 0)))
                    }
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="outline" asChild>
                <Link href={backHref}>
                  <ArrowLeft className="h-4 w-4" />
                  Cancel
                </Link>
              </Button>
              <Button type="submit" className="sm:min-w-[180px]" disabled={loading}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
                ) : (
                  <><Save className="h-4 w-4" />Save Changes</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </GuildCard>
    </GuildPage>
  );
}
