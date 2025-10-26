// components/admin/AdminDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Target, 
  Trophy, 
  Calendar, 
  Search,
  Edit,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  rank: string;
  xp: number;
  skill_points: number;
  level: number;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login_at?: string;
  company_profiles?: {
    company_name: string;
    is_verified: boolean;
  };
  adventurer_profiles?: {
    specialization?: string;
    quest_completion_rate?: number;
    total_quests_completed?: number;
  };
}

interface Quest {
  id: string;
  title: string;
  description: string;
  quest_type: string;
  status: string;
  difficulty: string;
  xp_reward: number;
  skill_points_reward: number;
  monetary_reward?: number;
  required_rank?: string;
  quest_category: string;
  company_id: string;
  created_at: string;
  deadline?: string;
  users: {
    name: string;
    email: string;
    is_verified: boolean;
  };
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [questSearch, setQuestSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/users?search=${userSearch}`);
        const data = await response.json();
        
        if (data.success) {
          setUsers(data.users);
        } else {
          toast.error('Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Error fetching users');
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, userSearch]);

  // Fetch quests
  useEffect(() => {
    const fetchQuests = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/quests?search=${questSearch}`);
        const data = await response.json();
        
        if (data.success) {
          setQuests(data.quests);
        } else {
          toast.error('Failed to fetch quests');
        }
      } catch (error) {
        console.error('Error fetching quests:', error);
        toast.error('Error fetching quests');
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'quests') {
      fetchQuests();
    }
  }, [activeTab, questSearch]);

  const handleUserAction = async (userId: string, action: 'verify' | 'deactivate' | 'setRole', role?: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          ...(action === 'verify' && { is_verified: true }),
          ...(action === 'deactivate' && { is_active: false }),
          ...(action === 'setRole' && role && { role }),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('User updated successfully');
        // Refresh the user list
        const updatedUsersResponse = await fetch(`/api/admin/users?search=${userSearch}`);
        const updatedUsersData = await updatedUsersResponse.json();
        
        if (updatedUsersData.success) {
          setUsers(updatedUsersData.users);
        }
      } else {
        toast.error(data.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error updating user');
    }
  };

  const handleQuestAction = async (questId: string, action: 'activate' | 'deactivate' | 'cancel') => {
    try {
      const response = await fetch('/api/admin/quests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quest_id: questId,
          status: action === 'activate' ? 'available' : action === 'deactivate' ? 'draft' : 'cancelled',
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Quest updated successfully');
        // Refresh the quest list
        const updatedQuestsResponse = await fetch(`/api/admin/quests?search=${questSearch}`);
        const updatedQuestsData = await updatedQuestsResponse.json();
        
        if (updatedQuestsData.success) {
          setQuests(updatedQuestsData.quests);
        }
      } else {
        toast.error(data.error || 'Failed to update quest');
      }
    } catch (error) {
      console.error('Error updating quest:', error);
      toast.error('Error updating quest');
    }
  };

  const getUserRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'company': return 'secondary';
      case 'adventurer': return 'outline';
      default: return 'outline';
    }
  };

  const getQuestStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'in_progress': return 'secondary';
      case 'completed': return 'default';
      case 'draft': return 'outline';
      case 'cancelled': return 'destructive';
      case 'review': return 'secondary';
      default: return 'outline';
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'S': return 'text-yellow-500';
      case 'A': return 'text-red-500';
      case 'B': return 'text-blue-500';
      case 'C': return 'text-green-500';
      case 'D': return 'text-gray-500';
      case 'E': return 'text-purple-500';
      case 'F': return 'text-gray-300';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users, quests, and platform settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="quests">Quests</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Users Management</CardTitle>
                  <CardDescription>View and manage platform users</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search users..."
                      className="pl-8 w-full sm:w-64"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Rank</TableHead>
                      <TableHead>XP/SP</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              <span className="font-semibold">
                                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{user.name || 'N/A'}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getUserRoleBadgeVariant(user.role)}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={getRankColor(user.rank)}>{user.rank}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>XP: {user.xp.toLocaleString()}</div>
                            <div>SP: {user.skill_points.toLocaleString()}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {user.is_verified ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="capitalize">
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'verify')}
                              disabled={user.is_verified}
                            >
                              {user.is_verified ? 'Verified' : 'Verify'}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'deactivate')}
                              disabled={!user.is_active}
                            >
                              Deactivate
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quests" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Quests Management</CardTitle>
                  <CardDescription>View and manage platform quests</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search quests..."
                      className="pl-8 w-full sm:w-64"
                      value={questSearch}
                      onChange={(e) => setQuestSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quest</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Rewards</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quests.map((quest) => (
                      <TableRow key={quest.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-medium">{quest.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {quest.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{quest.users.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {quest.users.is_verified ? 'Verified' : 'Not Verified'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{quest.quest_category}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={getRankColor(quest.difficulty)}>{quest.difficulty}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>XP: {quest.xp_reward}</div>
                            {quest.skill_points_reward > 0 && (
                              <div>SP: {quest.skill_points_reward}</div>
                            )}
                            {quest.monetary_reward && (
                              <div>${quest.monetary_reward}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getQuestStatusBadgeVariant(quest.status)}>
                            {quest.status.charAt(0).toUpperCase() + quest.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(quest.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleQuestAction(quest.id, 'activate')}
                              disabled={quest.status === 'available'}
                            >
                              Activate
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleQuestAction(quest.id, 'cancel')}
                              disabled={quest.status === 'cancelled'}
                            >
                              Cancel
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Quests</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {quests.filter(q => q.status === 'available' || q.status === 'in_progress').length}
                </div>
                <p className="text-xs text-muted-foreground">+3 from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Quests</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {quests.filter(q => q.status === 'completed').length}
                </div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Completion Rate</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">76%</div>
                <p className="text-xs text-muted-foreground">+5% from last month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Platform Activity</CardTitle>
              <CardDescription>Recent activity on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium">New user registration</p>
                    <p className="text-sm text-muted-foreground">John Doe joined as an Adventurer</p>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    2 hours ago
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium">Quest completed</p>
                    <p className="text-sm text-muted-foreground">"API Integration" completed by Jane Smith</p>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    4 hours ago
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium">Company verified</p>
                    <p className="text-sm text-muted-foreground">TechCorp verified their account</p>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    1 day ago
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals for detailed views would go here */}
    </div>
  );
}