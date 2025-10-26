// components/company/CompanyPortal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Target,
  Edit,
  Eye,
  Trash2,
  Plus,
  TrendingUp,
  Users,
  Coins
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface Quest {
  id: string;
  title: string;
  description: string;
  detailed_description?: string;
  quest_type: string;
  status: string;
  difficulty: string;
  xp_reward: number;
  skill_points_reward: number;
  monetary_reward?: number;
  required_skills: string[];
  required_rank?: string;
  max_participants?: number;
  quest_category: string;
  company_id: string;
  created_at: string;
  updated_at: string;
  deadline?: string;
}

interface CompanyPortalProps {
  companyId: string;
}

export default function CompanyPortal({ companyId }: CompanyPortalProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [companyQuests, setCompanyQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuest, setNewQuest] = useState({
    title: '',
    description: '',
    detailed_description: '',
    quest_type: 'commission',
    difficulty: 'D',
    xp_reward: 500,
    skill_points_reward: 0,
    monetary_reward: 0,
    required_skills: [] as string[],
    required_rank: 'F',
    max_participants: 1,
    quest_category: 'frontend',
    deadline: ''
  });
  const [skillInput, setSkillInput] = useState('');

  // Fetch company quests
  useEffect(() => {
    const fetchCompanyQuests = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/company/quests?company_id=${companyId}`);
        const data = await response.json();
        
        if (data.success) {
          setCompanyQuests(data.quests);
        } else {
          toast.error(data.error || 'Failed to fetch quests');
        }
      } catch (error) {
        console.error('Error fetching company quests:', error);
        toast.error('Error fetching quests');
      } finally {
        setLoading(false);
      }
    };

    if (companyId && activeTab === 'quests') {
      fetchCompanyQuests();
    } else if (companyId && activeTab === 'dashboard') {
      fetchCompanyQuests(); // Also fetch for dashboard to show stats
    }
  }, [activeTab, companyId]);

  const handleCreateQuest = async () => {
    try {
      const response = await fetch('/api/company/quests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newQuest,
          company_id: companyId,
          required_skills: newQuest.required_skills.filter(skill => skill.trim() !== '')
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Quest created successfully');
        setNewQuest({
          title: '',
          description: '',
          detailed_description: '',
          quest_type: 'commission',
          difficulty: 'D',
          xp_reward: 500,
          skill_points_reward: 0,
          monetary_reward: 0,
          required_skills: [],
          required_rank: 'F',
          max_participants: 1,
          quest_category: 'frontend',
          deadline: ''
        });
        
        // Refresh the quest list
        const updatedQuestsResponse = await fetch(`/api/company/quests?company_id=${companyId}`);
        const updatedQuestsData = await updatedQuestsResponse.json();
        
        if (updatedQuestsData.success) {
          setCompanyQuests(updatedQuestsData.quests);
        }
      } else {
        toast.error(data.error || 'Failed to create quest');
      }
    } catch (error) {
      console.error('Error creating quest:', error);
      toast.error('Error creating quest');
    }
  };

  const handleUpdateQuest = async (questId: string, updates: Partial<Quest>) => {
    try {
      const response = await fetch('/api/company/quests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quest_id: questId,
          company_id: companyId,
          ...updates
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Quest updated successfully');
        // Refresh the quest list
        const updatedQuestsResponse = await fetch(`/api/company/quests?company_id=${companyId}`);
        const updatedQuestsData = await updatedQuestsResponse.json();
        
        if (updatedQuestsData.success) {
          setCompanyQuests(updatedQuestsData.quests);
        }
      } else {
        toast.error(data.error || 'Failed to update quest');
      }
    } catch (error) {
      console.error('Error updating quest:', error);
      toast.error('Error updating quest');
    }
  };

  const handleDeleteQuest = async (questId: string) => {
    if (!window.confirm('Are you sure you want to cancel this quest? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch('/api/company/quests', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quest_id: questId,
          company_id: companyId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Quest cancelled successfully');
        // Refresh the quest list
        setCompanyQuests(companyQuests.filter(quest => quest.id !== questId));
      } else {
        toast.error(data.error || 'Failed to cancel quest');
      }
    } catch (error) {
      console.error('Error cancelling quest:', error);
      toast.error('Error cancelling quest');
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !newQuest.required_skills.includes(skillInput.trim())) {
      setNewQuest({
        ...newQuest,
        required_skills: [...newQuest.required_skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    const updatedSkills = [...newQuest.required_skills];
    updatedSkills.splice(index, 1);
    setNewQuest({
      ...newQuest,
      required_skills: updatedSkills
    });
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

  // Calculate company stats
  const totalQuests = companyQuests.length;
  const activeQuests = companyQuests.filter(q => 
    q.status === 'available' || q.status === 'in_progress'
  ).length;
  const completedQuests = companyQuests.filter(q => q.status === 'completed').length;
  const totalSpent = companyQuests.reduce((sum, quest) => sum + (quest.monetary_reward || 0), 0);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Company Portal</h1>
        <p className="text-muted-foreground">Manage your quests and projects</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="quests">Manage Quests</TabsTrigger>
          <TabsTrigger value="create">Create Quest</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Quests</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalQuests}</div>
                <p className="text-xs text-muted-foreground">+{totalQuests} this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Quests</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeQuests}</div>
                <p className="text-xs text-muted-foreground">Currently running</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Quests</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedQuests}</div>
                <p className="text-xs text-muted-foreground">Successfully delivered</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">On platform</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Quests</CardTitle>
              <CardDescription>Your latest posted quests</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : companyQuests.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No quests yet</h3>
                  <p className="text-muted-foreground">Create your first quest to get started</p>
                  <Button 
                    className="mt-4"
                    onClick={() => setActiveTab('create')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Quest
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quest</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rewards</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companyQuests.slice(0, 5).map((quest) => (
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
                          <Badge variant={getQuestStatusBadgeVariant(quest.status)}>
                            {quest.status.charAt(0).toUpperCase() + quest.status.slice(1)}
                          </Badge>
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
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>1/{quest.max_participants || 1}</span>
                          </div>
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
                              onClick={() => console.log('View quest:', quest.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                // Set quest data for editing if we had an edit form
                                console.log('Edit quest:', quest.id);
                              }}
                            >
                              <Edit className="h-4 w-4" />
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
                  <CardTitle>Manage Quests</CardTitle>
                  <CardDescription>View and manage all your posted quests</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : companyQuests.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No quests yet</h3>
                  <p className="text-muted-foreground">Create your first quest to get started</p>
                  <Button 
                    className="mt-4"
                    onClick={() => setActiveTab('create')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Quest
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quest</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Rewards</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companyQuests.map((quest) => (
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
                          <Badge variant={getQuestStatusBadgeVariant(quest.status)}>
                            {quest.status.charAt(0).toUpperCase() + quest.status.slice(1)}
                          </Badge>
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
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>1/{quest.max_participants || 1}</span>
                          </div>
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
                              onClick={() => console.log('View quest details:', quest.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                // In a real implementation, we would set the quest for editing
                                console.log('Edit quest:', quest.id);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteQuest(quest.id)}
                            >
                              <Trash2 className="h-4 w-4" />
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

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Quest</CardTitle>
              <CardDescription>Post a new quest for adventurers to complete</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Quest Title</label>
                  <Input
                    value={newQuest.title}
                    onChange={(e) => setNewQuest({...newQuest, title: e.target.value})}
                    placeholder="Enter quest title..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Short Description</label>
                  <Textarea
                    value={newQuest.description}
                    onChange={(e) => setNewQuest({...newQuest, description: e.target.value})}
                    placeholder="Brief description of the quest..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Detailed Description</label>
                  <Textarea
                    value={newQuest.detailed_description}
                    onChange={(e) => setNewQuest({...newQuest, detailed_description: e.target.value})}
                    placeholder="Detailed requirements, specifications, etc...."
                    rows={5}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Quest Type</label>
                    <Select 
                      value={newQuest.quest_type} 
                      onValueChange={(value) => setNewQuest({...newQuest, quest_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="commission">Commission</SelectItem>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="bug_bounty">Bug Bounty</SelectItem>
                        <SelectItem value="code_refactor">Code Refactor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Difficulty</label>
                    <Select 
                      value={newQuest.difficulty} 
                      onValueChange={(value) => setNewQuest({...newQuest, difficulty: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="F">F-Rank (Beginner)</SelectItem>
                        <SelectItem value="E">E-Rank (Beginner+)</SelectItem>
                        <SelectItem value="D">D-Rank (Novice)</SelectItem>
                        <SelectItem value="C">C-Rank (Intermediate)</SelectItem>
                        <SelectItem value="B">B-Rank (Advanced)</SelectItem>
                        <SelectItem value="A">A-Rank (Expert)</SelectItem>
                        <SelectItem value="S">S-Rank (Master)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">XP Reward</label>
                    <Input
                      type="number"
                      value={newQuest.xp_reward}
                      onChange={(e) => setNewQuest({...newQuest, xp_reward: parseInt(e.target.value) || 0})}
                      placeholder="XP to reward"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Skill Points Reward</label>
                    <Input
                      type="number"
                      value={newQuest.skill_points_reward}
                      onChange={(e) => setNewQuest({...newQuest, skill_points_reward: parseInt(e.target.value) || 0})}
                      placeholder="Skill Points to reward"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Monetary Reward ($)</label>
                    <Input
                      type="number"
                      value={newQuest.monetary_reward}
                      onChange={(e) => setNewQuest({...newQuest, monetary_reward: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Required Rank</label>
                    <Select 
                      value={newQuest.required_rank} 
                      onValueChange={(value) => setNewQuest({...newQuest, required_rank: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="F">F-Rank</SelectItem>
                        <SelectItem value="E">E-Rank</SelectItem>
                        <SelectItem value="D">D-Rank</SelectItem>
                        <SelectItem value="C">C-Rank</SelectItem>
                        <SelectItem value="B">B-Rank</SelectItem>
                        <SelectItem value="A">A-Rank</SelectItem>
                        <SelectItem value="S">S-Rank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Max Participants</label>
                    <Input
                      type="number"
                      value={newQuest.max_participants}
                      onChange={(e) => setNewQuest({...newQuest, max_participants: parseInt(e.target.value) || 1})}
                      placeholder="Max participants (1 for solo quests)"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Quest Category</label>
                  <Select 
                    value={newQuest.quest_category} 
                    onValueChange={(value) => setNewQuest({...newQuest, quest_category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frontend">Frontend</SelectItem>
                      <SelectItem value="backend">Backend</SelectItem>
                      <SelectItem value="fullstack">Full Stack</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="ai_ml">AI/ML</SelectItem>
                      <SelectItem value="devops">DevOps</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="qa">QA</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="data_science">Data Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Required Skills</label>
                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Add a required skill (e.g. React, Node.js)..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                    />
                    <Button type="button" onClick={addSkill}>Add</Button>
                  </div>
                  
                  {newQuest.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newQuest.required_skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center">
                          {skill}
                          <button 
                            type="button" 
                            className="ml-2 rounded-full hover:bg-destructive/20 p-1"
                            onClick={() => removeSkill(index)}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Deadline (Optional)</label>
                  <Input
                    type="date"
                    value={newQuest.deadline}
                    onChange={(e) => setNewQuest({...newQuest, deadline: e.target.value})}
                  />
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleCreateQuest}
                  disabled={!newQuest.title || !newQuest.description}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Quest
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}