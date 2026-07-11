'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowLeft, Search, Shield, Ban, CheckCircle, ChevronLeft, ChevronRight, Loader2, User as UserIcon, ArrowUpDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import { toast } from 'sonner';

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  role: string;
  rank: string;
  xp: number;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  bootcampLink: {
    id: string;
    cohort: string | null;
    bootcampTrack: string;
  } | null;
  companyProfile: {
    companyName: string;
    companyWebsite: string | null;
    isVerified: boolean;
  } | null;
}

export default function AdminUsersPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters and Pagination
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [track, setTrack] = useState('all');
  const [isVerified, setIsVerified] = useState('all');
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const limit = 15;

  // Moderation modal
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authStatus === 'unauthenticated') router.push('/login');
    if (authStatus === 'authenticated' && session?.user?.role !== 'admin') router.push('/dashboard');
  }, [authStatus, session, router]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const offset = (page - 1) * limit;
    
    let url = `/api/admin/users?limit=${limit}&offset=${offset}&sort=${sort}&order=${order}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (role !== 'all') url += `&role=${role}`;
    if (track !== 'all') url += `&track=${track}`;
    if (isVerified !== 'all') url += `&isVerified=${isVerified}`;

    try {
      const res = await fetchWithAuth(url);
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      }
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, limit, sort, order, search, role, track, isVerified]);

  // Reset page to 1 when filters or sort change
  useEffect(() => {
    setPage(1);
  }, [search, role, track, isVerified, sort, order]);

  // Debounced fetch when any dependency (including page) changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleUpdateStatus = async (userId: string, updates: { isActive?: boolean; isVerified?: boolean }) => {
    setSubmitting(true);
    try {
      const res = await fetchWithAuth('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      toast.success('User updated successfully');
      
      // Update local state without refetching completely
      setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u));
      if (selectedUser) setSelectedUser({ ...selectedUser, ...updates });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error updating user');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSort = (field: string) => {
    if (sort === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(field);
      setOrder('desc');
    }
    setPage(1);
  };

  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-slate-400 hover:text-slate-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <UserIcon className="w-6 h-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-slate-100">User Management</h1>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="text-xs text-slate-400 mb-1 block">Search Users</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input 
                    placeholder="Search name or email..." 
                    className="bg-slate-950 border-slate-800 pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full md:w-40">
                <label className="text-xs text-slate-400 mb-1 block">Role</label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-slate-950 border-slate-800">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="adventurer">Adventurer</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-40">
                <label className="text-xs text-slate-400 mb-1 block">Track</label>
                <Select value={track} onValueChange={setTrack}>
                  <SelectTrigger className="bg-slate-950 border-slate-800">
                    <SelectValue placeholder="All Tracks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tracks</SelectItem>
                    <SelectItem value="bootcamp">Bootcamp</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-40">
                <label className="text-xs text-slate-400 mb-1 block">Verification</label>
                <Select value={isVerified} onValueChange={setIsVerified}>
                  <SelectTrigger className="bg-slate-950 border-slate-800">
                    <SelectValue placeholder="Any Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Status</SelectItem>
                    <SelectItem value="true">Verified</SelectItem>
                    <SelectItem value="false">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-slate-800 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-950/50">
                  <TableRow className="border-slate-800 hover:bg-slate-900">
                    <TableHead>User</TableHead>
                    <TableHead>Role / Track</TableHead>
                    <TableHead className="cursor-pointer hover:text-slate-200" onClick={() => toggleSort('xp')}>
                      <div className="flex items-center gap-1">
                        Rank / XP
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-slate-200" onClick={() => toggleSort('createdAt')}>
                      <div className="flex items-center gap-1">
                        Joined
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-orange-500 mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                        No users found matching filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((u) => (
                      <TableRow key={u.id} className="border-slate-800 hover:bg-slate-800/50">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-200">{u.name || (u.companyProfile?.companyName) || 'Unnamed'}</span>
                            <span className="text-xs text-slate-500">{u.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 items-start">
                            <Badge variant="outline" className="text-xs border-slate-700 text-slate-300">
                              {u.role}
                            </Badge>
                            {u.role === 'adventurer' && (
                              <span className="text-xs text-slate-500">
                                {u.bootcampLink ? `Bootcamp (${u.bootcampLink.bootcampTrack})` : 'Intern'}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {u.role === 'adventurer' ? (
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">
                                {u.rank}
                              </span>
                              <span className="text-sm text-slate-400">{u.xp} XP</span>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-500">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-400">
                          {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 items-start">
                            {u.isActive ? (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-normal">Active</Badge>
                            ) : (
                              <Badge className="bg-red-500/10 text-red-400 border-red-500/20 font-normal">Suspended</Badge>
                            )}
                            {u.role === 'company' && (
                              u.isVerified ? (
                                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-normal mt-1">Verified</Badge>
                              ) : (
                                <Badge variant="outline" className="text-slate-500 border-slate-700 font-normal mt-1">Unverified</Badge>
                              )
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" className="text-orange-400 hover:text-orange-300 hover:bg-orange-400/10" onClick={() => setSelectedUser(u)}>
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-slate-500">
                Showing {users.length} users
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-slate-800 text-slate-300"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-slate-800 text-slate-300"
                  onClick={() => setPage(p => p + 1)}
                  disabled={users.length < limit}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Modal */}
      <Dialog open={!!selectedUser} onOpenChange={(o) => !o && setSelectedUser(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>Manage User</DialogTitle>
                <DialogDescription className="text-slate-400">
                  {selectedUser.name || selectedUser.email}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="bg-slate-950 rounded-lg p-4 space-y-2 text-sm border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email</span>
                    <span className="text-slate-200">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Role</span>
                    <span className="text-slate-200 capitalize">{selectedUser.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Joined</span>
                    <span className="text-slate-200">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-300">Account Access</h4>
                  <div className="flex gap-2">
                    {selectedUser.isActive ? (
                      <Button 
                        variant="outline" 
                        className="w-full border-red-800/50 text-red-400 hover:bg-red-950/40"
                        onClick={() => handleUpdateStatus(selectedUser.id, { isActive: false })}
                        disabled={submitting || selectedUser.role === 'admin'}
                      >
                        <Ban className="w-4 h-4 mr-2" /> Suspend Account
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full border-emerald-800/50 text-emerald-400 hover:bg-emerald-950/40"
                        onClick={() => handleUpdateStatus(selectedUser.id, { isActive: true })}
                        disabled={submitting}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Reactivate Account
                      </Button>
                    )}
                  </div>
                  {selectedUser.role === 'admin' && (
                    <p className="text-xs text-slate-500 text-center">Cannot suspend admin accounts.</p>
                  )}
                </div>

                {selectedUser.role === 'company' && !selectedUser.isVerified && (
                  <div className="space-y-2 border-t border-slate-800 pt-4 mt-2">
                    <h4 className="text-sm font-medium text-slate-300">Company Verification</h4>
                    <p className="text-xs text-slate-500 mb-2">Unverified companies cannot post public quests.</p>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                      onClick={() => handleUpdateStatus(selectedUser.id, { isVerified: true })}
                      disabled={submitting}
                    >
                      <Shield className="w-4 h-4 mr-2" /> Approve Company
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
