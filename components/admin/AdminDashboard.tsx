'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import {
  Users, Target, Trophy, Search, CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

/* ============================
   TYPES
============================ */

interface User {
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
}

interface Quest {
  id: string;
  title: string;
  description: string;
  status: string;
  difficulty: string;
  xpReward: number;
  skillPointsReward: number;
  monetaryReward?: number;
  questCategory: string;
  createdAt: string;
}

/* ============================
   HELPERS
============================ */

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString();

const getRankColor = (rank: string) => {
  switch (rank) {
    case 'S': return 'text-yellow-400';
    case 'A': return 'text-red-400';
    case 'B': return 'text-blue-400';
    case 'C': return 'text-green-400';
    case 'D': return 'text-gray-400';
    case 'E': return 'text-purple-400';
    case 'F': return 'text-gray-500';
    default: return 'text-gray-400';
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'available': return 'default';
    case 'completed': return 'secondary';
    case 'cancelled': return 'destructive';
    default: return 'outline';
  }
};

/* ============================
   COMPONENT
============================ */

export default function AdminDashboard() {

  /* ---------- STATE ---------- */

  const [activeTab, setActiveTab] = useState('users');

  const [users, setUsers] = useState<User[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);

  const [loading, setLoading] = useState(true);

  const [userSearch, setUserSearch] = useState('');
  const [questSearch, setQuestSearch] = useState('');

  const [roleFilter, setRoleFilter] = useState('all');
  const [rankFilter, setRankFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [sortKey, setSortKey] = useState<'xp' | 'createdAt'>('xp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

  /* ---------- FETCH ---------- */

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?search=${userSearch}`);
      const data = await res.json();
      if (!data.success) throw new Error();
      setUsers(data.users);
    } catch {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuests = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/quests?search=${questSearch}`);
      const data = await res.json();
      if (!data.success) throw new Error();
      setQuests(data.quests);
    } catch {
      toast.error('Failed to fetch quests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, userSearch]);

  useEffect(() => {
    if (activeTab === 'quests') fetchQuests();
  }, [activeTab, questSearch]);

  /* ---------- FILTER + SORT ---------- */

  const processedUsers = useMemo(() => {
    let data = [...users];

    if (roleFilter !== 'all') data = data.filter(u => u.role === roleFilter);
    if (rankFilter !== 'all') data = data.filter(u => u.rank === rankFilter);

    data.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (sortOrder === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    return data;
  }, [users, roleFilter, rankFilter, sortKey, sortOrder]);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * limit;
    return processedUsers.slice(start, start + limit);
  }, [processedUsers, page]);

  const processedQuests = useMemo(() => {
    let data = [...quests];
    if (statusFilter !== 'all') data = data.filter(q => q.status === statusFilter);
    return data;
  }, [quests, statusFilter]);

  /* ---------- ACTIONS ---------- */

  const handleUserAction = async (id: string, type: string) => {
    await fetch('/api/admin/users', {
      method: 'PUT',
      body: JSON.stringify({ userId: id, action: type }),
    });
    fetchUsers();
  };

  const handleQuestAction = async (id: string, type: string) => {
    await fetch('/api/admin/quests', {
      method: 'PUT',
      body: JSON.stringify({ questId: id, action: type }),
    });
    fetchQuests();
  };

  /* ---------- ANALYTICS ---------- */

  const analytics = useMemo(() => ({
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    verifiedUsers: users.filter(u => u.isVerified).length,
    totalQuests: quests.length,
    completed: quests.filter(q => q.status === 'completed').length,
  }), [users, quests]);

  /* ============================
     UI
  ============================ */

  return (
    <div className="container mx-auto py-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage guild ecosystem
        </p>
      </div>

      {/* TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>

        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="quests">Quests</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* USERS TAB */}
        <TabsContent value="users">

          <Card>

            <CardHeader>

              <div className="flex justify-between">

                <CardTitle>Users</CardTitle>

                <Input
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-64"
                />

              </div>

              {/* Filters */}
              <div className="flex gap-2 mt-3">
                {['all','admin','company','adventurer'].map(r => (
                  <Button key={r} size="sm" onClick={() => setRoleFilter(r)}>
                    {r}
                  </Button>
                ))}
              </div>

            </CardHeader>

            <CardContent>

              {loading ? (
                <p className="text-center py-10">Loading...</p>
              ) : (

                <Table>

                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Rank</TableHead>
                      <TableHead>XP</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>

                  <TableBody>

                    {paginatedUsers.map(u => (
                      <TableRow key={u.id} onClick={() => setSelectedUser(u)}>

                        <TableCell>{u.name}</TableCell>

                        <TableCell>
                          <Badge>{u.role}</Badge>
                        </TableCell>

                        <TableCell className={getRankColor(u.rank)}>
                          {u.rank}
                        </TableCell>

                        <TableCell>{u.xp}</TableCell>

                        <TableCell>
                          {u.isVerified
                            ? <CheckCircle className="text-green-500"/>
                            : <XCircle className="text-red-500"/>
                          }
                        </TableCell>

                        <TableCell>
                          <Button size="sm" onClick={(e) => {
                            e.stopPropagation();
                            handleUserAction(u.id, 'verify');
                          }}>
                            Verify
                          </Button>
                        </TableCell>

                      </TableRow>
                    ))}

                  </TableBody>

                </Table>

              )}

              {/* PAGINATION */}
              <div className="flex justify-between mt-4">
                <Button onClick={() => setPage(p => Math.max(1, p - 1))}>
                  Prev
                </Button>
                <Button onClick={() => setPage(p => p + 1)}>
                  Next
                </Button>
              </div>

            </CardContent>

          </Card>

        </TabsContent>

        {/* QUEST TAB */}
        <TabsContent value="quests">

          <Card>

            <CardHeader>

              <div className="flex justify-between">
                <CardTitle>Quests</CardTitle>

                <Input
                  placeholder="Search quests..."
                  value={questSearch}
                  onChange={(e) => setQuestSearch(e.target.value)}
                  className="w-64"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 mt-2">
                {['all','available','completed','cancelled'].map(s => (
                  <Button key={s} size="sm" onClick={() => setStatusFilter(s)}>
                    {s}
                  </Button>
                ))}
              </div>

            </CardHeader>

            <CardContent>

              <Table>

                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>XP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>

                <TableBody>

                  {processedQuests.map(q => (
                    <TableRow key={q.id} onClick={() => setSelectedQuest(q)}>

                      <TableCell>{q.title}</TableCell>

                      <TableCell className={getRankColor(q.difficulty)}>
                        {q.difficulty}
                      </TableCell>

                      <TableCell>{q.xpReward}</TableCell>

                      <TableCell>
                        <Badge variant={getStatusBadge(q.status)}>
                          {q.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Button size="sm" onClick={(e) => {
                          e.stopPropagation();
                          handleQuestAction(q.id, 'activate');
                        }}>
                          Activate
                        </Button>
                      </TableCell>

                    </TableRow>
                  ))}

                </TableBody>

              </Table>

            </CardContent>

          </Card>

        </TabsContent>

        {/* ANALYTICS */}
        <TabsContent value="analytics">

          <div className="grid md:grid-cols-4 gap-4">

            <Card><CardContent className="p-4">Users: {analytics.totalUsers}</CardContent></Card>
            <Card><CardContent className="p-4">Active: {analytics.activeUsers}</CardContent></Card>
            <Card><CardContent className="p-4">Verified: {analytics.verifiedUsers}</CardContent></Card>
            <Card><CardContent className="p-4">Completed: {analytics.completed}</CardContent></Card>

          </div>

        </TabsContent>

      </Tabs>

      {/* USER MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>{selectedUser.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Email: {selectedUser.email}</p>
              <p>XP: {selectedUser.xp}</p>
              <p>Joined: {formatDate(selectedUser.createdAt)}</p>
              <Button onClick={() => setSelectedUser(null)}>Close</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* QUEST MODAL */}
      {selectedQuest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>{selectedQuest.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{selectedQuest.description}</p>
              <p>XP: {selectedQuest.xpReward}</p>
              <Button onClick={() => setSelectedQuest(null)}>Close</Button>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}