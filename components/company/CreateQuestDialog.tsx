'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { X } from 'lucide-react'
import { MockAuthService } from '@/lib/mockAuth'
import { MockDataService, Quest } from '@/lib/mockData'

interface CreateQuestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onQuestCreated: (quest: Quest) => void
}

export function CreateQuestDialog({ open, onOpenChange, onQuestCreated }: CreateQuestDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    difficulty: 'C' as 'F' | 'D' | 'C' | 'B' | 'A' | 'S',
    budget: '',
    deadline: '',
    tags: [] as string[],
    newTag: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const user = MockAuthService.getCurrentUser()
      if (!user) throw new Error('Not authenticated')

      // Calculate XP reward based on difficulty
      const xpRewards = { F: 200, D: 400, C: 600, B: 800, A: 1200, S: 2000 }
      const skillRewards = {
        'React Mastery': Math.floor(xpRewards[formData.difficulty] * 0.3),
        'TypeScript': Math.floor(xpRewards[formData.difficulty] * 0.2)
      }

      const questData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        difficulty: formData.difficulty,
        xp_reward: xpRewards[formData.difficulty],
        skill_rewards: skillRewards,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        deadline: formData.deadline || undefined,
        status: 'active' as const,
        company_id: user.id,
        company_name: user.company_name || user.name,
        tags: formData.tags
      }

      const newQuest = MockDataService.createQuest(questData)
      onQuestCreated(newQuest)
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        requirements: '',
        difficulty: 'C',
        budget: '',
        deadline: '',
        tags: [],
        newTag: ''
      })
    } catch (error) {
      console.error('Failed to create quest:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.newTag.trim()],
        newTag: ''
      })
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Quest</DialogTitle>
          <DialogDescription>
            Post a new quest to find talented adventurers for your project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Quest Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Build React Dashboard Component"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what you need built, the goals, and any specific requirements..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Technical Requirements</Label>
            <Textarea
              id="requirements"
              placeholder="List the technical skills, frameworks, or tools required..."
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level *</Label>
              <Select 
                value={formData.difficulty} 
                onValueChange={(value: 'F' | 'D' | 'C' | 'B' | 'A' | 'S') => 
                  setFormData({ ...formData, difficulty: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="F">F-Rank (Beginner) - 200 XP</SelectItem>
                  <SelectItem value="D">D-Rank (Easy) - 400 XP</SelectItem>
                  <SelectItem value="C">C-Rank (Medium) - 600 XP</SelectItem>
                  <SelectItem value="B">B-Rank (Hard) - 800 XP</SelectItem>
                  <SelectItem value="A">A-Rank (Expert) - 1200 XP</SelectItem>
                  <SelectItem value="S">S-Rank (Master) - 2000 XP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget (USD)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="500"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline (Optional)</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Add a tag (e.g., React, API, Design)"
                value={formData.newTag}
                onChange={(e) => setFormData({ ...formData, newTag: e.target.value })}
                onKeyPress={handleKeyPress}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                    <span>{tag}</span>
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Quest'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}