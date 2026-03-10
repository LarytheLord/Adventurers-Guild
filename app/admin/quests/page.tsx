'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { QUEST_STATUS_COLORS, QUEST_STATUS_LABELS, RANK_COLORS } from '@/lib/quest-constants';

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

export default function AdminQuestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [quests, setQuests] = useState<QuestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Note dialog — single source of truth
  const [noteQuest, setNoteQuest] = useState<QuestItem | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Status change
  const [changingStatusId, setChangingStatusId] = useState<string | null>(null);

  const stats = useMemo(() => ({
    total: quests.length,
    available: quests.filter(q => q.status === 'available').length,
    inProgress: quests.filter(q => q.status === 'in_progress').length,
    review: quests.filter(q => q.status === 'review').length,
    completed: quests.filter(q => q.status === 'completed').length,
  }), [quests]);

  const fetchQuests = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/admin/quests?${params}`);
      const data = await res.json();
      if (data.success) setQuests(data.quests || []);
    } catch {
      toast.error('Failed to load quests');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    if (status === 'authenticated') fetchQuests();
  }, [status, session, router, fetchQuests]);

  const handleStatusChange = async (questId: string, newStatus: string) => {
    setChangingStatusId(questId);
    try {
      const res = await fetch('/api/admin/quests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setQuests(prev => prev.map(q => q.id === questId ? { ...q, status: newStatus } : q));
        toast.success(`Quest status updated to ${QUEST_STATUS_LABELS[newStatus] ?? newStatus}`);
      } else {
        toast.error(data.error || 'Failed to update status');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setChangingStatusId(null);
    }
  };

  const openNoteDialog = (quest: QuestItem) => {
    setNoteQuest(quest);
    setNewNoteText('');
  };

  const handleAddNote = async () => {
    if (!noteQuest || !newNoteText.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch('/api/admin/quests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId: noteQuest.id, addNote: newNoteText.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        const updatedNotes = (data.quest.adminNotes as AdminNote[]) || [];
        setNoteQuest(prev => prev ? { ...prev, adminNotes: updatedNotes } : null);
        setQuests(prev => prev.map(q => q.id === noteQuest.id ? { ...q, adminNotes: updatedNotes } : q));
        setNewNoteText('');
        toast.success('Note saved');
      } else {
        toast.error(data.error || 'Failed to save note');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSavingNote(false);
    }
  };

  const handleCancelQuest = async (questId: string) => {
    if (!confirm('Cancel this quest? Adventurers with active assignments will be notified.')) return;
    try {
      const res = await fetch('/api/admin/quests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId }),
      });
      const data = await res.json();
      if (data.success) {
        setQuests(prev => prev.map(q => q.id === questId ? { ...q, status: 'cancelled' } : q));
        toast.success('Quest cancelled');
      } else {
        toast.error(data.error || 'Failed to cancel quest');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 space-y-6 max-w-7xl">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin"><ArrowLeft className="h-4 w-4" />Admin</Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Quest Management</h1>
              <p className="text-sm text-muted-foreground">Create, monitor and annotate all quests</p>
            </div>
          </div>
          <Button asChild>
            <Link href="/dashboard/company/create-quest">
              <Plus className="h-4 w-4" />
              Create Quest
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total', value: stats.total, icon: Target, color: 'text-slate-600' },
            { label: 'Available', value: stats.available, icon: CheckCircle, color: 'text-emerald-600' },
            { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-blue-600' },
            { label: 'Review', value: stats.review, icon: AlertCircle, color: 'text-amber-600' },
            { label: 'Completed', value: stats.completed, icon: Users, color: 'text-slate-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="p-4">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <p className="text-2xl font-bold mt-1">{value}</p>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quests..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchQuests()}
              className="pl-9"
            />
          </div>
          <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); }}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
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
          <Button variant="outline" onClick={fetchQuests}>
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>

        {/* Quest List */}
        {quests.length === 0 ? (
          <Card className="p-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg">No quests found</h3>
            <p className="text-muted-foreground mt-1 mb-6">Create the first quest for your interns to pick up.</p>
            <Button asChild>
              <Link href="/dashboard/company/create-quest"><Plus className="h-4 w-4" />Create Quest</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {quests.map(quest => (
              <Card key={quest.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base truncate">{quest.title}</h3>
                        <Badge className={QUEST_STATUS_COLORS[quest.status] ?? 'bg-slate-100 text-slate-700'} variant="secondary">
                          {QUEST_STATUS_LABELS[quest.status] ?? quest.status}
                        </Badge>
                        <Badge className={RANK_COLORS[quest.difficulty] ?? ''} variant="secondary">
                          {quest.difficulty}-Rank
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{quest.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {quest._count.assignments} applicant{quest._count.assignments !== 1 ? 's' : ''}
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
                            {quest.adminNotes.length} note{quest.adminNotes.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        <span className="capitalize">{quest.questCategory.replace('_', ' ')}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                      {/* Status change */}
                      <Select
                        value={quest.status}
                        onValueChange={val => handleStatusChange(quest.id, val)}
                        disabled={changingStatusId === quest.id}
                      >
                        <SelectTrigger className="h-8 text-xs w-[140px]">
                          {changingStatusId === quest.id
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <><ChevronDown className="h-3 w-3 mr-1" />Change status</>
                          }
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => openNoteDialog(quest)}>
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
                          className="h-8 text-xs text-red-600 hover:text-red-700 hover:border-red-300"
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

      {/* Observation Notes Dialog */}
      <Dialog open={!!noteQuest} onOpenChange={open => !open && setNoteQuest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-amber-500" />
              Observation Notes
            </DialogTitle>
            <p className="text-sm text-muted-foreground truncate">{noteQuest?.title}</p>
          </DialogHeader>

          {/* Existing notes */}
          <div className="space-y-3 max-h-[280px] overflow-y-auto py-1">
            {(noteQuest?.adminNotes ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No notes yet. Add your first observation below.</p>
            ) : (
              (noteQuest?.adminNotes ?? []).map(n => (
                <div key={n.id} className="rounded-lg border bg-amber-50/60 p-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-amber-800">{n.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(n.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{n.note}</p>
                </div>
              ))
            )}
          </div>

          {/* New note input */}
          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="new-note" className="text-sm">Add observation</Label>
            <Textarea
              id="new-note"
              placeholder={`e.g. "Intern asked what 'deliverables' meant — need a tooltip"`}
              rows={3}
              value={newNoteText}
              onChange={e => setNewNoteText(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteQuest(null)}>Close</Button>
            <Button onClick={handleAddNote} disabled={savingNote || !newNoteText.trim()}>
              {savingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <StickyNote className="h-4 w-4" />}
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
