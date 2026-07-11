'use client';

// Admin / PM editor for QuestFieldTemplates — the editable half of the
// DB-driven Quest Context Loop. Brief and submission fields are edited as JSON
// (a FieldDef[] each) so the same shape the AI Product Manager (guild-ai) will
// generate can be authored by hand here.

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Plus, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import { QUEST_CATEGORIES, QUEST_TYPES } from '@/lib/quest-constants';
import { asFieldDefs } from '@/lib/quest-field-templates';

interface Template {
  id: string;
  name: string;
  description: string | null;
  questCategory: string | null;
  questType: string | null;
  briefFields: unknown;
  submissionFields: unknown;
  defaultCriteria: string[];
  isActive: boolean;
  isDefault: boolean;
  _count?: { quests: number };
}

const BLANK = {
  id: '',
  name: '',
  description: '',
  questCategory: '',
  questType: '',
  briefFieldsJson: '[]',
  submissionFieldsJson: '[]',
  criteriaText: '',
  isDefault: false,
};

export default function QuestTemplatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...BLANK });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && session?.user?.role !== 'admin') router.push('/dashboard');
  }, [status, session, router]);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const res = await fetchWithAuth('/api/admin/quest-field-templates');
    const data = await res.json();
    setTemplates(data.templates ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const loadIntoForm = (t: Template) => {
    setForm({
      id: t.id,
      name: t.name,
      description: t.description ?? '',
      questCategory: t.questCategory ?? '',
      questType: t.questType ?? '',
      briefFieldsJson: JSON.stringify(t.briefFields ?? [], null, 2),
      submissionFieldsJson: JSON.stringify(t.submissionFields ?? [], null, 2),
      criteriaText: (t.defaultCriteria ?? []).join('\n'),
      isDefault: t.isDefault,
    });
    setEditing(true);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => { setForm({ ...BLANK }); setEditing(false); };

  const save = async () => {
    let briefFields: unknown;
    let submissionFields: unknown;
    try {
      briefFields = JSON.parse(form.briefFieldsJson);
      submissionFields = JSON.parse(form.submissionFieldsJson);
    } catch {
      toast.error('Brief / submission fields must be valid JSON arrays.');
      return;
    }
    if (asFieldDefs(briefFields).length !== (briefFields as unknown[]).length ||
        asFieldDefs(submissionFields).length !== (submissionFields as unknown[]).length) {
      toast.error('Every field needs at least a "key" and a "label".');
      return;
    }

    setSaving(true);
    const payload = {
      id: form.id || undefined,
      name: form.name.trim(),
      description: form.description.trim() || null,
      questCategory: form.questCategory || null,
      questType: form.questType || null,
      briefFields,
      submissionFields,
      defaultCriteria: form.criteriaText.split('\n').map((s) => s.trim()).filter(Boolean),
      isDefault: form.isDefault,
    };
    const res = await fetchWithAuth('/api/admin/quest-field-templates', {
      method: form.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      toast.success(form.id ? 'Template updated' : 'Template created');
      resetForm();
      fetchTemplates();
    } else {
      toast.error(data.error || 'Failed to save template');
    }
  };

  const disable = async (id: string) => {
    const res = await fetchWithAuth(`/api/admin/quest-field-templates?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) { toast.success('Template disabled'); fetchTemplates(); }
    else toast.error(data.error || 'Failed');
  };

  const enable = async (id: string) => {
    const res = await fetchWithAuth(`/api/admin/quest-field-templates`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: true })
    });
    const data = await res.json();
    if (data.success) { toast.success('Template enabled'); fetchTemplates(); }
    else toast.error(data.error || 'Failed');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/admin" className="text-slate-400 transition-colors hover:text-slate-200">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Layers className="h-6 w-6 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold">Quest Field Templates</h1>
            <p className="text-sm text-slate-400">
              Define the structured fields each work type collects on both sides of a quest.
            </p>
          </div>
        </div>

        {/* Editor */}
        <Card className="mb-8 border-slate-800 bg-slate-900">
          <CardHeader>
            <CardTitle className="text-base">{editing ? 'Edit template' : 'New template'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  className="bg-slate-950 border-slate-700"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Backend / API task"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  className="bg-slate-950 border-slate-700"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.questCategory || 'any'} onValueChange={(v) => setForm((f) => ({ ...f, questCategory: v === 'any' ? '' : v }))}>
                  <SelectTrigger className="bg-slate-950 border-slate-700"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any category</SelectItem>
                    {QUEST_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quest type</Label>
                <Select value={form.questType || 'any'} onValueChange={(v) => setForm((f) => ({ ...f, questType: v === 'any' ? '' : v }))}>
                  <SelectTrigger className="bg-slate-950 border-slate-700"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any type</SelectItem>
                    {QUEST_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label>Brief fields (JSON — company fills)</Label>
                <Textarea
                  className="bg-slate-950 border-slate-700 font-mono text-xs min-h-[180px]"
                  value={form.briefFieldsJson}
                  onChange={(e) => setForm((f) => ({ ...f, briefFieldsJson: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Submission fields (JSON — adventurer fills)</Label>
                <Textarea
                  className="bg-slate-950 border-slate-700 font-mono text-xs min-h-[180px]"
                  value={form.submissionFieldsJson}
                  onChange={(e) => setForm((f) => ({ ...f, submissionFieldsJson: e.target.value }))}
                />
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Each field: <code>{`{ "key", "label", "type": "text|textarea|url|number|checkbox|select|list", "required", "placeholder", "helpText", "options" }`}</code>
            </p>

            <div className="space-y-2">
              <Label>Default acceptance criteria (one per line)</Label>
              <Textarea
                className="bg-slate-950 border-slate-700 min-h-[90px]"
                value={form.criteriaText}
                onChange={(e) => setForm((f) => ({ ...f, criteriaText: e.target.value }))}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-300">
              <Checkbox checked={form.isDefault} onCheckedChange={(v) => setForm((f) => ({ ...f, isDefault: v === true }))} />
              Use as the fallback template when no category matches
            </label>

            <div className="flex gap-2">
              <Button onClick={save} disabled={saving || !form.name.trim()} className="bg-orange-600 hover:bg-orange-500">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {form.id ? 'Update template' : 'Create template'}
              </Button>
              {editing && <Button variant="ghost" onClick={resetForm} className="text-slate-400">Cancel</Button>}
            </div>
          </CardContent>
        </Card>

        {/* List */}
        <div className="space-y-3">
          {templates.map((t) => (
            <Card key={t.id} className="border-slate-800 bg-slate-900">
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-100">{t.name}</span>
                    {t.isDefault && <Badge variant="outline" className="border-orange-600/40 text-orange-400">default</Badge>}
                    {!t.isActive && <Badge variant="outline" className="border-red-700 text-red-400">disabled</Badge>}
                    <Badge variant="outline" className="border-slate-700 text-slate-400">
                      {t.questCategory ?? 'any'}{t.questType ? ` · ${t.questType}` : ''}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {asFieldDefs(t.briefFields).length} brief · {asFieldDefs(t.submissionFields).length} submission ·{' '}
                    {t.defaultCriteria?.length ?? 0} criteria · {t._count?.quests ?? 0} quests
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="outline" className="border-slate-700" onClick={() => loadIntoForm(t)}>Edit</Button>
                  {t.isActive ? (
                    <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-950/40" onClick={() => disable(t.id)}>
                      Disable
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" className="text-emerald-400 hover:bg-emerald-950/40" onClick={() => enable(t.id)}>
                      Enable
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {templates.length === 0 && (
            <Card className="border-slate-800 bg-slate-900 py-12 text-center">
              <CardContent>
                <Plus className="mx-auto mb-2 h-8 w-8 text-slate-600" />
                <p className="text-slate-400">No templates yet. Create one above.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
