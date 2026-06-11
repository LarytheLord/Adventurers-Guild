'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Search,
  Copy,
  Check,
  ShieldCheck,
  ShieldOff,
  UserCog,
  UserX,
  UserCheck,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApiFetch } from '@/lib/hooks';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import { RANK_TO_TIER } from '@/lib/ranks';
import { RANK_COLORS } from '@/lib/quest-constants';

interface AdventurerProfile {
  specialization: string | null;
  primarySkills: string[];
  availabilityStatus: string | null;
  questCompletionRate: number;
  totalQuestsCompleted: number;
}

interface CompanyProfile {
  companyName: string | null;
  companyWebsite: string | null;
  isVerified: boolean;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  rank: string;
  xp: number;
  skillPoints: number;
  level: number;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  bio: string | null;
  location: string | null;
  github: string | null;
  adventurerProfile: AdventurerProfile | null;
  companyProfile: CompanyProfile | null;
}

type ApiResponse = {
  users: UserItem[];
  success: boolean;
};

const ROLE_BADGE: Record<string, string> = {
  adventurer: 'bg-blue-50 text-blue-700 border-blue-200',
  company: 'bg-violet-50 text-violet-700 border-violet-200',
  admin: 'bg-orange-50 text-orange-700 border-orange-200',
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [submittedRole, setSubmittedRole] = useState('all');

  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editVerified, setEditVerified] = useState(false);
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const endpoint = useMemo(() => {
    const params = new URLSearchParams({ limit: '100' });
    if (submittedRole !== 'all') params.set('role', submittedRole);
    if (submittedSearch.trim()) params.set('search', submittedSearch.trim());
    return `/api/admin/users?${params.toString()}`;
  }, [submittedSearch, submittedRole]);

  const { data, loading, error, refetch } = useApiFetch<ApiResponse>(endpoint);

  const users = data?.users ?? [];

  const stats = useMemo(() => ({
    total: users.length,
    adventurers: users.filter((u) => u.role === 'adventurer').length,
    companies: users.filter((u) => u.role === 'company').length,
    active: users.filter((u) => u.isActive).length,
  }), [users]);

  function handleSearch() {
    setSubmittedSearch(search);
    setSubmittedRole(roleFilter);
  }

  function openEdit(user: UserItem) {
    setEditUser(user);
    setEditRole(user.role);
    setEditVerified(user.isVerified);
    setEditActive(user.isActive);
  }

  async function handleSave() {
    if (!editUser) return;
    setSaving(true);
    try {
      const res = await fetchWithAuth('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editUser.id,
          role: editRole !== editUser.role ? editRole : undefined,
          isVerified: editVerified !== editUser.isVerified ? editVerified : undefined,
          isActive: editActive !== editUser.isActive ? editActive : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to update user');
        return;
      }
      toast.success('User updated');
      setEditUser(null);
      refetch?.();
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  }

  async function copyId(id: string) {
    await navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-slate-500" asChild>
            <Link href="/admin">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Admin
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            View, edit roles, verify and manage all platform accounts
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Adventurers', value: stats.adventurers },
          { label: 'Companies', value: stats.companies },
          { label: 'Active', value: stats.active },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="adventurer">Adventurers</SelectItem>
            <SelectItem value="company">Companies</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} variant="outline">
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">Failed to load users.</p>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
          <p className="text-sm text-muted-foreground">No users found.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/70 bg-white overflow-hidden shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
          <div className="divide-y divide-slate-100">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-4 px-5 py-4">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="text-xs font-semibold bg-slate-100 text-slate-600">
                    {user.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                    {!user.isActive && (
                      <Badge variant="outline" className="text-[10px] py-0 bg-red-50 text-red-600 border-red-200">
                        Inactive
                      </Badge>
                    )}
                    {user.isVerified && (
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                    {user.lastLoginAt && (
                      <> · Last seen {new Date(user.lastLoginAt).toLocaleDateString()}</>
                    )}
                    {user.adventurerProfile && (
                      <> · {user.adventurerProfile.totalQuestsCompleted} quests completed</>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <Badge variant="outline" className={`text-[10px] py-0 ${RANK_COLORS[user.rank] ?? ''}`}>
                    {RANK_TO_TIER[user.rank] ?? user.rank}
                  </Badge>
                  <span className="text-[11px] text-slate-500">{user.xp} XP</span>
                  <Badge variant="outline" className={`text-[10px] py-0 ${ROLE_BADGE[user.role] ?? ''}`}>
                    {user.role}
                  </Badge>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700"
                    title="Copy user ID"
                    onClick={() => copyId(user.id)}
                  >
                    {copiedId === user.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => openEdit(user)}
                  >
                    <UserCog className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border bg-slate-50 p-3">
                <p className="text-sm font-semibold">{editUser.name}</p>
                <p className="text-xs text-slate-500">{editUser.email}</p>
                <p className="text-xs text-slate-400 mt-1 font-mono">{editUser.id}</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Role</Label>
                <Select value={editRole} onValueChange={setEditRole} disabled={editUser.role === 'admin'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adventurer">Adventurer</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {editUser.role === 'admin' && (
                  <p className="text-xs text-slate-400">Admin role cannot be changed.</p>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Verified</p>
                  <p className="text-xs text-slate-500">Verified accounts get a checkmark badge</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className={editVerified ? 'border-emerald-300 text-emerald-700' : ''}
                  onClick={() => setEditVerified((v) => !v)}
                >
                  {editVerified ? (
                    <><ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Verified</>
                  ) : (
                    <><ShieldOff className="mr-1.5 h-3.5 w-3.5" /> Unverified</>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Account status</p>
                  <p className="text-xs text-slate-500">Inactive users cannot log in</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className={editActive ? 'border-emerald-300 text-emerald-700' : 'border-red-300 text-red-600'}
                  onClick={() => setEditActive((v) => !v)}
                >
                  {editActive ? (
                    <><UserCheck className="mr-1.5 h-3.5 w-3.5" /> Active</>
                  ) : (
                    <><UserX className="mr-1.5 h-3.5 w-3.5" /> Inactive</>
                  )}
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
