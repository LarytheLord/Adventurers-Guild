'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
  Github,
  Loader2,
  Plus,
  Rocket,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { GuildCard, GuildChip, GuildHero, GuildPage } from '@/components/guild/primitives';
import { QUEST_CATEGORIES, QUEST_TYPES, DIFFICULTY_RANKS, getQuestListPath } from '@/lib/quest-constants';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import { FieldRenderer } from '@/components/quest/field-renderer';
import {
  asFieldDefs,
  pickTemplate,
  validateFieldValues,
  type FieldValue,
  type FieldValues,
} from '@/lib/quest-field-templates';
import type { GitHubQuestPrefill } from '@/lib/github-quest-prefill';

interface BriefTemplate {
  id: string;
  name: string;
  description: string | null;
  questCategory: string | null;
  questType: string | null;
  briefFields: unknown;
  submissionFields: unknown;
  defaultCriteria: string[];
  isDefault: boolean;
}

export default function CreateQuestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [intakeMode, setIntakeMode] = useState<'standard' | 'oss'>('standard');
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
    requiredRank: 'F',
    maxParticipants: 1,
    deadline: '',
  });
  const [ossIssueUrl, setOssIssueUrl] = useState('');
  const [ossPartnerName, setOssPartnerName] = useState('');
  const [ossLoading, setOssLoading] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<string[]>([]);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);

  const handleGenerateTasks = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Please fill in the Quest Title and Description first.");
      return;
    }
    setIsGeneratingTasks(true);
    try {
      const res = await fetchWithAuth("/api/quests/generate-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.questCategory,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate tasks");
      }
      setTasks(data.tasks);
      toast.success("Tasks generated successfully! Feel free to edit them.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate tasks");
    } finally {
      setIsGeneratingTasks(false);
    }
  };

  // ── Structured brief (Quest Context Loop) ───────────────────────────────
  const [templates, setTemplates] = useState<BriefTemplate[]>([]);
  const [briefData, setBriefData] = useState<FieldValues>({});
  const [criteria, setCriteria] = useState<string[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const pendingCriteriaRef = useRef<string[] | null>(null);

  useEffect(() => {
    fetchWithAuth('/api/quest-field-templates')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.templates)) setTemplates(data.templates);
      })
      .catch(() => {});
  }, []);

  // Pick the best template for the chosen category/type.
  const selectedTemplate = useMemo(
    () => pickTemplate(templates, form.questCategory, form.questType),
    [templates, form.questCategory, form.questType],
  );

  // When the matched template changes, reset the brief fields + seed criteria.
  useEffect(() => {
    if (!selectedTemplate) return;
    if (selectedTemplate.id === activeTemplateId) return;
    setActiveTemplateId(selectedTemplate.id);
    setBriefData({});
    setCriteria(pendingCriteriaRef.current ?? selectedTemplate.defaultCriteria ?? []);
    pendingCriteriaRef.current = null;
  }, [selectedTemplate, activeTemplateId]);

  const briefFields = useMemo(() => asFieldDefs(selectedTemplate?.briefFields), [selectedTemplate]);

  const updateBrief = (key: string, value: FieldValue) =>
    setBriefData((prev) => ({ ...prev, [key]: value }));

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

  const applyGitHubPrefill = (prefill: GitHubQuestPrefill) => {
    pendingCriteriaRef.current = prefill.acceptanceCriteria;
    setOssPartnerName(prefill.partnerOrgName);
    setOssIssueUrl(prefill.githubIssueUrl);
    setForm((prev) => ({
      ...prev,
      title: prefill.title,
      description: prefill.description,
      detailedDescription: prefill.detailedDescription,
      questType: prefill.questType,
      questCategory: prefill.questCategory,
      difficulty: prefill.difficulty,
      xpReward: prefill.xpReward,
      skillPointsReward: prefill.skillPointsReward,
      requiredSkills: prefill.requiredSkills.join(', '),
      requiredRank: prefill.requiredRank,
      maxParticipants: prefill.maxParticipants,
    }));
    setCriteria(prefill.acceptanceCriteria);
  };

  const handleImportGithubIssue = async () => {
    setError('');

    if (!ossIssueUrl.trim()) {
      setError('Add a GitHub issue URL first.');
      return;
    }

    setOssLoading(true);
    try {
      const response = await fetchWithAuth('/api/company/quests/github-prefill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueUrl: ossIssueUrl.trim(),
          partnerOrgName: ossPartnerName.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!data?.success || !data.prefill) {
        setError(data?.error || 'Failed to import the GitHub issue.');
        return;
      }

      applyGitHubPrefill(data.prefill as GitHubQuestPrefill);
      toast.success('GitHub issue imported into a quest draft.');
    } catch (importError) {
      console.error('Error importing GitHub issue:', importError);
      setError('Failed to import the GitHub issue.');
    } finally {
      setOssLoading(false);
    }
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

    const briefErrors = validateFieldValues(briefFields, briefData);
    if (briefErrors.length > 0) {
      setError(briefErrors[0]);
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
        fieldTemplateId: selectedTemplate?.id ?? null,
        briefData,
        acceptanceCriteria: criteria.map((c) => c.trim()).filter(Boolean),
        partnerOrgName: ossPartnerName.trim() || null,
        track: intakeMode === 'oss' ? 'OPEN' : undefined,
        source: intakeMode === 'oss' ? 'CLIENT_PORTAL' : undefined,
        tasks: tasks.map((t) => t.trim()).filter(Boolean),
      };

      const response = await fetchWithAuth('/api/company/quests', {
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
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-5">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-900">Intake Mode</h3>
                <p className="text-xs text-slate-600">
                  Use the open-source path when a partner already has work written as a GitHub issue.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setIntakeMode('standard')}
                  className={`rounded-xl border p-4 text-left transition ${
                    intakeMode === 'standard'
                      ? 'border-slate-900 bg-white shadow-sm'
                      : 'border-slate-200 bg-white/70 hover:border-slate-300'
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">Standard Quest Form</p>
                  <p className="mt-1 text-xs text-slate-600">
                    Best for normal client briefs where the partner defines the work directly inside the platform.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setIntakeMode('oss')}
                  className={`rounded-xl border p-4 text-left transition ${
                    intakeMode === 'oss'
                      ? 'border-emerald-700 bg-emerald-50 shadow-sm'
                      : 'border-slate-200 bg-white/70 hover:border-slate-300'
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">Open Source Partner Form</p>
                  <p className="mt-1 text-xs text-slate-600">
                    Paste a GitHub issue and we prefill the quest so students get repo context much faster.
                  </p>
                </button>
              </div>

              {intakeMode === 'oss' && (
                <div className="space-y-4 rounded-xl border border-emerald-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-slate-900 p-2 text-white">
                      <Github className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">GitHub Issue Import</h4>
                      <p className="text-xs text-slate-600">
                        We will pull the public issue title, body, labels, and repo metadata to generate a quest draft.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr_auto]">
                    <div className="space-y-2">
                      <Label htmlFor="ossPartnerName">Partner / Org Name</Label>
                      <Input
                        id="ossPartnerName"
                        placeholder="e.g. Open Source Org"
                        value={ossPartnerName}
                        onChange={(event) => setOssPartnerName(event.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ossIssueUrl">GitHub Issue URL</Label>
                      <Input
                        id="ossIssueUrl"
                        placeholder="https://github.com/org/repo/issues/123"
                        value={ossIssueUrl}
                        onChange={(event) => setOssIssueUrl(event.target.value)}
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        className="w-full lg:w-auto"
                        variant="outline"
                        onClick={handleImportGithubIssue}
                        disabled={ossLoading}
                      >
                        {ossLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <Github className="h-4 w-4" />
                            Import Issue
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3 text-xs text-slate-600 md:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      Auto-fills title, summary, repo context, and student-facing brief copy.
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      Suggests category, difficulty, XP, and required skills from labels and issue text.
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      Keeps the normal form editable so your team can tune the draft before publishing.
                    </div>
                  </div>
                </div>
              )}
            </div>

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
                        <SelectItem value="any">F-Rank (open to all)</SelectItem>
                        {DIFFICULTY_RANKS.map((rank) => (
                          <SelectItem key={rank} value={rank}>
                            {rank}-Rank minimum
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

            {/* Structured brief — adapts to the selected work type. */}
            <div className="space-y-5 rounded-xl border border-sky-200/70 bg-sky-50/40 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Structured Brief</h3>
                  <p className="text-xs text-slate-600">
                    {selectedTemplate
                      ? `${selectedTemplate.name} — these fields travel with the quest so the adventurer has every detail.`
                      : 'Loading fields…'}
                  </p>
                </div>
                {selectedTemplate && <Badge variant="outline">{selectedTemplate.name}</Badge>}
              </div>

              {briefFields.length > 0 && (
                <FieldRenderer fields={briefFields} values={briefData} onChange={updateBrief} idPrefix="brief" />
              )}

              {/* Acceptance criteria — what the work is evaluated against. */}
              <div className="space-y-2 border-t border-sky-200/70 pt-4">
                <Label>Acceptance Criteria</Label>
                <p className="text-xs text-slate-600">
                  The reviewer (admin / product manager / client) checks the submission against each line.
                </p>
                <div className="space-y-2">
                  {criteria.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={c}
                        placeholder={`Criterion ${i + 1}`}
                        onChange={(e) =>
                          setCriteria((prev) => prev.map((p, idx) => (idx === i ? e.target.value : p)))
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setCriteria((prev) => prev.filter((_, idx) => idx !== i))}
                        aria-label="Remove criterion"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setCriteria((prev) => [...prev, ''])}>
                  <Plus className="h-4 w-4" /> Add criterion
                </Button>
              </div>

              {/* Quest Checklist Tasks */}
              <div className="space-y-2 border-t border-sky-200/70 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Label>Quest Tasks (To-Do List)</Label>
                    <p className="text-xs text-slate-500">
                      Predefined to-do list tasks that the adventurer must complete to finish the quest.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateTasks}
                    disabled={isGeneratingTasks}
                    className="border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100/70"
                  >
                    {isGeneratingTasks ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                        AI Generate Tasks
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-2 mt-2">
                  {tasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={task}
                        placeholder={`Task ${i + 1}`}
                        onChange={(e) =>
                          setTasks((prev) => prev.map((p, idx) => (idx === i ? e.target.value : p)))
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setTasks((prev) => prev.filter((_, idx) => idx !== i))}
                        aria-label="Remove task"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setTasks((prev) => [...prev, ''])}>
                  <Plus className="h-4 w-4" /> Add Task
                </Button>
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
