// components/company/QuestForm.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

interface QuestFormData {
  title: string;
  description: string;
  detailedDescription: string;
  questType: string;
  difficulty: string;
  xpReward: number;
  skillPointsReward: number;
  monetaryReward: number;
  requiredSkills: string[];
  requiredRank: string;
  maxParticipants: number;
  questCategory: string;
  deadline: string;
}

interface QuestFormProps {
  onSubmit: (data: QuestFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<QuestFormData>;
  submitLabel?: string;
  loading?: boolean;
}

const defaultFormData: QuestFormData = {
  title: '',
  description: '',
  detailedDescription: '',
  questType: 'commission',
  difficulty: 'D',
  xpReward: 500,
  skillPointsReward: 0,
  monetaryReward: 0,
  requiredSkills: [],
  requiredRank: 'F',
  maxParticipants: 1,
  questCategory: 'frontend',
  deadline: ''
};

export function QuestForm({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = 'Create Quest',
  loading = false
}: QuestFormProps) {
  const [formData, setFormData] = useState<QuestFormData>({
    ...defaultFormData,
    ...initialData
  });
  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    if (skillInput.trim() && !formData.requiredSkills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        requiredSkills: [...formData.requiredSkills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    const updatedSkills = [...formData.requiredSkills];
    updatedSkills.splice(index, 1);
    setFormData({
      ...formData,
      requiredSkills: updatedSkills
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{submitLabel}</CardTitle>
        <CardDescription>Post a new quest for adventurers to complete</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Quest Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter quest title..."
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Short Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of the quest..."
                rows={3}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Detailed Description</label>
              <Textarea
                value={formData.detailedDescription}
                onChange={(e) => setFormData({...formData, detailedDescription: e.target.value})}
                placeholder="Detailed requirements, specifications, etc...."
                rows={5}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Quest Type</label>
                <Select
                  value={formData.questType}
                  onValueChange={(value) => setFormData({...formData, questType: value})}
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
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData({...formData, difficulty: value})}
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
                  value={formData.xpReward}
                  onChange={(e) => setFormData({...formData, xpReward: parseInt(e.target.value) || 0})}
                  placeholder="XP to reward"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Skill Points Reward</label>
                <Input
                  type="number"
                  value={formData.skillPointsReward}
                  onChange={(e) => setFormData({...formData, skillPointsReward: parseInt(e.target.value) || 0})}
                  placeholder="Skill Points to reward"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Monetary Reward ($)</label>
                <Input
                  type="number"
                  value={formData.monetaryReward}
                  onChange={(e) => setFormData({...formData, monetaryReward: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Required Rank</label>
                <Select
                  value={formData.requiredRank}
                  onValueChange={(value) => setFormData({...formData, requiredRank: value})}
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
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value) || 1})}
                  placeholder="Max participants (1 for solo quests)"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Quest Category</label>
              <Select
                value={formData.questCategory}
                onValueChange={(value) => setFormData({...formData, questCategory: value})}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <Button type="button" onClick={addSkill}>Add</Button>
              </div>

              {formData.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.requiredSkills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center">
                      {skill}
                      <button
                        type="button"
                        className="ml-2 rounded-full hover:bg-destructive/20 p-1"
                        onClick={() => removeSkill(index)}
                      >
                        <X className="h-3 w-3" />
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
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={!formData.title || !formData.description || loading}
              >
                <Plus className="h-4 w-4 mr-2" />
                {submitLabel}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
