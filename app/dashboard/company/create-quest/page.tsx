'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const QUEST_CATEGORIES = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Full Stack' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'ai_ml', label: 'AI / ML' },
  { value: 'devops', label: 'DevOps' },
  { value: 'security', label: 'Security' },
  { value: 'qa', label: 'QA' },
  { value: 'design', label: 'Design' },
  { value: 'data_science', label: 'Data Science' },
];

const QUEST_TYPES = [
  { value: 'commission', label: 'Commission' },
  { value: 'bug_bounty', label: 'Bug Bounty' },
  { value: 'code_refactor', label: 'Code Refactor' },
  { value: 'internal', label: 'Internal' },
  { value: 'learning', label: 'Learning' },
];

const DIFFICULTY_RANKS = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];

export default function CreateQuestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    description: '',
    detailed_description: '',
    quest_type: 'commission',
    quest_category: 'frontend',
    difficulty: 'D',
    xp_reward: 500,
    skill_points_reward: 10,
    monetary_reward: '',
    required_skills: '',
    required_rank: '',
    max_participants: 1,
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

  if (status === 'unauthenticated' || session?.user?.role !== 'company') {
    router.push('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        detailed_description: form.detailed_description.trim() || null,
        quest_type: form.quest_type,
        quest_category: form.quest_category,
        difficulty: form.difficulty,
        xp_reward: Number(form.xp_reward),
        skill_points_reward: Number(form.skill_points_reward),
        monetary_reward: form.monetary_reward ? Number(form.monetary_reward) : null,
        required_skills: form.required_skills
          ? form.required_skills.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        required_rank: form.required_rank || null,
        max_participants: Number(form.max_participants) || 1,
        deadline: form.deadline || null,
      };

      const res = await fetch('/api/company/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Quest created successfully!');
        router.push('/dashboard/company/quests');
      } else {
        setError(data.error || 'Failed to create quest');
      }
    } catch (err) {
      console.error('Error creating quest:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard/company/quests">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quests
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Quest</CardTitle>
          <CardDescription>
            Post a quest for adventurers to take on
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Quest Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Build a user authentication API"
                value={form.title}
                onChange={e => updateField('title', e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Short Description *</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the quest..."
                value={form.description}
                onChange={e => updateField('description', e.target.value)}
                rows={3}
                required
              />
            </div>

            {/* Detailed Description */}
            <div className="space-y-2">
              <Label htmlFor="detailed_description">Detailed Requirements</Label>
              <Textarea
                id="detailed_description"
                placeholder="Detailed requirements, acceptance criteria, etc..."
                value={form.detailed_description}
                onChange={e => updateField('detailed_description', e.target.value)}
                rows={6}
              />
            </div>

            {/* Type & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quest Type</Label>
                <Select value={form.quest_type} onValueChange={v => updateField('quest_type', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUEST_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.quest_category} onValueChange={v => updateField('quest_category', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUEST_CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Difficulty & Required Rank */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={form.difficulty} onValueChange={v => updateField('difficulty', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_RANKS.map(r => (
                      <SelectItem key={r} value={r}>{r}-Rank</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Minimum Rank Required</Label>
                <Select value={form.required_rank} onValueChange={v => updateField('required_rank', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any rank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Rank</SelectItem>
                    {DIFFICULTY_RANKS.map(r => (
                      <SelectItem key={r} value={r}>{r}-Rank</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Rewards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="xp_reward">XP Reward *</Label>
                <Input
                  id="xp_reward"
                  type="number"
                  min={0}
                  value={form.xp_reward}
                  onChange={e => updateField('xp_reward', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill_points_reward">Skill Points</Label>
                <Input
                  id="skill_points_reward"
                  type="number"
                  min={0}
                  value={form.skill_points_reward}
                  onChange={e => updateField('skill_points_reward', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monetary_reward">Payment (INR)</Label>
                <Input
                  id="monetary_reward"
                  type="number"
                  min={0}
                  placeholder="Optional"
                  value={form.monetary_reward}
                  onChange={e => updateField('monetary_reward', e.target.value)}
                />
              </div>
            </div>

            {/* Skills & Participants */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="required_skills">Required Skills</Label>
                <Input
                  id="required_skills"
                  placeholder="React, Node.js, PostgreSQL"
                  value={form.required_skills}
                  onChange={e => updateField('required_skills', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Comma-separated</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_participants">Max Participants</Label>
                <Input
                  id="max_participants"
                  type="number"
                  min={1}
                  value={form.max_participants}
                  onChange={e => updateField('max_participants', e.target.value)}
                />
              </div>
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={form.deadline}
                onChange={e => updateField('deadline', e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Quest...' : 'Create Quest'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
