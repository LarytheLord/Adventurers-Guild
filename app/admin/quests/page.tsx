'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus,
  Search,
  Filter,
  Target,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  StickyNote,
  ArrowLeft,
  Loader2,
  ChevronDown,
  CalendarClock,
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import { useApiFetch } from '@/lib/hooks';
import { QUEST_STATUS_COLORS, QUEST_STATUS_LABELS, RANK_COLORS } from '@/lib/quest-constants';
import { getErrorMessageFromPayload, getStatusFallbackMessage, readResponsePayload } from '@/lib/http';

interface AdminNote {
  id: string;
  timestamp: string;
  author: string;
  note: string;
}

interface QuestItem {
  id: string;
  title: string;
  description: string;
  status: string;
  difficulty: string;
  questType: string;
  questCategory: string;
  xpReward: number;
  skillPointsReward: number;
  requiredSkills: string[];
  maxParticipants: number | null;
  deadline: string | null;
  adminNotes: AdminNote[] | null;
  company: { name: string | null; email: string } | null;
  _count: { assignments: number };
  createdAt: string;
}

interface AdminQuestsResponse {
  success: boolean;
  quests: QuestItem[];
  error?: string;
}

const EMPTY_QUESTS: QuestItem[] = [];

export default function AdminQuestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [noteQuest, setNoteQuest] = useState<QuestItem | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [changingStatusId, setChangingStatusId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search.trim());

  const shouldFetch = status === 'authenticated' && session?.user?.role === 'admin';
  const questsEndpoint = useMemo(() => {
    const params = new URLSearchParams({ limit: '100' });
    if (filterStatus !== 'all') {
      params.set('status', filterStatus);
    }
    if (deferredSearch) {
      params.set('search', deferredSearch);
    }
    return `/api/admin/quests?${params.toString()}`;
  }, [deferredSearch, filterStatus]);

  const {
    data,
    loading,
    error,
    refetch,
    mutate,
  } = useApiFetch<AdminQuestsResponse>(questsEndpoint, {
    skip: !shouldFetch,
  });

  const quests = data?.quests ?? EMPTY_QUESTS;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [router, session, status]);

  const stats = useMemo(
    () => ({
      total: quests.length,
      available: quests.filter((quest) => quest.status === 'available').length,
      inProgress: quests.filter((quest) => quest.status === 'in_progress').length,
      review: quests.filter((quest) => quest.status === 'review').length,
      completed: quests.filter((quest) => quest.status === 'completed').length,
    }),
    [quests]
  );

  const mutateQuests = (updater: (current: QuestItem[]) => QuestItem[]) => {
    mutate({
      success: data?.success ?? true,
      error: data?.error,
      quests: updater(quests),
    });
  };

  const handleStatusChange = async (questId: string, newStatus: string) => {
    setChangingStatusId(questId);
    try {
      const response = await fetchWithAuth('/api/admin/quests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId, status: newStatus }),
      });
      const payload = await readResponsePayload<Record<string, unknown>>(response);

      if (response.ok && payload?.success) {
        mutateQuests((current) =>
          current.map((quest) =>
            quest.id === questId ? { ...quest, status: newStatus } : quest
          )
        );
        toast.success(`Quest status updated to ${QUEST_STATUS_LABELS[newStatus] ?? newStatus}`);
      } else {
        toast.error(getErrorMessageFromPayload(payload, getStatusFallbackMessage(response.status)));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setChangingStatusId(null);
    }
  };

  const openNoteDialog = (quest: QuestItem) => {
    setNoteQuest(quest);
    setNewNoteText('');
  };

  const handleAddNote = async () => {
    if (!noteQuest || !newNoteText.trim()) {
      return;
    }

    setSavingNote(true);
    try {
      const response = await fetchWithAuth('/api/admin/quests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId: noteQuest.id, addNote: newNoteText.trim() }),
      });
      const payload = await readResponsePayload<Record<string, unknown>>(response);

      if (response.ok && payload?.success) {
        const updatedQuest = payload.quest as { adminNotes?: AdminNote[] } | undefined;
        const updatedNotes = updatedQuest?.adminNotes || [];
        setNoteQuest((current) =>
          current ? { ...current, adminNotes: updatedNotes } : null
        );
        mutateQuests((current) =>
          current.map((quest) =>
            quest.id === noteQuest.id ? { ...quest, adminNotes: updatedNotes } : quest
          )
        );
        setNewNoteText('');
        toast.success('Note saved');
      } else {
        toast.error(getErrorMessageFromPayload(payload, getStatusFallbackMessage(response.status)));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setSavingNote(false);
    }
  };

  const handleCancelQuest = async (questId: string) => {
    if (!confirm('Cancel this quest? Adventurers with active assignments will be notified.')) {
      return;
    }

    try {
      const response = await fetchWithAuth('/api/admin/quests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId }),
      });
      const payload = await readResponsePayload<Record<string, unknown>>(response);

      if (response.ok && payload?.success) {
        mutateQuests((current) =>
          current.map((quest) =>
            quest.id === questId ? { ...quest, status: 'cancelled' } : quest
          )
        );
        toast.success('Quest cancelled');
      } else {
        toast.error(getErrorMessageFromPayload(payload, getStatusFallbackMessage(response.status)));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  if (status === 'loading' || (shouldFetch && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status !== 'authenticated' || session?.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl space-y-6 px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4" />
                Admin
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Quest Management</h1>
              <p className="text-sm text-muted-foreground">
                Create, monitor and annotate all quests
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/dashboard/company/create-quest">
              <Plus className="h-4 w-4" />
              Create Quest
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: 'Total', value: stats.total, icon: Target, color: 'text-slate-600' },
            {
              label: 'Available',
              value: stats.available,
              icon: CheckCircle,
              color: 'text-emerald-600',
            },
            {
              label: 'In Progress',
              value: stats.inProgress,
              icon: Clock,
              color: 'text-blue-600',
            },
            { label: 'Review', value: stats.review, icon: AlertCircle, color: 'text-amber-600' },
            {
              label: 'Completed',
              value: stats.completed,
              icon: Users,
              color: 'text-slate-500',
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="p-4">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <p className="mt-1 text-2xl font-bold">{value}</p>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search quests..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              maxLength={120}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  void refetch();
                }
              }}
              className="pl-9"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="review">Under Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              void refetch();
            }}
          >
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {quests.length === 0 ? (
          <Card className="p-12 text-center">
            <Target className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No quests found</h3>
            <p className="mb-6 mt-1 text-muted-foreground">
              Create the first quest for your interns to pick up.
            </p>
            <Button asChild>
              <Link href="/dashboard/company/create-quest">
                <Plus className="h-4 w-4" />
                Create Quest
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {quests.map((quest) => (
              <Card key={quest.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-semibold">{quest.title}</h3>
                        <Badge
                          className={
                            QUEST_STATUS_COLORS[quest.status] ??
                            'bg-slate-100 text-slate-700'
                          }
                          variant="secondary"
                        >
                          {QUEST_STATUS_LABELS[quest.status] ?? quest.status}
                        </Badge>
                        <Badge className={RANK_COLORS[quest.difficulty] ?? ''} variant="secondary">
                          {quest.difficulty}-Rank
                        </Badge>
                      </div>
                      <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                        {quest.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {quest._count.assignments} applicant
                          {quest._count.assignments !== 1 ? 's' : ''}
                          {quest.maxParticipants ? ` / ${quest.maxParticipants} max` : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {quest.xpReward} XP
                        </span>
                        {quest.deadline && (
                          <span className="flex items-center gap-1">
                            <CalendarClock className="h-3 w-3" />
                            {new Date(quest.deadline).toLocaleDateString()}
                          </span>
                        )}
                        {quest.adminNotes && quest.adminNotes.length > 0 && (
                          <span className="flex items-center gap-1 text-amber-600">
                            <StickyNote className="h-3 w-3" />
                            {quest.adminNotes.length} note
                            {quest.adminNotes.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        <span className="capitalize">
                          {quest.questCategory.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col">
                      <Select
                        value={quest.status}
                        onValueChange={(value) => handleStatusChange(quest.id, value)}
                        disabled={changingStatusId === quest.id}
                      >
                        <SelectTrigger className="h-8 w-[140px] text-xs">
                          {changingStatusId === quest.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <ChevronDown className="mr-1 h-3 w-3" />
                              Change status
                            </>
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => openNoteDialog(quest)}
                      >
                        <StickyNote className="h-3 w-3" />
                        Notes
                      </Button>

                      <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                        <Link href={`/dashboard/company/quests/${quest.id}`}>
                          <Edit className="h-3 w-3" />
                          View
                        </Link>
                      </Button>

                      {quest.status !== 'cancelled' && quest.status !== 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs text-red-600 hover:border-red-300 hover:text-red-700"
                          onClick={() => handleCancelQuest(quest.id)}
                        >
                          <XCircle className="h-3 w-3" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!noteQuest} onOpenChange={(open) => !open && setNoteQuest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-amber-500" />
              Observation Notes
            </DialogTitle>
            <p className="truncate text-sm text-muted-foreground">{noteQuest?.title}</p>
          </DialogHeader>

          <div className="max-h-[280px] space-y-3 overflow-y-auto py-1">
            {(noteQuest?.adminNotes ?? []).length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No notes yet. Add your first observation below.
              </p>
            ) : (
              (noteQuest?.adminNotes ?? []).map((note) => (
                <div key={note.id} className="space-y-1 rounded-lg border bg-amber-50/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-amber-800">{note.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{note.note}</p>
                </div>
              ))
            )}
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="new-note" className="text-sm">
              Add observation
            </Label>
            <Textarea
              id="new-note"
              placeholder={'e.g. "Intern asked what deliverables meant - need a tooltip"'}
              rows={3}
              value={newNoteText}
              onChange={(event) => setNewNoteText(event.target.value)}
              maxLength={2000}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteQuest(null)}>
              Close
            </Button>
            <Button onClick={handleAddNote} disabled={savingNote || !newNoteText.trim()}>
              {savingNote ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <StickyNote className="h-4 w-4" />
              )}
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
